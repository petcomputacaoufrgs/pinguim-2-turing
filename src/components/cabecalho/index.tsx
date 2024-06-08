import React, { useEffect, useState } from 'react';
import logo from '../../assets/LogoPET_oficial (1).png';

export default function Cabecalho(){


    return(
        <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p className="titulo">
            Máquina de Turing
            </p>
            <a
            className="App-link1"
            href="https://www.inf.ufrgs.br/pet/pinguim/norma/"
            target="_blank"
            rel="noopener noreferrer"
            >
            Máquina Norma
            </a>
            <a
            className="App-link2"
            href="https://www.inf.ufrgs.br/pet/pinguim/norma/"
            target="_blank"
            rel="noopener noreferrer"
            >
            Cálculo Lambda
            </a>
        </header>
    )
}