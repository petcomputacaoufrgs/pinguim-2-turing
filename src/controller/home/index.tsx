import React, { useEffect, useState } from 'react';
import {Container, ContainerBody} from "./styled.ts";
import Header from '../../components/header/index.tsx';
import Upload_button from '../../components/upload_button/index.tsx';
import Inputs from '../../components/input/index.tsx';
import Documentation from '../../components/documentation/index.tsx';
import Buttons from '../../components/general_button/index.tsx';
import ParentInput from '../../components/parent_input/index.tsx';
import ValidationMessage from '../../components/validation_message/index.tsx';


export function Home() { 
  const [erros, setErros] = useState({    
    unique_states: true,
    valid_initial_state: true,
    valid_final_states: true,
    unique_alphabet_symbols: true,
    disjoint_alphabets: true,
    alphabet_does_not_contain_start: true,
    alphabet_does_not_contain_blank: true,
    auxiliary_alphabet_does_not_contain_start: true,
    auxiliary_alphabet_does_not_contain_blank: true});






  return (
    <Container>
      <Header/>

      <ContainerBody>
        <div id="div1">
          {/*Todos esses inputs vao precisar estar dentro de uma unica componente de forma que seja possivel acessar os estados de todos eles ao mesmo tempo */}
            <ParentInput onChangeErrors={setErros} old_errors={erros}/>

        </div>

        <div id="div2">
          <p>Tabela de Transição:</p>
          <div></div>
          <Buttons to={"/computing"} title="Computar"/>
        </div>

        <div id="div3">
          <p>Grafo:</p>
          <div></div>
        </div>


        <div id="div4">
          <ValidationMessage {...erros}/>
        </div>

      </ContainerBody>
    </Container>
  );
}

export default Home;