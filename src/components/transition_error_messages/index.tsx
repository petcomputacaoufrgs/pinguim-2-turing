import { errorCodes, Transitions } from "../../types/types";
import { ErrorText, ErrorsContainer } from "./styles";


  interface ErrorMessageProps {
    transitions: Transitions;
  }
  
const TransitionsErrorMessages = ({ transitions }: ErrorMessageProps) => {
    const errors = [];
  
    for (const state in transitions) {
        
      for (const symbol in transitions[state]) {
        const transition = transitions[state][symbol];

        if (transition.error == errorCodes.InvalidDirection) 
          errors.push(`[${state}, ${symbol}] Movimento deve ser L ou R apenas`);

        else if (transition.error == errorCodes.InvalidNumberOfParameters) 
          errors.push(`[${state}, ${symbol}] Escreva: estado, movimento (R/L), símbolo`);

        if (transition.error == errorCodes.InvalidState) 
          errors.push(`[${state}, ${symbol}] Novo estado deve pertencer ao conjunto de estados`);

        if (transition.error == errorCodes.InvalidSymbol) 
          errors.push(`[${state}, ${symbol}] Símbolo escrito deve pertencer ao alfabeto da fita`);

        
      }
    }
  
    return (

      <ErrorsContainer>
        {errors.map((error, index) => (
          <ErrorText key={index} >
            {error}
          </ErrorText>
        ))}
      </ErrorsContainer>
    );
  };


export default TransitionsErrorMessages;
  
