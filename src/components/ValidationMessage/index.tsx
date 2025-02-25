import { TextoErro } from "./styled";
import { useStateContext } from "../../ContextProvider";

const ValidationMessage = () => {
    const {inputStates} = useStateContext();
    const {errors} = inputStates;
    
    return (
        <>
        {(errors.uniqueStates? null : <TextoErro>Não pode haver repetição nos estados!</TextoErro>)}
        {(errors.validInitialState? null : <TextoErro>O estado inicial deve pertencer ao conjunto de estados!</TextoErro>)}
        {(errors.validFinalStates? null : <TextoErro>Os estados finais devem pertencer ao conjunto de estados!</TextoErro>)}
        {(errors.uniqueAlphabetSymbols? null : <TextoErro>Não pode haver repetição no alfabeto de entrada!</TextoErro>)}
        {(errors.disjointAlphabets? null : <TextoErro>Alfabeto auxiliar e alfabeto de entrada devem ser disjuntos!</TextoErro>)}
        {(errors.alphabetHasStart? null : <TextoErro>Alfabeto de entrada não deve conter símbolo de de início de fita!</TextoErro>)}
        {(errors.alphabetHasBlank? null : <TextoErro>Alfabeto de entrada não deve conter símbolo de branco!</TextoErro>)}
        {(errors.auxiliaryAlphabetHasStart? null : <TextoErro>Alfabeto auxiliar não deve conter o símbolo de início de fita!</TextoErro>)}
        {(errors.auxiliaryAlphabetHasBlank? null : <TextoErro>Alfabeto auxiliar não deve conter símbolo de branco!</TextoErro>)}
        </>
    )
}

export default ValidationMessage;