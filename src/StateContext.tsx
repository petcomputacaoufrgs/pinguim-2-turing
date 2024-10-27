import React, { createContext, useContext, useState, ReactNode } from 'react';

interface i_input_values {
    input0: string;
    input1: string;
    input2: string;
    input3: string;
    input4: string;
    input5: string;
    input6: string;
  }

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



const InputStatesContext = createContext<{
  inputStates: {values : i_input_values, erros : i_input_errors, documentacao : string};
  setInputStates: React.Dispatch<React.SetStateAction<{ values: i_input_values; erros: i_input_errors; documentacao: string }>>;
} | null>(null);

export const StateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inputStates, setInputStates] = useState<{values : i_input_values, erros : i_input_errors, documentacao : string}>({ 
    values : {input0: "q0",
    input1: "q0",
    input2: "",
    input3: "",
    input4: "",
    input5: "@",
    input6: "-"
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


    documentacao : ""

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
