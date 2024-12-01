import React, { ChangeEvent, ChangeEventHandler, useEffect, useState } from 'react';
import {Container, ContainerBody} from "./styled.ts";
import Header from '../../components/header/index.tsx';
import Upload_button from '../../components/upload_button/index.tsx';
import Inputs from '../../components/input/index.tsx';
import Documentation from '../../components/documentation/index.tsx';
import Buttons from '../../components/general_button/index.tsx';
import ParentInput from '../../components/parent_input/index.tsx';
import ValidationMessage from '../../components/validation_message/index.tsx';
import TransitionTable from '../../components/transition_table/index.tsx';
import { useStateContext } from '../../StateContext.tsx';
import TransitionsErrorMessages from '../../components/transition_error_messages/index.tsx';


interface i_input_values {
  input0: string;
  input1: string;
  input2: string;
  input3: string;
  input4: string;
  input5: string;
  input6: string;
}

interface i_input_values_tokenized {
  input0: string[];
  input1: string[];
  input2: string[];
  input3: string[];
  input4: string[];
  input5: string[];
  input6: string[];
}


interface i_input_errors{
  unique_states: boolean;
  valid_initial_state: boolean;
  valid_final_states: boolean;
  unique_alphabet_symbols: boolean;
  disjoint_alphabets: boolean;
  alphabet_does_not_contain_start: boolean;
  alphabet_does_not_contain_blank: boolean;
  auxiliary_alphabet_does_not_contain_start: boolean;
  auxiliary_alphabet_does_not_contain_blank: boolean;
}

interface Transitions {
  [state: string]: {
    [symbol: string] : {
      next: string;
      error: number;
    };
  };
}



export function Home() { 

    const  { inputStates, setInputStates } = useStateContext();

    const {erros} = inputStates;
    const {tokenized_inputs} = inputStates;
    const {documentacao} = inputStates;
    const {inputs} = inputStates;
    const {transitions} = inputStates;

    const setTransitions = (novas_transicoes : Transitions) => {
      setInputStates(prevState => ({
        ...prevState,
        transitions : novas_transicoes
      }));
    };

    const setErros = (novos_erros : i_input_errors) => {
      setInputStates(prevState => ({
        ...prevState,
        erros: novos_erros
      }));
    }

    const setInputValues = (new_values : i_input_values, new_tokenized_values : i_input_values_tokenized) => {
      setInputStates(prevState => ({
        ...prevState,
        inputs: new_values,
        tokenized_inputs: new_tokenized_values
      }));
    }

    const OnChangeDocumentationValue = (e : ChangeEvent<HTMLTextAreaElement>) => {
      setInputStates(prevState => ({
        ...prevState,
        documentacao : e.target.value
      }))
    }

    const setDocumentationValue = (doc_value : string) => {
      setInputStates(prevStates => ({
        ...prevStates,
        documentacao : doc_value
      }))
    }


  return (
    <Container>
      <Header/>

      <ContainerBody>
            {/*Como todas as componentes aqui utilizam de alguma forma o estado dos inputs (download, upload, modificação direta) 
            e os manipulam coloquei todas em uma componente para poder acessar esses estados mais facilmente sem tranferir a lógica diretamente para a home */}

        <div id="div1">
          <div>    
            <ParentInput onFileInputDoc={setDocumentationValue} inputValues={inputs} inputTokenizedValues={tokenized_inputs} old_errors={erros} onChangeInputs={setInputValues} onChangeErrors={setErros} />
          </div>
          <div id="div1_doc">
            <Documentation value={documentacao} onChange={OnChangeDocumentationValue}></Documentation>
          </div>
        </div>

        <div id="div2">
          <p>Tabela de Transição:</p>
          <div>
          <TransitionTable tokenized_inputs={tokenized_inputs} OnChangeTransitionTable={setTransitions} transitions={transitions} />
          <TransitionsErrorMessages transitions={transitions} />
          </div>
          <Buttons to={"/computing"} title="Computar" disabled={Object.values(erros).some(valor_bool => !valor_bool)}/>
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