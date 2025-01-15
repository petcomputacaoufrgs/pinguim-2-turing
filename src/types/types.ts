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
  
  
export interface i_input_values {
      states: string;
      init_state: string;
      final_states: string;
      in_alphabet: string;
      aux_alphabet: string;
      init_symbol: string;
      blank_symbol: string;
    }
  
export interface i_input_values_tokenized {
      states: string[];
      init_state: string[];
      final_states: string[];
      in_alphabet: string[];
      aux_alphabet: string[];
      init_symbol: string[];
      blank_symbol: string[];
    }
  
export interface i_input_errors{
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