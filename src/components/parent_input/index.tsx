import Inputs from "../input";
import { ChangeEvent, ChangeEventHandler, useState } from "react";
import Upload_button from "../upload_button";
import Buttons from "../general_button";
import Documentation from "../documentation";
import { DivButtons, DivInputs } from "./styled";

import { i_input_values, i_input_values_tokenized, i_input_errors } from '../../types/types';


interface i_parent_input{
    onFileInputDoc : (doc_value : string) => void;

    inputValues: i_input_values;
    inputTokenizedValues : i_input_values_tokenized;
    onChangeInputs: (inputs: i_input_values, inputs_tokenized: i_input_values_tokenized) => void;

    old_errors: i_input_errors;
    onChangeErrors: (errors: i_input_errors) => void;
}

const ParentInput = ({onFileInputDoc, inputValues, inputTokenizedValues, onChangeInputs, old_errors, onChangeErrors}: i_parent_input) => {

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

        const newInputsTokenized = tokenize_inputs(inputValues);

        onChangeInputs(newInputs, newInputsTokenized);
        validate_inputs(newInputsTokenized);

        // FAZER: LEITURA DA TABELA
        i = i + 1; // Pula leitura da tabela

        onFileInputDoc(lines[i]); 
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