import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {Container, ContainerBody, Div11, Div12, Div13, Div14, Div2p} from "./styled.ts";

import {CurrentTool, errorCodes } from '../../types/types';

import { useStateContext } from '../../ContextProvider.tsx';

import Header from '../../components/Header/index.tsx';
import Buttons from '../../components/GeneralButtons/index.tsx';
import TransitionTable from '../../components/TransitionTable/index.tsx';
import SimpleDiagram from '../../components/StateDiagram/index.tsx';




enum MachineOutput {
  ACCEPT = "ACEITA",
  REJECT = "REJEITA",
  InvalidDirection = "ERRO! Movimento deve ser D ou E apenas",
  InvalidNumberOfParameters = "ERRO! Escreva: estado, movimento (R/L), símbolo",
  InvalidState = "ERRO! Novo estado deve pertencer ao conjunto de estados",
  InvalidSymbol = "ERRO! Símbolo escrito deve pertencer ao alfabeto da fita",
  NONE = ""
}



export function Test() { 

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

    const  { inputStates } = useStateContext();

    // A fita é uma simples string
    const [tape, setTape] = useState<String>((inputStates.tokenizedInputs.initSymbol[0].length > 1? "[" + inputStates.tokenizedInputs.initSymbol[0] + "]" : inputStates.tokenizedInputs.initSymbol[0]) + inputStates.tokenizedInputs.blankSymbol[0]);

    // currState representa o estado atual da máquina. É simplesmente uma array com o nome do estado atual e o index atual na fita
    const [currState, setState] = useState<[string, number]>([inputStates.tokenizedInputs.initState[0], 0]);

    const [value, setValue] = useState(50); // Valor inicial

    const [output, setOutput] = useState<MachineOutput>(MachineOutput.NONE);

    const [run, setRun] = useState(false);
    const [machineClock, setMachineClock] = useState(false);


    const noEditTool = useRef<CurrentTool>({noEdit: true, addNodes: false, editLinks: false, selection: false, standard: false});


  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));



