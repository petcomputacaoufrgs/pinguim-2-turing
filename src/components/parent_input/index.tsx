import TitledInput from "../titled_input";
import { ChangeEvent, ChangeEventHandler, useState } from "react";
import Upload_button from "../upload_button";
import Buttons from "../general_button";
import Documentation from "../documentation";
import { DivButtons, DivInputs } from "./styled";

import { InputValues, TokenizedInputValues, InputErrors, Transitions, errorCodes } from '../../types/types';
import { Title } from "../header/styled";


interface i_parent_input{

    onFileInputDoc : (doc_value : string) => void;
    inputValues: InputValues;
    inputTokenizedValues : TokenizedInputValues;
    onChangeInputs: (inputs: InputValues, inputs_tokenized: TokenizedInputValues, new_transitions: Transitions, newErrors: InputErrors) => void;

    old_errors: InputErrors;
    transitions: Transitions;
    onChangeErrors: (errors: InputErrors) => void;
}

const ParentInput = ({ onFileInputDoc, inputValues, inputTokenizedValues, onChangeInputs, old_errors, transitions, onChangeErrors }: i_parent_input) => {

      const tokenize = (input: string) => {
        return input
            .split(',')
            .map(token => token.trim())
            .filter(token => token.length > 0); 
      }

      const tokenize_inputs = (inputs: InputValues) => {
        const result : Record<keyof InputValues, string[]> = {
          states: [],
          initState: [],
          finalStates: [],
          inAlphabet: [],
          auxAlphabet: [],
          initSymbol: [],
          blankSymbol: []
        }

        // Os inputs 5 e 6 estao desnecessariamente sendo tokenizados, porque a forma como o simulador do Rogrigo funciona é que o primeiro caractere
        // desses inputs é considerado e o resto é simplesmente ignorado
        for (const key in inputs)
            result[key as keyof InputValues] = tokenize(inputs[key as keyof InputValues]);
        
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

      const areFinalStatesValid = (states: string[], finalStates: string[]) => {
        for (const state of finalStates){
          if(!states.includes(state) && state != "")
            return false;
        }

        return true;
      }

      const hasDisjointAlphabets = (alphabet: string[], auxAlphabet: string[]) => {
        const set = new Set(alphabet);

        for (const item of auxAlphabet) {
            if (set.has(item) && item != "") {
                return false; 
            }
        }
    
        return true;
      }


      const validateInputs = (tokenized_inputs: TokenizedInputValues) => {
        const newErrors = {...old_errors};

        newErrors.validInitialState = isInitialStateValid(tokenized_inputs.initState, tokenized_inputs.states);
        newErrors.validFinalStates = areFinalStatesValid(tokenized_inputs.states, tokenized_inputs.finalStates);
        newErrors.uniqueStates = hasUniqueTokens(tokenized_inputs.states);
        newErrors.uniqueAlphabetSymbols = hasUniqueTokens(tokenized_inputs.inAlphabet);
        newErrors.disjointAlphabets = hasDisjointAlphabets(tokenized_inputs.inAlphabet, tokenized_inputs.auxAlphabet);

        newErrors.alphabetHasStart = !tokenized_inputs.inAlphabet.includes(tokenized_inputs.initSymbol[0]);
        newErrors.alphabetHasBlank = !tokenized_inputs.inAlphabet.includes(tokenized_inputs.blankSymbol[0]);

        newErrors.auxiliaryAlphabetHasStart = !tokenized_inputs.auxAlphabet.includes(tokenized_inputs.initSymbol[0]);
        newErrors.auxiliaryAlphabetHasBlank = !tokenized_inputs.auxAlphabet.includes(tokenized_inputs.blankSymbol[0]);
      
        return newErrors;
      }


          const updateTransition = (previous_transitions : Transitions, previous_inputs : TokenizedInputValues, states: string[], alphabet: string[], state: string, symbol: string) => {
            const previous_alphabet = [previous_inputs.initSymbol[0], ...(previous_inputs.inAlphabet.filter((x) => x != "").concat(previous_inputs.auxAlphabet.filter((x) => x != ""))), previous_inputs.blankSymbol[0]];
            
            // Se anteriormente esse novo estado existia e se o símbolo novo também existia
            if(previous_inputs.states.includes(state) && previous_alphabet.includes(symbol)) {
      
                if(previous_transitions[state] === undefined) 
                  return {next: "", error: errorCodes.NoError};
                
                const transition = previous_transitions[state][symbol];
      
                if(transition === undefined)
                  return {next: "", error: errorCodes.NoError};
      
                // Então apenas toma a transicao anterior validada para os novos estados e novo alfabeto
                return {next : transition.next, error: validateTransition(transition.next, states, alphabet)};
              }
            
            // Se o estado novo não existia ou o símbolo novo não existia
              // Então cria uma nova transição vazia a partir do novo estado para esse símbolo
              return { next: "", error: errorCodes.NoError };
            
            };
      
          const revalidateTransitions = (previous_transitions : Transitions, previous_inputs : TokenizedInputValues, tokenized_inputs : TokenizedInputValues) => {
            const new_transitions: Transitions = {};
            const initial_symbol = tokenized_inputs.initSymbol[0];
            const blankSymbol = tokenized_inputs.blankSymbol[0];
            const new_states = Array.from(new Set(tokenized_inputs.states));
      
            const new_alphabet = Array.from(new Set([initial_symbol, ...(tokenized_inputs.inAlphabet.filter((symbol) => symbol != "").concat(tokenized_inputs.auxAlphabet.filter((symbol) => symbol != ""))), blankSymbol]));
          
            for (const state of new_states) {
              new_transitions[state] = {};
      
              for (const symbol of new_alphabet) 
                new_transitions[state][symbol] = updateTransition(previous_transitions, previous_inputs, new_states, new_alphabet, state, symbol);
            }
      
            return new_transitions
          }




      const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newValues = {...inputValues, [name]: value};
        const newTokenizedValues = {...inputTokenizedValues, [name]: tokenize(value)};
        const newTransitions = revalidateTransitions(transitions, inputTokenizedValues, newTokenizedValues);

        
        onChangeInputs(newValues, newTokenizedValues, newTransitions, validateInputs(newTokenizedValues));
        
    
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
        const ordem_leitura = ["inAlphabet", "auxAlphabet", "initSymbol", "blankSymbol", "states", "initState", "finalStates"];

        let i = 0;

        for(const key of ordem_leitura) {
            if(i >= lines.length)
                break;
            newInputs[key as keyof InputValues] = lines[i]; 
            i = i + 1;
        }


        const newInputsTokenized = tokenize_inputs(newInputs);

        const transitions: Transitions = {};
        const table = tokenize(lines[i]);
        const alphabet = Array.from(new Set([newInputsTokenized.initSymbol[0], ...(newInputsTokenized.inAlphabet.filter((symbol) => symbol != "").concat(newInputsTokenized.auxAlphabet.filter((symbol) => symbol != ""))), newInputsTokenized.blankSymbol[0]]));
    

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
        onChangeInputs(newInputs, newInputsTokenized, transitions, validateInputs(newInputsTokenized));
        

    };

    return (
        <>
          <DivButtons id="div1_buttons">
            <Upload_button onFileUpload={handleFileUpload}/>
            <Buttons height="4.5vh" width="14vw" title="Salvar"/>
          </DivButtons>
          
          <DivInputs id="div1_part2">
            <div id="div1_part2_inputs">
              <TitledInput name="states" value={inputValues.states} onChange={handleInputChange} title={"Estados:"}></TitledInput>
              <TitledInput name="initState" value={inputValues.initState} onChange={handleInputChange} title={"Estado inicial:"}></TitledInput>
              <TitledInput name="finalStates" value={inputValues.finalStates} onChange={handleInputChange} title={"Estados finais:"}></TitledInput>
              <TitledInput name="inAlphabet" value={inputValues.inAlphabet} onChange={handleInputChange} title={"Alfabeto de entrada:"}></TitledInput>
              <TitledInput name="auxAlphabet" value={inputValues.auxAlphabet} onChange={handleInputChange} title={"Alfabeto auxiliar:"}></TitledInput>
              <TitledInput name="initSymbol" value={inputValues.initSymbol} onChange={handleInputChange} title={"Símbolo inicial:"}></TitledInput>
              <TitledInput name="blankSymbol" value={inputValues.blankSymbol} onChange={handleInputChange} title={"Símbolo de branco:"}></TitledInput>
            </div>  
          </DivInputs>          
        </>
    )

}

export default ParentInput;




