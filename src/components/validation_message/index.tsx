import React from "react";
import { useState } from "react";
import { TextoErro } from "./styled";
import { InputErrors } from "../../types/types";

const ValidationMessage = (validation: InputErrors) => {
    return (
        <>
        {(validation.uniqueStates? null : <TextoErro>Não pode haver repetição nos estados!</TextoErro>)}
        {(validation.validInitialState? null : <TextoErro>O estado inicial deve pertencer ao conjunto de estados!</TextoErro>)}
        {(validation.validFinalStates? null : <TextoErro>Os estados finais devem pertencer ao conjunto de estados!</TextoErro>)}
        {(validation.uniqueAlphabetSymbols? null : <TextoErro>Não pode haver repetição no alfabeto de entrada!</TextoErro>)}
        {(validation.disjointAlphabets? null : <TextoErro>Alfabeto auxiliar e alfabeto de entrada devem ser disjuntos!</TextoErro>)}
        {(validation.alphabetHasStart? null : <TextoErro>Alfabeto de entrada não deve conter símbolo de de início de fita!</TextoErro>)}
        {(validation.alphabetHasBlank? null : <TextoErro>Alfabeto de entrada não deve conter símbolo de branco!</TextoErro>)}
        {(validation.auxiliaryAlphabetHasStart? null : <TextoErro>Alfabeto auxiliar não deve conter o símbolo de início de fita!</TextoErro>)}
        {(validation.auxiliaryAlphabetHasBlank? null : <TextoErro>Alfabeto auxiliar não deve conter símbolo de branco!</TextoErro>)}

        </>
    )
}

export default ValidationMessage;