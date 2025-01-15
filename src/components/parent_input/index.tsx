import Inputs from "../input";
import { ChangeEvent, ChangeEventHandler, useState } from "react";
import Upload_button from "../upload_button";
import Buttons from "../general_button";
import Documentation from "../documentation";
import { DivButtons, DivInputs } from "./styled";

import { i_input_values, i_input_values_tokenized, i_input_errors, Transitions, errorCodes } from '../../types/types';


interface i_parent_input{
    onFileInputValues : (new_values : i_input_values, new_tokenized_values : i_input_values_tokenized, new_transitions : Transitions) => void;
    onFileInputDoc : (doc_value : string) => void;

    inputValues: i_input_values;
    inputTokenizedValues : i_input_values_tokenized;
    onChangeInputs: (inputs: i_input_values, inputs_tokenized: i_input_values_tokenized) => void;

    old_errors: i_input_errors;
    onChangeErrors: (errors: i_input_errors) => void;
}

const ParentInput = ({ onFileInputValues, onFileInputDoc, inputValues, inputTokenizedValues, onChangeInputs, old_errors, onChangeErrors }: i_parent_input) => {

      const tokenize = (input: string) => {
        return input
            .split(',')
            .map(token => token.trim())
            .filter(token => token.length > 0); 
      }

      const tokenize_inputs = (inputs: i_input_values) => {
        const result : Record<keyof i_input_values, string[]> = {
          states: [],
          init_state: [],
          final_states: [],
          in_alphabet: [],
          aux_alphabet: [],
          init_symbol: [],
          blank_symbol: []
        }

        // Os inputs 5 e 6 estao desnecessariamente sendo tokenizados, porque a forma como o simulador do Rogrigo funciona é que o primeiro caractere
        // desses inputs é considerado e o resto é simplesmente ignorado
        for (const key in inputs)
            result[key as keyof i_input_values] = tokenize(inputs[key as keyof i_input_values]);
        
        return result;
      }



      const hasUniqueTokens = (tokens: string[]): boolean => {
        const seen_tokens = new Set<string>();
    
        for (const token of tokens) {
            if (seen_tokens.has(token)) {
                return false; 
            }
            seen_tokens.add(token);
        }
    
        return true; 
    };

      /* Para o estado inicial, o simulador do Rodrigo mostra a mesma mensagem para as duas situacoes: haver mais de um estado inicial e o estado inicial
      nao estar no conjunto de  (mesmo se houver varios estados iniciais e eles estarem todos contidos no conjunto de estados a mensagem é:
      O estado inicial deve pertencer ao conjunto de estados!).  Isso talvez poderia ser dividido */

      const isInitialStateValid = (initial_state: string[], states: string[]) => {
        if (initial_state.length > 1)
          return false;

        return states.includes(initial_state[0]);
      }

      const areFinalStatesValid = (states: string[], final_states: string[]) => {
        for (const state of final_states){
          if(!states.includes(state) && state != "")
            return false;
        }

        return true;
      }

      const hasDisjointAlphabets = (alphabet: string[], aux_alphabet: string[]) => {
        const set = new Set(alphabet);

        for (const item of aux_alphabet) {
            if (set.has(item) && item != "") {
                return false; 
            }
        }
    
        return true;
      }


      const validate_inputs = (tokenized_inputs: i_input_values_tokenized) => {
        const newErrors = {...old_errors};

        newErrors.valid_initial_state = isInitialStateValid(tokenized_inputs.init_state, tokenized_inputs.states);
        newErrors.valid_final_states = areFinalStatesValid(tokenized_inputs.states, tokenized_inputs.final_states);
        newErrors.unique_states = hasUniqueTokens(tokenized_inputs.states);
        newErrors.unique_alphabet_symbols = hasUniqueTokens(tokenized_inputs.in_alphabet);
        newErrors.disjoint_alphabets = hasDisjointAlphabets(tokenized_inputs.in_alphabet, tokenized_inputs.aux_alphabet);

        newErrors.alphabet_does_not_contain_start = !tokenized_inputs.in_alphabet.includes(tokenized_inputs.init_symbol[0]);
        newErrors.alphabet_does_not_contain_blank = !tokenized_inputs.in_alphabet.includes(tokenized_inputs.blank_symbol[0]);

        newErrors.auxiliary_alphabet_does_not_contain_start = !tokenized_inputs.aux_alphabet.includes(tokenized_inputs.init_symbol[0]);
        newErrors.auxiliary_alphabet_does_not_contain_blank = !tokenized_inputs.aux_alphabet.includes(tokenized_inputs.blank_symbol[0]);
      
        onChangeErrors(newErrors)
      }


      const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newValues = {...inputValues, [name]: value};
        const newTokenizedValues = {...inputTokenizedValues, [name]: tokenize(value)};

        onChangeInputs(newValues, newTokenizedValues);
        validate_inputs(newTokenizedValues);
    
      };

      const validateTransition = (value:string, states:string[], alphabet:string[]) => {
      
        const value_tokenized =  value.split(',').map(token => token.trim()).filter(token => token.length > 0); 
              
          if(value_tokenized === null || value_tokenized.length == 0)
            return errorCodes.NoError;
      
          if(value_tokenized.length !== 3)
            return errorCodes.InvalidNumberOfParameters;
      
          if(!states.includes(value_tokenized[0]))
            return errorCodes.InvalidState; 
          
          if(!alphabet.includes(value_tokenized[2]))
            return errorCodes.InvalidSymbol;
      
          if(value_tokenized[1].toUpperCase() !== "L" && value_tokenized[1].toUpperCase() !== "R")
            return errorCodes.InvalidDirection;
      
          return errorCodes.NoError;

        }


      const handleFileUpload = (lines: string[]) => {
        const newInputs = {...inputValues};
        

        const ordem_leitura = ["in_alphabet", "aux_alphabet", "init_symbol", "blank_symbol", "states", "init_state", "final_states"];

        let i = 0;

        for(const key of ordem_leitura) {
            if(i >= lines.length)
                break;
            
            newInputs[key as keyof i_input_values] = lines[i]; 

            i = i + 1;
        }


        const newInputsTokenized = tokenize_inputs(newInputs);


        const transitions: Transitions = {};
        const table = tokenize(lines[i]);
        const alphabet = Array.from(new Set([newInputsTokenized.init_symbol[0], ...(newInputsTokenized.in_alphabet.filter((symbol) => symbol != "").concat(newInputsTokenized.aux_alphabet.filter((symbol) => symbol != ""))), newInputsTokenized.blank_symbol[0]]));
    

        for (let j = 0; j < table.length; j += 5) {
          const state = table[j];
          const symbol = table[j + 1];

          const next = `${table[j + 2]},${table[j + 3]},${table[j + 4]}`; // Desperdício, já que uma hora ou outra vamos ter que tokenizar isso. Mas parta garantir que a tabela esteja igual a como estava na versão anterior, deixa assim por enquanto

          if (!transitions[state]) {
            transitions[state] = {};
          }
      

          transitions[state][symbol] = {
            next: next,
            error: validateTransition(next, newInputsTokenized.states, alphabet)
          };
        }



        i = i + 1;

        onFileInputDoc(lines[i]);
        
        console.log(newInputsTokenized); 
        console.log(transitions);
        console.log(alphabet);

        onFileInputValues(newInputs, newInputsTokenized, transitions);
        validate_inputs(newInputsTokenized);

    };

    return (
        <>
          <DivButtons id="div1_buttons">
            <Upload_button onFileUpload={handleFileUpload}/>
            <Buttons title="Salvar"/>
          </DivButtons>
          
          <DivInputs id="div1_part2">
            <div id="div1_part2_inputs"> 
              <Inputs name="states" value={inputValues.states} onChange={handleInputChange} title={"Estados:"}></Inputs>
              <Inputs name="init_state" value={inputValues.init_state} onChange={handleInputChange} title={"Estado inicial:"}></Inputs>
              <Inputs name="final_states" value={inputValues.final_states} onChange={handleInputChange} title={"Estados finais:"}></Inputs>
              <Inputs name="in_alphabet" value={inputValues.in_alphabet} onChange={handleInputChange} title={"Alfabeto de entrada:"}></Inputs>
              <Inputs name="aux_alphabet" value={inputValues.aux_alphabet} onChange={handleInputChange} title={"Alfabeto auxiliar:"}></Inputs>
              <Inputs name="init_symbol" value={inputValues.init_symbol} onChange={handleInputChange} title={"Símbolo inicial:"}></Inputs>
              <Inputs name="blank_symbol" value={inputValues.blank_symbol} onChange={handleInputChange} title={"Símbolo de branco:"}></Inputs>
            </div>  
          </DivInputs>          
        </>
    )

}

export default ParentInput;