import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import {Container, ContainerBody, Div11, Div12, Div13, Div14, Div2p} from "./styled.ts";
import Header from '../../components/Header/index.tsx';
import Buttons from '../../components/GeneralButtons/index.tsx';
import { useStateContext } from '../../ContextProvider.tsx';
import { CurrentTool, errorCodes } from '../../types/types.ts';
import SimpleDiagram from '../../components/StateDiagram/index.tsx';
import TransitionTable from '../../components/TransitionTable/index.tsx';


enum MachineOutput {
  ACCEPT = "ACEITA",
  REJECT = "REJEITA",
  InvalidDirection = "ERRO! Movimento deve ser D ou E apenas",
  InvalidNumberOfParameters = "ERRO! Escreva: estado, movimento (R/L), símbolo",
  InvalidState = "ERRO! Novo estado deve pertencer ao conjunto de estados",
  InvalidSymbol = "ERRO! Símbolo escrito deve pertencer ao alfabeto da fita",
  NONE = ""
}


export function Home() {  


    const  { inputStates } = useStateContext();

    // A fita é uma simples string
    const [tape, setTape] = useState<String>(inputStates.tokenizedInputs.initSymbol[0]);

    // currState representa o estado atual da máquina. É simplesmente uma array com o nome do estado atual e o index atual na fita
    const [currState, setState] = useState<[string, number]>([inputStates.tokenizedInputs.initState[0], 0]);

    const [value, setValue] = useState(50); // Valor inicial

    const [output, setOutput] = useState<MachineOutput>(MachineOutput.NONE);

    const [run, setRun] = useState(false);
    const [machineClock, setMachineClock] = useState(false);
    /*

    Quanto às entradas, acho que a que vale a pena mudar a estrutura no back para ser "equivalente" à estrutura do front é as transições
    Fazendo isso aproveitaríamos o fato de que as transições já vem do front como um Map

    Mas para tokenizedInputs e tape, talvez valha a pena receber os valores no back e processá-los para deixá-los de acordo com as estruturas definidas lá

    */
    const noEditTool = useRef<CurrentTool>({noEdit: true, addNodes: false, editLinks: false, selection: false, standard: false});




// Para inicializar, importar init e descomentar
/* 
  useEffect (() => {
    init().then(() => {
      console.log("Wasm pronto");
    }) 
  }, []);
*/


  /*
  handleRun e handleStep ativam quando os botões de run e step são pressionados, respectivamente. Nessas funções a máquina de turing é construída e então os métodos de run
  e step são chamados. Esses métodos são os métodos definidos no back para a TuringMachine e precisam retornar um array com o estado e o index na fita depois da execução 
  (ou outra, se uma estrutura mais inteligente for pensada)
  */

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


    const currSymbol = tape[currState[1]];

    const transition = inputStates.transitions[currState[0]][currSymbol];

    console.log(currSymbol, transition);
    console.log(currState);

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
      const newIndex = currState[1] + 1;

      if(newIndex >= tape.length)
        setTape(tape.substring(0, currState[1]) + transition.newSymbol + inputStates.tokenizedInputs.blankSymbol[0]);
      else
        setTape(tape.substring(0, currState[1]) + transition.newSymbol +  tape.substring(currState[1] + 1, tape.length));


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
    setTape(inputStates.tokenizedInputs.initSymbol[0] + tapeValue.value)

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
    <Container>
      <Header/>

      <ContainerBody>
        <div id="div2">
          <Buttons to={"../"} title="Editar Máquina de Turing" width={''} height={'4.5vh'}/>
          <p>Tabela de Transição:</p>

          <div style={{"overflow": "auto", "display": "flex", "alignItems": "flex-start"}}>
          <TransitionTable OnChangeTransitionTable={(newTransitions) => {}}  editable={false}/>
          </div>

        </div>

        <div id="div1">
          <Div11>
            <p>Entrada:</p>
            <input id="tapeValue" type="text" onChange={handleTapeChange}/>
          </Div11>
             
          <Div2p>
            <Div12>
              <p style={{whiteSpace: "pre"}}>{" ".repeat(currState[1])}↓{currState[0]}</p>
              <p>{tape}</p>
            </Div12>

            <Div13>
              <button onClick={handleReset}>Reset</button>
              <button onClick={() => setRun(true)}>Run</button>
              <button onClick={() => setRun(false)}>Stop</button>
              <button onClick={handleStep}>Step</button>
            </Div13>

            <Div14>
              <p style={{fontSize: "15px", color: getOutputColor(output)}}>{output}</p>
            </Div14>
          </Div2p>
            
        </div>

        <div id="div3">
          <p>Grafo:</p>
          <div>
            <SimpleDiagram currentTool={noEditTool.current} currState={currState[0]} />
          </div>  
        </div>

        <div style={{height: "5vh"}}>
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
      
          <p>Valor: {value * 10} ms</p>
        </div>

      </ContainerBody>

      
    </Container>
  );
}

export default Home;