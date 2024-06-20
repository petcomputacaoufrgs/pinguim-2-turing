import React, { useEffect, useState } from 'react';
import logo from '../../assets/LogoPET_oficial (1).png';
import {AppHeader, AppLogo, AppTitle, AppLinks, AppLink} from './styled.ts';

export default function Cabecalho(){

    return(
        <AppHeader>
            <AppLogo src={logo} alt="logo" />
            <AppTitle> Máquina de Turing </AppTitle>

            <AppLinks>
                <AppLink href="https://www.inf.ufrgs.br/pet/pinguim/norma/" target="_blank" rel="noopener noreferrer"> Máquina Norma </AppLink>
                <AppLink href="https://www.inf.ufrgs.br/pet/pinguim/norma/" target="_blank" rel="noopener noreferrer"> Cálculo Lambda </AppLink>
            </AppLinks>
        </AppHeader>
    )
}