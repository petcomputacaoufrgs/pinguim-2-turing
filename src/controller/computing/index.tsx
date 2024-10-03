import React, { useEffect, useState } from 'react';
import {Container, ContainerBody, Div11, Div12, Div13, Div14} from "./styled.ts";
import Header from '../../components/header/index.tsx';
import Buttons from '../../components/general_button/index.tsx';

export function Home() {  
  return (
    <Container>
      <Header/>

      <ContainerBody>
        <div id="div2">
          <Buttons title="Editar Máquina de Turing"/>
          <p>Tabela de Transição:</p>
          <div></div>
        </div>

        <div id="div1">
          <Div11>
            <p>Entrada:</p>
            <input type="text"/>
          </Div11> 

          <Div12>
          </Div12>

          <Div13>
          </Div13>

          <Div14>
          </Div14>
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