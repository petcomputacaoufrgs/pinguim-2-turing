import React from "react";
import { useState } from "react";
import { TextoErro } from "./styled";
import { i_input_errors } from "../../types/types";

const ValidationMessage = (validation: i_input_errors) => {
    return (
        <>
        {(validation.unique_states? null : <TextoErro>Não pode haver repetição nos estados!</TextoErro>)}
        {(validation.valid_initial_state? null : <TextoErro>O estado inicial deve pertencer ao conjunto de estados!</TextoErro>)}
        {(validation.valid_final_states? null : <TextoErro>Os estados finais devem pertencer ao conjunto de estados!</TextoErro>)}
        {(validation.unique_alphabet_symbols? null : <TextoErro>Não pode haver repetição no alfabeto de entrada!</TextoErro>)}
        {(validation.disjoint_alphabets? null : <TextoErro>Alfabeto auxiliar e alfabeto de entrada devem ser disjuntos!</TextoErro>)}
        {(validation.alphabet_does_not_contain_start? null : <TextoErro>Alfabeto de entrada não deve conter símbolo de de início de fita!</TextoErro>)}
        {(validation.alphabet_does_not_contain_blank? null : <TextoErro>Alfabeto de entrada não deve conter símbolo de branco!</TextoErro>)}
        {(validation.auxiliary_alphabet_does_not_contain_start? null : <TextoErro>Alfabeto auxiliar não deve conter o símbolo de início de fita!</TextoErro>)}
        {(validation.auxiliary_alphabet_does_not_contain_blank? null : <TextoErro>Alfabeto auxiliar não deve conter símbolo de branco!</TextoErro>)}

        </>
    )
}

export default ValidationMessage;