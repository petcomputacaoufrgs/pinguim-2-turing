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
        <div id="div1">
          <div id="div1_buttons">
            <Upload_button/>
            <Buttons title="Salvar"/>
          </div>
          
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
          <Buttons title="Computar"/>
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