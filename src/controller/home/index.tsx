import React, { ChangeEvent } from 'react';
import {Container, ContainerBody} from "./styled.ts";
import Header from '../../components/header/index.tsx';
import Documentation from '../../components/documentation/index.tsx';
import Buttons from '../../components/general_button/index.tsx';
import ParentInput from '../../components/parent_input/index.tsx';
import ValidationMessage from '../../components/validation_message/index.tsx';
import TransitionTable from '../../components/transition_table/index.tsx';
import { useStateContext } from '../../StateContext.tsx';
import TransitionsErrorMessages from '../../components/transition_error_messages/index.tsx';

import { Transitions, InputValues, TokenizedInputValues, InputErrors } from '../../types/types';


export function Home() { 

    const  { inputStates, setInputStates } = useStateContext();

    const {errors} = inputStates;
    const {tokenizedInputs} = inputStates;
    const {documentation} = inputStates;
    const {inputs} = inputStates;
    const {transitions} = inputStates;

    const setTransitions = (novas_transicoes : Transitions) => {
      setInputStates(prevState => ({
        ...prevState,
        transitions : novas_transicoes
      }));
    };

    const setErros = (new_errors : InputErrors) => {
      setInputStates(prevState => ({
        ...prevState,
        errors: new_errors
      }));
    }


    const setInputValues = (new_values : InputValues, new_tokenized_values : TokenizedInputValues, new_transitions : Transitions) => {
      setInputStates(prevState => ({
        ...prevState,
        inputs: new_values,
        tokenizedInputs: new_tokenized_values,
        transitions: new_transitions
      }));
    }

    const OnChangeDocumentationValue = (e : ChangeEvent<HTMLTextAreaElement>) => {
      setInputStates(prevState => ({
        ...prevState,
        documentation : e.target.value
      }))
    }

    const setDocumentationValue = (docValue : string) => {
      setInputStates(prevStates => ({
        ...prevStates,
        documentation : docValue
      }))
    }


  return (
    <Container>
      <Header/>

      <ContainerBody>
        <div id="div1">
          <div>    
            <ParentInput onFileInputDoc={setDocumentationValue} inputValues={inputs} inputTokenizedValues={tokenizedInputs} old_errors={errors} transitions={transitions} onChangeInputs={setInputValues} onChangeErrors={setErros} />
          </div>
          <div id="div1_doc">
            <Documentation value={documentation} onChange={OnChangeDocumentationValue}></Documentation>
          </div>
        </div>

        <div id="div2">
          <p>Tabela de Transição:</p>
          <div>
          <TransitionTable tokenizedInputs={tokenizedInputs} OnChangeTransitionTable={setTransitions} transitions={transitions} />
          </div>

          <Buttons to={"/computing"} title="Computar" disabled={Object.values(errors).some(valor_bool => !valor_bool)}/>
        </div>

        <div id="div3">
          <p>Grafo:</p>
          <div></div>
        </div>


        <div id="div4">
          <ValidationMessage {...errors}/>
        </div>

        <div id="div5">
          <TransitionsErrorMessages transitions={transitions} />
        </div>

      </ContainerBody>

      
    </Container>
  );
}

export default Home;