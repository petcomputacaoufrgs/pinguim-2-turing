import { TextoErro } from "./styled";
import { useStateContext } from "../../ContextProvider";

const ValidationMessage = () => {
    const {inputStates} = useStateContext();
    const {errors} = inputStates;
    
    return (
        <>
        {errors.uniqueStates?                          null : <TextoErro>Não pode haver repetição nos estados!</TextoErro>                              }
        {errors.validInitialState?                     null : <TextoErro>O estado inicial deve pertencer ao conjunto de estados!</TextoErro>            }
        {errors.validFinalStates?                      null : <TextoErro>Os estados finais devem pertencer ao conjunto de estados!</TextoErro>          }
        {errors.uniqueAlphabetSymbols?                 null : <TextoErro>Não pode haver repetição no alfabeto de entrada!</TextoErro>                   }
        {errors.disjointAlphabets?                     null : <TextoErro>Alfabeto auxiliar e alfabeto de entrada devem ser disjuntos!</TextoErro>       }
        {errors.alphabetDoesNotHaveStart?              null : <TextoErro>Alfabeto de entrada não deve conter símbolo de de início de fita!</TextoErro>  }
        {errors.alphabetDoesNotHaveBlank?              null : <TextoErro>Alfabeto de entrada não deve conter símbolo de branco!</TextoErro>             }
        {errors.auxiliaryAlphabetDoesNotHaveStart?     null : <TextoErro>Alfabeto auxiliar não deve conter o símbolo de início de fita!</TextoErro>     }
        {errors.auxiliaryAlphabetDoesNotHaveBlank?     null : <TextoErro>Alfabeto auxiliar não deve conter símbolo de branco!</TextoErro>               }
        {errors.undefinedIsNotASymbol?                 null : <TextoErro>"undefined" não pode ser um símbolo da máquina!</TextoErro>                    }
        </>
    )
}

export default ValidationMessage;