// RUN
  useEffect(() => {

    const runMachine = async () => {
      if (!run || output != MachineOutput.NONE) return;
  
      if(handleStep())
        await sleep(value * 10);
  
      setMachineClock(!machineClock);
    };


    if(!run) return;

    if(output != MachineOutput.NONE){
      setRun(false);
      return;
    }

    runMachine();

  }, [machineClock, run])



  const handleStep = () => {
    //const maquinaTuring = new TuringMachine(tokenizedInputs, transitions, tape, currState);
    //setCurrState(maquinaTuring.step());


    if(output != MachineOutput.NONE)
      return false;

    if(tape.length == 0){
      console.log("REJEITA");
      setOutput(MachineOutput.REJECT);
      return false;
    }


    let currSymbol = tape[currState[1]];
    let currIndex = currState[1];

    if(currSymbol == "["){
      const endIndex = tape.indexOf("]", currIndex + 1);

        if (endIndex === -1) {
          console.log("ERRO: símbolo ']' não encontrado");
          setOutput(getOutputError(-1));
          return false;
        }

  // Extrai os símbolos entre "[" e "]"
        currSymbol = tape.slice(currIndex + 1, endIndex);
    }

    const transition = inputStates.transitions[currState[0]][currSymbol];

    if(transition == undefined){
      console.log("Rejeita");
      setOutput(MachineOutput.REJECT);
      return false;
    }

    if(transition.error != errorCodes.NoError){
      console.log("Erro");
      setOutput(getOutputError(transition.error));
      return false;
    }

    if(transition.transitionText == ""){
      console.log("REJEITA");
      setOutput(MachineOutput.REJECT);

      return false;
    }

    else{
      const nextState = transition.nextState;
      const hasNewSymbolMoreThanOneCharacter = transition.newSymbol.length > 1;

      const indexIncrement = (hasNewSymbolMoreThanOneCharacter? (2 + transition.newSymbol.length) : 1);

      const newIndex = currIndex + indexIncrement;
      


      if(newIndex >= tape.length + indexIncrement - (currSymbol.length + ((currSymbol.length > 1)? 2 : 0))){
        console.log("A");
        setTape(tape.substring(0, currIndex) + (hasNewSymbolMoreThanOneCharacter? "[" + transition.newSymbol + "]" : transition.newSymbol) + inputStates.tokenizedInputs.blankSymbol[0]);

      }
      
      else{
        console.log("B");
        setTape(tape.substring(0, currIndex) + (hasNewSymbolMoreThanOneCharacter? "[" + transition.newSymbol + "]" : transition.newSymbol) +  tape.substring(currIndex + (currSymbol.length > 1? currSymbol.length + 2 : 1), tape.length));
        }

      const newMachineState = [nextState, newIndex];

      setState(newMachineState as [string, number]);

      if(inputStates.tokenizedInputs.finalStates.includes(nextState)){
        console.log("ACEITA");
        setOutput(MachineOutput.ACCEPT);

        return false;
      }
      
    }

    return true;
  }



  // Quando a fita é alterada pelo usuário, atualiza ela e reseta o estado atual
  const handleTapeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const tokenizedInputs = inputStates.tokenizedInputs;

    const newTape = e.target.value;
    setTape(tokenizedInputs.initSymbol[0] + newTape);
    setState([tokenizedInputs.initState[0], 0]);
    setOutput(MachineOutput.NONE);
  }


  const handleReset = () => {
    setState([inputStates.tokenizedInputs.initState[0], 0]);
    setRun(false);

    const tapeValue = document.getElementById("tapeValue") as HTMLInputElement;
    setTape((inputStates.tokenizedInputs.initSymbol[0].length > 1 ? "[" + inputStates.tokenizedInputs.initSymbol[0] + "]" : inputStates.tokenizedInputs.initSymbol[0]) + tapeValue.value)

    setOutput(MachineOutput.NONE);
  }


  const getOutputColor = (output: MachineOutput) => {
    switch (output) {
      case MachineOutput.ACCEPT:
        return "green";
      case MachineOutput.REJECT:
        return "red";
      case MachineOutput.NONE:
        return "black";
      default:
        return "darkred";
    }
  }

  const getOutputError = (error: number) => {
    switch (error) {
      case (errorCodes.InvalidDirection): 
        return MachineOutput.InvalidDirection;

      case errorCodes.InvalidNumberOfParameters:
        return MachineOutput.InvalidNumberOfParameters;

      case errorCodes.InvalidState:
        return MachineOutput.InvalidState;

      case errorCodes.InvalidSymbol: 
        return MachineOutput.InvalidSymbol;
      
      default:
        return MachineOutput.NONE;
    }
  }

  return (
    <Container $expand={expandedComponent}>

      <Header/>

      <ContainerBody $expand={expandedComponent} className={expandedComponent === "diagram" ? "expand-diagram" : expandedComponent === "table" ? "expand-table" : "standard"}>
        

      <div style={{width: "max(25%, 85px)"}}>
      <Buttons to={"../"} title="Editar Máquina de Turing" width={'100%'} height={'max(4.44vh, 29px)'}/>
      </div>

      <div style={{display: "flex", width: "100%", minHeight: (expandedComponent != "none")? "max(80vh, 530px)" : "max(calc(80vh - 18px), 426px)",  maxHeight: (expandedComponent != "none")? "max(80vh, 530px)" : "max(calc(80vh - 18px), 426px)", gap: "4vw"}}>
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
            <TransitionTable OnChangeTransitionTable={(newTransitions) => {}}  editable={false} />
          </div> 


        <div id='div2_inputs'>
                    <Div11>
                      <p>Entrada:</p>
                      <input id="tapeValue" type="text" onChange={handleTapeChange}/>
                    </Div11>
                       
                    <Div2p>
                      <Div12>
                        <p style={{whiteSpace: "pre", color: "blue"}}>{" ".repeat(currState[1])}↓{currState[0]}</p>
                        <p style={{}}>{tape}</p>
                      </Div12>
          
                      <Div13>
                        <button onClick={handleReset}>Reset</button>
                        <button onClick={() => setRun(true)}>Run</button>
                        <button onClick={() => setRun(false)}>Stop</button>
                        <button onClick={handleStep}>Step</button>
                      </Div13>

                    </Div2p>

          
                      <Div14>
                        <p style={{fontSize: "18px", color: getOutputColor(output)}}>{output}</p>
                      </Div14>

        <div id="temporizador" style={{height: "15%", display: "flex", flexDirection: "column", justifyContent: "center"}} >
          <input
            style={{width: "30%", minWidth: "150px"}}
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
      
          <p style={{fontSize: "18px", fontWeight: "500"}}>Valor: {value * 10} ms</p>
        </div>

        </div>

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


          </div>
          <div style={{width: "100%", flexGrow: "1", overflow: "hidden", marginBottom: "1vh", backgroundColor: "#FFF"}}> 
            <SimpleDiagram  currentTool={noEditTool.current}  currState={currState[0]}/> 

            
        </div>


        {(expandedComponent === "diagram" && 
                        <div id='div_inputs'>
                    <Div11>
                      <p>Entrada:</p>
                      <input id="tapeValue" type="text" onChange={handleTapeChange}/>
                    </Div11>
                       
                    <Div2p>
                      <Div12>
                        <p style={{whiteSpace: "pre", color: "blue"}}>{" ".repeat(currState[1])}↓{currState[0]}</p>
                        <p style={{}}>{tape}</p>
                      </Div12>
          
                      <Div13>
                        <button onClick={handleReset}>Reset</button>
                        <button onClick={() => setRun(true)}>Run</button>
                        <button onClick={() => setRun(false)}>Stop</button>
                        <button onClick={handleStep}>Step</button>
                      </Div13>

                    </Div2p>

          
                      <Div14>
                        <p style={{fontSize: "18px", color: getOutputColor(output)}}>{output}</p>
                      </Div14>

        <div id="temporizador" style={{height: "15%", display: "flex", flexDirection: "column", justifyContent: "center"}} >
          <input
            style={{width: "30%", minWidth: "150px"}}
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
      
          <p style={{fontSize: "18px", fontWeight: "500"}}>Valor: {value * 10} ms</p>
        </div>

        </div>
            )
            
            }

          
        </div>

        :

        null

    }

    </div>

      </ContainerBody>

    </Container>
  );
}

export default Test;