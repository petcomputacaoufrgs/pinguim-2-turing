import { InputValues, TokenizedInputValues, Transitions } from "../../../../../types/types";
import { getElementText } from "../../getNodeData";


export const handleChangeFinalStatus = (cell: joint.dia.Element, inputs: InputValues, tokenizedInputs: TokenizedInputValues, transitions: Transitions, handleInputsChange:any) => {
    // Dada uma célula (um nodo), checa se o estado representado por aquela célula é um estado final. Se for, torna ele um estado não final. Se não for, torna ele um estado final
    const changeFinalStatus = (cell:joint.dia.Element) => {
      const state = getElementText(cell);
      let newFinalStates : string[];

      if(tokenizedInputs.finalStates.includes(state)){
        newFinalStates = tokenizedInputs.finalStates.filter((s) => s != state);
      }
      else{
        if(tokenizedInputs.finalStates.length == 1 && tokenizedInputs.finalStates[0] == "") 
          newFinalStates = [state];
        else
          newFinalStates = [...tokenizedInputs.finalStates, state];
      }
  
      handleInputsChange({...inputs, finalStates: newFinalStates.join(", ")}, {...tokenizedInputs, finalStates: newFinalStates}, transitions);
    }


    return () => changeFinalStatus(cell);
}

export const handleChangeInitStatus = (cell: joint.dia.Element, inputs: InputValues, tokenizedInputs: TokenizedInputValues, transitions: Transitions, handleInputsChange:any) => {

    // Dada uma célula (um nodo), checa se o estado representado por aquela célula é um estado inicial. Se for, torna ele um estado não inicial. Se não for, torna ele um estado inicial
    const changeInitStatus = (cell:joint.dia.Element) => {
      const state = getElementText(cell)

      let newInitState : string[]; 

      if(tokenizedInputs.initState.includes(state))
        newInitState = tokenizedInputs.initState.filter((s) => s != state);
      else
        newInitState = [state];
  
      handleInputsChange({...inputs, initState: newInitState.join(", ")}, {...tokenizedInputs, initState: newInitState}, transitions);
    }

    return () => changeInitStatus(cell);
}


    // Função auxiliar usada para criar os botões que permitem tornar o estado de um nodo selecionado um estado inicial/final. Ela é usada para criar os botões ao lado dos nodos
    // Dado um texto, um deslocamento no eixo y e as informações de uma caixa, cria um botão no lado direito da caixa deslocado em y pelo valor passado e com o texto passado
export const createButton = (text:string, topOffset:number, container:any, bbox:any) => {
      const button = document.createElement('button');
      button.textContent = text;
      button.className = 'node-button';
      button.style.position = 'absolute';
      button.style.left = `${bbox.x + bbox.width + 10}px`; // Ao lado do nó
      button.style.top = `${bbox.y + topOffset}px`; // Ajuste vertical
      button.style.zIndex = "4"; // Garantir que fique acima do SVG
      if(container)
        container.appendChild(button);
      return button;
      };


export const handleUpdateButtonsPositions = (paper: joint.dia.Paper, currentCell: any, button1:HTMLButtonElement, button2:HTMLButtonElement) => {
      
      // Função usada para atualizar as posições dos botões que alteram o status inicial/final do nodo selecionado conforme ele se mexe
      // Dados dois botões, atualiza a posição deles para eles ficarem ao lado do nodo selecionado no momento. 
      const updateButtonsPositions = (button1:HTMLButtonElement, button2:HTMLButtonElement) => {
      const bbox = currentCell.getBBox();

      button1.style.left = `${bbox.x + bbox.width + 10}px`;
      button1.style.top = `${bbox.y}px`;
            
      button2.style.left = `${bbox.x + bbox.width + 10}px`;
      button2.style.top = `${bbox.y + 20}px`;
      };

      return () => updateButtonsPositions(button1, button2);
    }