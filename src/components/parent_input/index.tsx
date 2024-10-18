import Inputs from "../input";
import { ChangeEvent, useState } from "react";

// Essa interface está repetida em validation_message
interface i_input_errors{
    unique_states: boolean;
    valid_initial_state: boolean;
    valid_final_states: boolean;
    unique_alphabet_symbols: boolean;
    disjoint_alphabets: boolean;
    alphabet_does_not_contain_start: boolean;
    alphabet_does_not_contain_blank: boolean;
    auxiliary_alphabet_does_not_contain_start: boolean;
    auxiliary_alphabet_does_not_contain_blank: boolean;

}

interface i_input_values {
    input0: string;
    input1: string;
    input2: string;
    input3: string;
    input4: string;
    input5: string;
    input6: string;
  }


interface i_parent_input{
    old_errors: i_input_errors;
    onChangeErrors: (errors: i_input_errors) => void;
}



const ParentInput = ({old_errors, onChangeErrors}: i_parent_input) => {

    const [inputValues, setInputValues] = useState<i_input_values>({
        input0: "",
        input1: "",
        input2: "",
        input3: "",
        input4: "",
        input5: "",
        input6: ""
      });


      const tokenize = (input: string) => {
        return input
            .split(',')
            .map(token => token.trim())
            .filter(token => token.length > 0); 
      }

      const tokenize_inputs = (inputs: i_input_values) => {
        const result : Record<keyof i_input_values, string[]> = {
          input0: [],
          input1: [],
          input2: [],
          input3: [],
          input4: [],
          input5: [],
          input6: []
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
          if(!states.includes(state))
            return false;
        }

        return true;
      }

      const hasDisjointAlphabets = (alphabet: string[], aux_alphabet: string[]) => {
        const set = new Set(alphabet);

        for (const item of aux_alphabet) {
            if (set.has(item)) {
                return false; 
            }
        }
    
        return true;
      }


      const validate_inputs = (inputs: i_input_values) => {
        const newErrors = {...old_errors};
        const tokenized_inputs = tokenize_inputs(inputs);

        newErrors.valid_initial_state = isInitialStateValid(tokenized_inputs.input1, tokenized_inputs.input0);
        newErrors.valid_final_states = areFinalStatesValid(tokenized_inputs.input0, tokenized_inputs.input2);
        newErrors.unique_states = hasUniqueTokens(tokenized_inputs.input0);
        newErrors.unique_alphabet_symbols = hasUniqueTokens(tokenized_inputs.input3);
        newErrors.disjoint_alphabets = hasDisjointAlphabets(tokenized_inputs.input3, tokenized_inputs.input4);

        newErrors.alphabet_does_not_contain_start = !tokenized_inputs.input3.includes(inputs.input5[0]);
        newErrors.alphabet_does_not_contain_blank = !tokenized_inputs.input3.includes(inputs.input6[0]);

        newErrors.auxiliary_alphabet_does_not_contain_start = !tokenized_inputs.input4.includes(inputs.input5[0]);
        newErrors.auxiliary_alphabet_does_not_contain_blank = !tokenized_inputs.input4.includes(inputs.input6[0]);
      
        onChangeErrors(newErrors)
      }


      const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newValues = {...inputValues, [name]: value};

        setInputValues(newValues);

        validate_inputs(newValues);
    
      };

    return (
        <>
            <Inputs name="input0" value={inputValues.input0} onChange={handleInputChange} title={"Estados"}></Inputs>
            <Inputs name="input1" value={inputValues.input1} onChange={handleInputChange} title={"Estado inicial"}></Inputs>
            <Inputs name="input2" value={inputValues.input2} onChange={handleInputChange} title={"Estados finais"}></Inputs>
            <Inputs name="input3" value={inputValues.input3} onChange={handleInputChange} title={"Alfabeto de entrada"}></Inputs>
            <Inputs name="input4" value={inputValues.input4} onChange={handleInputChange} title={"Alfabeto auxiliar"}></Inputs>
            <Inputs name="input5" value={inputValues.input5} onChange={handleInputChange} title={"Símbolo inicial"}></Inputs>
            <Inputs name="input6" value={inputValues.input6} onChange={handleInputChange} title={"Símbolo de branco"}></Inputs>

        </>
    )

}

export default ParentInput;