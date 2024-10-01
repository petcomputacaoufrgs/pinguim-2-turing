import React, { useEffect, useState } from 'react';
/*import init, { add } from "turing-wasm";*/
import {Container, ContainerBody} from "./styled.ts";
import Header from '../../components/header/index.tsx';
import Upload_button from '../../components/upload_button/index.tsx';
import Inputs from '../../components/input/index.tsx';
import Documentation from '../../components/documentation/index.tsx';

export function Home() {
  /*const [ans, setAns] = useState(0);
  useEffect(() => {
    init().then(() => {
      setAns(add(1,1));
    })
  }, [])*/
  
  return (
    <Container>
      <Header/>

      <ContainerBody>
        <div id="div1">
          <Upload_button/>
          
          <div></div>

          <div id="div1_part2">
            <div id="div1_part2_inputs">
              <Inputs title="Estado:"/>
              <Inputs title="Estado inicial:"/>
              <Inputs title="Estados finais:"/>
              <Inputs title="Alfabeto de entrada:"/>
              <Inputs title="Alfabeto auxiliar:"/>
              <Inputs title="Símbolo inicial:"/>
              <Inputs title="Símbolo de branco:"/>
            </div>

            <Documentation/>
          </div>
        </div>

        <div id="div2">
          <p>Tabela de Transição:</p>
          <div></div>
        </div>

        <div id="div3">
          <p>Grafo:</p>
          <div></div>
        </div>
      </ContainerBody>
    </Container>
  );
}

export default Home;