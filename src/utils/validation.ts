import { errorCodes, InputErrors, TokenizedInputValues, Transitions } from "../types/types";

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


export const validateTransition = (value:string, states:string[], alphabet:string[]) => {
      
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
    
export const validateInputs = (tokenized_inputs: TokenizedInputValues, oldErrors: InputErrors) => {
    const newErrors = {...oldErrors};

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

export const revalidateTransitions = (previous_transitions : Transitions, previous_inputs : TokenizedInputValues, tokenized_inputs : TokenizedInputValues) => {
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



