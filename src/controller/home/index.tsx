import React, { useEffect, useState } from 'react';
import init, { add } from "turing-wasm";
import "../../components/cabecalho"

import './style.css';
import Cabecalho from '../../components/cabecalho';

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
          <input type="file" id="botaoCarregar" hidden/>
          <label htmlFor="botaoCarregar">Carregar</label>
          <div id="inputs">
            <text>Estados:</text>
            <input type='text'/>
            <text>Estado Inicial:</text>
            <input type='text'/>
            <text>Estados Finais:</text>
            <input type='text'/>
            <text>Alfabeto de Entrada:</text>
            <input type='text'/>
            <text>Alfabeto Auxiliar:</text>
            <input type='text'/>
            <text>Símbolo Inicial:</text>
            <input type='text'/>
            <text>Símbolo de Branco:</text>
            <input type='text'/>
          </div>
          <div id="Documentacao">
            <text>Documentação:</text>
            <input type='text'/>
          </div>
        </div>
      </body>
    </div>
  );
}

export default Home;