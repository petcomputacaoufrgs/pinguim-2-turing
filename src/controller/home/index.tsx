import React, { ChangeEvent, useRef, useState } from 'react';
import {Container, ContainerBody} from "./styled.ts";

import { Transitions, InputValues, TokenizedInputValues, InputErrors, CurrentTool } from '../../types/types';

import { useStateContext } from '../../ContextProvider.tsx';

import Header from '../../components/Header/index.tsx';
import Documentation from '../../components/Documentation/index.tsx';
import Buttons from '../../components/GeneralButtons/index.tsx';
import ParentInput from '../../components/ParentInput/index.tsx';
import ValidationMessage from '../../components/ValidationMessage/index.tsx';
import TransitionTable from '../../components/TransitionTable/index.tsx';
import TransitionsErrorMessages from '../../components/TransitionsErrorMessages/index.tsx';
import SimpleDiagram from '../../components/StateDiagram/index.tsx';
import Tools from '../../components/Tools/index.tsx';

export function Home() { 

    const  { inputStates, setInputStates, changesHistory, changesIndex } = useStateContext();

    const {errors} = inputStates;
    const {tokenizedInputs} = inputStates;
    const {inputs} = inputStates;
    const {history, setHistory} = changesHistory;
    const {historyIndex, setHistoryIndex} = changesIndex;

    const [currentTools, setCurrentTool] = useState<CurrentTool>({
      editLinks: false, 
      addNodes: false, 
      selection: false, 
      standard: true, 
      noEdit: false
    });

    const selectionBoxRef = useRef<any>(null);
    const selectedCells = useRef<joint.dia.Cell[]>([]);

 

    const setInputValues = (newValues : InputValues, 
                            newTokenizedValues : TokenizedInputValues, 
                            newTransitions : Transitions, 
                            newErrors: InputErrors) => {

      selectionBoxRef.current = null;
      selectedCells.current = [];
      
      setInputStates(prevState => ({
        ...prevState,
        inputs: newValues,
        tokenizedInputs: newTokenizedValues,
        transitions: newTransitions,
        errors: newErrors
      }));
    }

    const saveStateToHistory = (newValues : InputValues, newTokenizedValues : TokenizedInputValues, newTransitions : Transitions, newErrors: InputErrors) => {
      const newHistory = history.slice(0, historyIndex + 1);       
      newHistory.push({inputs: newValues, tokenizedInputs: newTokenizedValues, transitions: newTransitions, errors: newErrors});
      setHistory(newHistory);
      setHistoryIndex(historyIndex + 1);
    }

    const handleInputsChange = (newValues : InputValues, newTokenizedValues : TokenizedInputValues, newTransitions : Transitions, newErrors: InputErrors) =>{
      saveStateToHistory(newValues, newTokenizedValues, newTransitions, newErrors);
      setInputValues(newValues, newTokenizedValues, newTransitions, newErrors);
    }

    const onChangeDocumentationValue = (event : ChangeEvent<HTMLTextAreaElement>) => {
      setInputStates(prevState => ({
        ...prevState,
        documentation : event.target.value
      }))
    }
   
    const setDocumentationValue = (docValue : string) => {
      setInputStates(prevStates => ({
        ...prevStates,
        documentation : docValue
      }))
    }


    const handleTransitionsChange = (newTransitions : Transitions) => {
      handleInputsChange(inputs, tokenizedInputs, newTransitions, errors);
    }


  return (
    <Container>

      <Header/>

      <ContainerBody>
        
        <div id="div1">
          <div>    
            <ParentInput onFileInputDoc={setDocumentationValue} onChangeInputs={handleInputsChange} />
          </div>

          <div id="div1_doc">
            <Documentation onChange={onChangeDocumentationValue}/>
          </div>
        </div>

        <div id="div2">
          <p>Tabela de Transição:</p>
          <div>
          <TransitionTable OnChangeTransitionTable={handleTransitionsChange} editable={true} />
          </div>

          <Buttons height="4.5vh" width="14vw" to={"/computing"} title="Computar" disabled={Object.values(errors).some(valor_bool => !valor_bool)}/>
        </div>

        <div id="div3">
          <p>Grafo:</p>
          <div style={{width: "80%", height: "75%", overflow: "hidden"}}> 
            <SimpleDiagram currentTool={currentTools}  onChangeInputs={setInputValues} saveStateToHistory={saveStateToHistory} selectedCells={selectedCells} selectionBoxRef={selectionBoxRef}/> 
          </div>

          <Tools currentTool={currentTools} onChangeTool={setCurrentTool}/>
        </div>

        <div id="div4">
          <ValidationMessage />
        </div>

        <div id="div5">
          <TransitionsErrorMessages />
        </div>

      </ContainerBody>

    </Container>
  );
}

export default Home;