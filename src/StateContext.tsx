import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Transitions, InputValues, TokenizedInputValues, InputErrors } from './types/types';


const InputStatesContext = createContext<{
  inputStates: {inputs : InputValues, tokenizedInputs : TokenizedInputValues, errors : InputErrors, documentation : string, transitions : Transitions};
  setInputStates: React.Dispatch<React.SetStateAction<{inputs: InputValues, tokenizedInputs: TokenizedInputValues; errors: InputErrors; documentation: string, transitions : Transitions}>>;
} | null>(null);

export const StateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inputStates, setInputStates] = useState<{inputs: InputValues, tokenizedInputs : TokenizedInputValues, errors : InputErrors, documentation : string, transitions : Transitions}>({ 
    tokenizedInputs : {states: ["q0"],
    initState: ["q0"],
    finalStates: [""],
    inAlphabet: [""],
    auxAlphabet: [""],
    initSymbol: ["@"],
    blankSymbol: ["-"]
  },

   errors : {    
    uniqueStates: true,
    validInitialState: true,
    validFinalStates: true,
    uniqueAlphabetSymbols: true,
    disjointAlphabets: true,
    alphabetHasStart: true,
    alphabetHasBlank: true,
    auxiliaryAlphabetHasStart: true,
    auxiliaryAlphabetHasBlank: true},


    documentation : "",

    transitions : {q0:{"@":{next:"", error:0}, "-":{next:"", error:0}}},

    inputs: {
      states: "q0",
      initState: "q0",
      finalStates: "",
      inAlphabet: "",
      auxAlphabet: "",
      initSymbol: "@",
      blankSymbol: "-"   
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
