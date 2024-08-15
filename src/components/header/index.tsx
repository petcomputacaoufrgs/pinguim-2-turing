import React, { useEffect, useState } from 'react';
import logo from '../../assets/LogoPET_oficial (1).png';
import {AppHeader, Logo, Title, Links, Link} from './styled.ts';

export default function Header(){

    return(
        <AppHeader>
            <Logo src={logo} alt="logo" />
            <Title> Máquina de Turing </Title>

            <Links>
                <Link href="https://www.inf.ufrgs.br/pet/pinguim/norma/" target="_blank" rel="noopener noreferrer"> Máquina Norma </Link>
                <Link href="https://www.inf.ufrgs.br/pet/pinguim/norma/" target="_blank" rel="noopener noreferrer"> Cálculo Lambda </Link>
            </Links>
        </AppHeader>
    )
}