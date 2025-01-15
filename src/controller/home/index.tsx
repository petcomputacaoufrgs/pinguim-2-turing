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

import { errorCodes, Transitions, i_input_values, i_input_values_tokenized, i_input_errors } from '../../types/types';


export function Home() { 

    const  { inputStates, setInputStates } = useStateContext();

    const {erros} = inputStates;
    const {tokenized_inputs} = inputStates;
    const {documentacao} = inputStates;
    const {inputs} = inputStates;
    const {transitions} = inputStates;


    const validateTransition = (value:string, states:string[], alphabet:string[]) => {

        const value_tokenized =  value.split(',').map(token => token.trim()).filter(token => token.length > 0); 
        
        if(value_tokenized === null || value_tokenized.length == 0)
            return errorCodes.NoError;

        if(value_tokenized.length !== 3)
            return errorCodes.InvalidNumberOfParameters;

        if(!states.includes(value_tokenized[0]))
            return errorCodes.InvalidState; 
    
        if(!alphabet.includes(value_tokenized[2]))
            return errorCodes.InvalidSymbol;

        if(value_tokenized[1].toUpperCase() !== "L" && value_tokenized[1].toUpperCase() !== "R")
            return errorCodes.InvalidDirection;

        return errorCodes.NoError;
    }

    const updateTransition = (previous_transitions : Transitions, previous_inputs : i_input_values_tokenized, states: string[], alphabet: string[], state: string, symbol: string) => {
      const previous_alphabet = [previous_inputs.init_symbol[0], ...(previous_inputs.in_alphabet.filter((x) => x != "").concat(previous_inputs.aux_alphabet.filter((x) => x != ""))), previous_inputs.blank_symbol[0]];
      
      // Se anteriormente esse novo estado existia e se o símbolo novo também existia
      if(previous_inputs.states.includes(state) && previous_alphabet.includes(symbol)) {
          // Então apenas toma a transicao anterior validada para os novos estados e novo alfabeto
          const transition = previous_transitions[state][symbol].next;
          return {next : transition, error: validateTransition(transition, states, alphabet)};
        }
      
      // Se o estado novo não existia ou o símbolo novo não existia
        // Então cria uma nova transição vazia a partir do novo estado para esse símbolo
        return { next: "", error: errorCodes.NoError };
      
      };

    const revalidateTransitions = (previous_transitions : Transitions, previous_inputs : i_input_values_tokenized, tokenized_inputs : i_input_values_tokenized) => {
      const new_transitions: Transitions = {};
      const initial_symbol = tokenized_inputs.init_symbol[0];
      const blank_symbol = tokenized_inputs.blank_symbol[0];
      const new_states = Array.from(new Set(tokenized_inputs.states));

      const new_alphabet = Array.from(new Set([initial_symbol, ...(tokenized_inputs.in_alphabet.filter((symbol) => symbol != "").concat(tokenized_inputs.aux_alphabet.filter((symbol) => symbol != ""))), blank_symbol]));
    
      for (const state of new_states) {
        new_transitions[state] = {};

        for (const symbol of new_alphabet) 
          new_transitions[state][symbol] = updateTransition(previous_transitions, previous_inputs, new_states, new_alphabet, state, symbol);
      }

      return new_transitions
    }
  



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
        tokenized_inputs: new_tokenized_values,
        transitions: revalidateTransitions(prevState.transitions, prevState.tokenized_inputs, new_tokenized_values)
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

        <div id="div5">
          <TransitionsErrorMessages transitions={transitions} />
        </div>

      </ContainerBody>

      
    </Container>
  );
}

export default Home;