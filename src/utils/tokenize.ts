import {InputValues} from "../types/types";

export const tokenize = (input: string) => {
    return input.split(',').map(token => token.trim()).filter(token => token.length > 0); 
}

export const tokenizeInputs = (inputs: InputValues) => {
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