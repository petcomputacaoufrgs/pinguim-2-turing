import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { Transitions, InputValues, TokenizedInputValues, InputErrors, State } from './types/types';
import * as joint from 'jointjs';


const InputStatesContext = createContext<{

  inputStates: {inputs : InputValues, 
                tokenizedInputs : TokenizedInputValues, 
                errors : InputErrors, 
                documentation : string, 
                transitions : Transitions};

  setInputStates: React.Dispatch<React.SetStateAction<{inputs: InputValues, 
                                                       tokenizedInputs: TokenizedInputValues, 
                                                       errors: InputErrors; 
                                                       documentation: string, 
                                                       transitions : Transitions}>>;

  nodePositions: React.MutableRefObject<Map<string, {
    x: number;
    y: number;
  }>>, 

  
  graphLinks: {currentLinks:  Map<string,Map<string,Map<string,joint.shapes.standard.Link>>>, 
              setLinks: React.Dispatch<React.SetStateAction<Map<string,Map<string, Map<string,joint.shapes.standard.Link>>>>>};
  
  changesHistory: {history: Array<State>, 
                  setHistory: React.Dispatch<React.SetStateAction<Array<State>>>};
                   
  changesIndex: {historyIndex: number, 
                 setHistoryIndex: React.Dispatch<React.SetStateAction<number>>};
   
} | null>(null);


export const StateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  // Estado inicial do simulador do Rodrigo
  const [inputStates, setInputStates] = useState<{inputs: InputValues, 
                                                  tokenizedInputs : TokenizedInputValues, 
                                                  errors : InputErrors, 
                                                  documentation : string, 
                                                  transitions : Transitions}>({ 
    tokenizedInputs : {
      states: ["q0"],
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
    alphabetDoesNotHaveStart: true,
    alphabetDoesNotHaveBlank: true,
    auxiliaryAlphabetDoesNotHaveStart: true,
    auxiliaryAlphabetDoesNotHaveBlank: true,
    undefinedIsNotASymbol: true,
    onlyValidSymbols: true},

    documentation : "",

    transitions : {
      q0:{
        
       "@": {
        transitionText:"",
        direction: "", 
        nextState: "", 
        newSymbol: "", 
        error:0}, 
        
        "-":{
          transitionText:"", 
          direction: "", 
          nextState: "", 
          newSymbol: "", 
          error:0}
      }
    },

    inputs: {
      states: "q0",
      initState: "q0",
      finalStates: "",
      inAlphabet: "",
      auxAlphabet: "",
      initSymbol: "@",
      blankSymbol: "-"   
    }

}); 

  const [currentLinks, setLinks] = useState<Map<string, Map<string, Map<string, joint.shapes.standard.Link>>>>(new Map());
  const nodePositions = useRef<Map<string, { x: number; y: number }>>(new Map([["q0", {x: 20, y: 100}]])); 
  const [history, setHistory] = useState<Array<State>>([{inputs: inputStates.inputs, tokenizedInputs: inputStates.tokenizedInputs, transitions: inputStates.transitions, errors: inputStates.errors}])
  const [historyIndex, setHistoryIndex] = useState<number>(0); 

  
  return (
    <InputStatesContext.Provider value={{ inputStates, setInputStates, nodePositions, graphLinks: {currentLinks, setLinks}, changesHistory: {history, setHistory}, changesIndex: {historyIndex, setHistoryIndex} }}>
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