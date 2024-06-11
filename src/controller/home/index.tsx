import React, { useEffect, useState } from 'react';
import init, { add } from "turing-wasm";
import "../../components/cabecalho"

import './style.css';
import Cabecalho from '../../components/cabecalho';
import Inputs from '../../components/input';

export function Home() {
  const [ans, setAns] = useState(0);
  useEffect(() => {
    init().then(() => {
      setAns(add(1,1));
    })
  }, [])
  
  return (
    <div className="App">
      <Cabecalho/>
      <body className='corpo'>
        <div id='div1'>
          <div id='botao_inputs'>
            <input type="file" id="botaoCarregar" hidden/>
            <label htmlFor="botaoCarregar">Carregar</label>
            <div id="inputs">
              <Inputs titulo="Estados:"/>
              <Inputs titulo="Estado Inicial:"/>
              <Inputs titulo="Estados Finais:"/>
              <Inputs titulo="Alfabeto de Entrada:"/>
              <Inputs titulo="Alfabeto Auxiliar:"/>
              <Inputs titulo="Símbolo Inicial:"/>
              <Inputs titulo="Símbolo de Branco:"/>
            </div>
          </div>
          <div id="documentacao">
            <text>Documentação:</text>
            <input type='text'/>
          </div>
        </div>
        <div id='div2'>
          <text>teste</text>
        </div>
      </body>
    </div>
  );
}

export default Home;