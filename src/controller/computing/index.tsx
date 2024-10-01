import React, { useEffect, useState } from 'react';
import {Container, ContainerBody} from "./styled.ts";
import Header from '../../components/header/index.tsx';
import Upload_button from '../../components/upload_button/index.tsx';
import Inputs from '../../components/input/index.tsx';
import Documentation from '../../components/documentation/index.tsx';

export function Home() {  
  return (
    <Container>
      <Header/>

      <ContainerBody>
        <div id="div1">
        
        </div>

        <div id="div2">
          
        </div>

        <div id="div3">
        
        </div>
      </ContainerBody>
    </Container>
  );
}

export default Home;