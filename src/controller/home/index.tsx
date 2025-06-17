import { ChangeEvent, useRef, useState } from 'react';
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
import HelpPopUp from '../../components/HelpPopUp/index.tsx';

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

 
    const [expandedComponent, setExpandedComponent] = useState<"none" | "diagram" | "table">("none");

    const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const [showAsMobile, setShowAsMobile] = useState<boolean>(isMobile || window.innerWidth < 768);


    const onResize = () => {

      const showAsMobile = isMobile || window.innerWidth < 768;

      if(showAsMobile){
        setExpandedComponent("none");
      }

      setShowAsMobile(showAsMobile);

    }

    window.addEventListener('resize', onResize);

    window.addEventListener("beforeunload", function (e) {
      e.preventDefault();     
    });

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


    const [showHelp, setShowHelp] = useState<boolean>(false);



  return (
    <Container $expand={expandedComponent}>

      <HelpPopUp show={showHelp} setShow={setShowHelp} />
      <Header/>

      <ContainerBody $expand={expandedComponent} className={expandedComponent === "diagram" ? "expand-diagram" : expandedComponent === "table" ? "expand-table" : "standard"}>
        
      <div id="upper_div">
        <div id="div1">
          <div id="div1_inputs">    
            <ParentInput onFileInputDoc={setDocumentationValue} onChangeInputs={handleInputsChange} />
          </div>

          <div id="div1_doc">
            <Documentation onChange={onChangeDocumentationValue}/>
          </div>
        </div>

        
        <div id="div4">
          <ValidationMessage />
        </div>

      </div>


      <div style={{display: "flex", width: "100%", minHeight: (expandedComponent != "none")? "max(80vh, 530px)" : "max(calc(52vh - 18px), 328px)", gap: "4vw"}}>
      {

        (expandedComponent != "diagram") ?

        <div id="div2">
            <div style={{display: "flex", gap: "1vw", alignItems: "center"}}> 
              <p>Tabela de Transição:</p>
              
              { (!showAsMobile && 
              <button style={{height: "70%"}} onClick={() => setExpandedComponent(expandedComponent === "table" ? "none" : "table")}>
              {expandedComponent === "table" ? "Recolher" : "Expandir"}
              </button>
               )
              }

              
              

            </div>
          <div id='div2_table'>
          <TransitionTable OnChangeTransitionTable={handleTransitionsChange} editable={true} />
          </div> 

          <Buttons height="max(4.44vh, 29px)" width="100%" to={"/computing"} title="Computar" disabled={Object.values(errors).some(valor_bool => !valor_bool)}/> 
        </div> 
        
        :

        null
    
    }

    {
      (expandedComponent != "table" && !showAsMobile) ?

        <div id="div3">

         <div style={{display: "flex", gap: "1vw", alignItems: "center"}}> 

            <p>Grafo:</p>

            <button style={{height: "70%"}} onClick={() => setExpandedComponent(expandedComponent === "diagram" ? "none" : "diagram")}>
            {expandedComponent === "diagram" ? "Recolher" : "Expandir"}
            </button>

            <button style={{height: "70%"}} onClick={() => setShowHelp(true)}>Ajuda</button>

            


            {expandedComponent === "diagram" && (<><Tools width='48vw' currentTool={currentTools} onChangeTool={setCurrentTool}/>
                                                   <Buttons height="max(4.44vh, 29px)" width="100%" to={"/computing"} title="Computar" disabled={Object.values(errors).some(valor_bool => !valor_bool)}/>
                                                 </>)}

          </div>
          <div style={{width: "100%", flexGrow: "1", overflow: "hidden", marginBottom: "1vh", backgroundColor: "#FFF"}}> 
            <SimpleDiagram currentTool={currentTools}  onChangeInputs={setInputValues} saveStateToHistory={saveStateToHistory} selectedCells={selectedCells} selectionBoxRef={selectionBoxRef}/> 
          </div>

          {expandedComponent !== "diagram" && (<Tools currentTool={currentTools} onChangeTool={setCurrentTool}/>)}
          
        </div>

        :

        null

    }

    </div>




        <div id="div5">
          <TransitionsErrorMessages />
        </div>

      </ContainerBody>

    </Container>
  );
}

export default Home;