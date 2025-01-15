import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Transitions, i_input_values, i_input_values_tokenized, i_input_errors } from './types/types';


const InputStatesContext = createContext<{
  inputStates: {inputs : i_input_values, tokenized_inputs : i_input_values_tokenized, erros : i_input_errors, documentacao : string, transitions : Transitions};
  setInputStates: React.Dispatch<React.SetStateAction<{inputs: i_input_values, tokenized_inputs: i_input_values_tokenized; erros: i_input_errors; documentacao: string, transitions : Transitions}>>;
} | null>(null);

export const StateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inputStates, setInputStates] = useState<{inputs: i_input_values, tokenized_inputs : i_input_values_tokenized, erros : i_input_errors, documentacao : string, transitions : Transitions}>({ 
    tokenized_inputs : {states: ["q0"],
    init_state: ["q0"],
    final_states: [""],
    in_alphabet: [""],
    aux_alphabet: [""],
    init_symbol: ["@"],
    blank_symbol: ["-"]
  },

   erros : {    
    unique_states: true,
    valid_initial_state: true,
    valid_final_states: true,
    unique_alphabet_symbols: true,
    disjoint_alphabets: true,
    alphabet_does_not_contain_start: true,
    alphabet_does_not_contain_blank: true,
    auxiliary_alphabet_does_not_contain_start: true,
    auxiliary_alphabet_does_not_contain_blank: true},


    documentacao : "",

    transitions : {q0:{"@":{next:"", error:0}, "-":{next:"", error:0}}},

    inputs: {
      states: "q0",
      init_state: "q0",
      final_states: "",
      in_alphabet: "",
      aux_alphabet: "",
      init_symbol: "@",
      blank_symbol: "-"   
    }

}); // Estado inicial do simulador do Rodrigo

  return (
    <InputStatesContext.Provider value={{ inputStates, setInputStates }}>
      {children}
    </InputStatesContext.Provider>
  );
};


export const useStateContext = () => {
  const context = useContext(InputStatesContext);
  if (!context) {
    throw new Error('useStateContext deve ser usado dentro de um StateProvider');
  }
  return context;
};
