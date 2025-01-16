export const errorCodes = Object.freeze({
    NoError: 0,
    InvalidNumberOfParameters: 1,
    InvalidState: 2,
    InvalidDirection: 3,
    InvalidSymbol: 4
})


export interface Transitions {
    [state: string]: {
      [symbol: string] : {
        next: string;
        error: number;
      };
    };
  }
  
  
export interface InputValues {
      states: string;
      initState: string;
      finalStates: string;
      inAlphabet: string;
      auxAlphabet: string;
      initSymbol: string;
      blankSymbol: string;
    }
  
export interface TokenizedInputValues {
      states: string[];
      initState: string[];
      finalStates: string[];
      inAlphabet: string[];
      auxAlphabet: string[];
      initSymbol: string[];
      blankSymbol: string[];
    }
  
export interface InputErrors {
      uniqueStates: boolean;
      validInitialState: boolean;
      validFinalStates: boolean;
      uniqueAlphabetSymbols: boolean;
      disjointAlphabets: boolean;
      alphabetHasStart: boolean;
      alphabetHasBlank: boolean;
      auxiliaryAlphabetHasStart: boolean;
      auxiliaryAlphabetHasBlank: boolean;
  }