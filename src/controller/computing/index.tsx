import React, { useEffect, useState } from 'react';
import {Container, ContainerBody} from "./styled.ts";
import Header from '../../components/header/index.tsx';
import Upload_button from '../../components/upload_button/index.tsx';
import Inputs from '../../components/input/index.tsx';
import Documentation from '../../components/documentation/index.tsx';
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