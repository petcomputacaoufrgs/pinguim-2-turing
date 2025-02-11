import { useEffect } from "react";
import { InputValues, TokenizedInputValues, Transitions } from "../../../../types/types";
import { getElementText, getLinkText } from "../../utils";
import { tokenize } from "../../../../utils/tokenize";




export const initDeleteHandler = (paper:joint.dia.Paper, selectedNode : joint.dia.CellView, selectedLink: joint.dia.LinkView, setSelectedNode:any, setSelectedLink:any, inputs: InputValues ,tokenizedInputs: TokenizedInputValues, transitions: Transitions, handleInputsChange:any) => {


    // Deleta o nodo selecionado quando a tecla Delete é apertada
    const deleteNode = (e:any) => {

      if(e.key != 'Delete' || !(selectedNode))
        return;

      document.querySelectorAll('.node-button').forEach(btn => btn.remove());

      const deletedState = getElementText(selectedNode.model as joint.dia.Element);


      const newStates = tokenizedInputs.states.filter((state) => state != deletedState);
      const newFinalStates = tokenizedInputs.finalStates.filter((state) => state != deletedState);
      const newInitState = tokenizedInputs.initState.filter((state) => state != deletedState);

      const newTransitions = {...transitions};
      delete newTransitions[deletedState];


      setSelectedNode(null);
      
      handleInputsChange({...inputs, states: newStates.join(", "), finalStates: newFinalStates.join(", "), initState: newInitState.join(", ")},
        {...tokenizedInputs, states: newStates, finalStates: newFinalStates, initState: newInitState},
        newTransitions
      )
    }


    // Deleção de um link selecionado
    const deleteLink = (e:any) => {
    
        const alphabet = Array.from(
            new Set([
              tokenizedInputs.initSymbol[0],
              ...tokenizedInputs.inAlphabet.filter((symbol) => symbol !== ""),
              ...tokenizedInputs.auxAlphabet.filter((symbol) => symbol !== ""),
              tokenizedInputs.blankSymbol[0],
            ]))
            
              if(e.key != 'Delete' || !selectedLink)
                return;
        
              const deletedTransition = tokenize(getLinkText(selectedLink.model));
    
              
              if(deletedTransition.length > 0){
                const readSymbol = deletedTransition[0];
                const originNode = paper.model.getCell(selectedLink.model.attributes.source.id);
    
                // Isso não deveria acontecer...
                if(originNode === null || originNode.attributes === undefined || originNode.attributes.attrs === undefined || originNode.attributes.attrs.label === undefined)
                    return;
    
                const originState = getElementText(originNode as joint.dia.Element);
    
                // Nem isso...
                if(!originState)
                  return;
                
    
    
                if(alphabet.includes(readSymbol)){ 
                  handleInputsChange(inputs, tokenizedInputs, {...transitions, [originState]: {...transitions[originState], [readSymbol]: { next: "", error: 0 } } });
                }
                else{ // Muito menos isso, mas por enquanto deixa aí
                  alert("Erro: Símbolo lido não existe no alfabeto");
                  handleInputsChange(inputs, tokenizedInputs, transitions);
                }
              
              }
            }
    
         



// Atualiza eventos de deleção quando um nodo ou link é selecionado
useEffect(() => {
    if (selectedNode) {
      document.addEventListener("keydown", deleteNode);
    } else {
      document.removeEventListener("keydown", deleteNode);
    }
  
    if (selectedLink) {
      document.addEventListener("keydown", deleteLink);
    } else {
      document.removeEventListener("keydown", deleteLink);
    }
  
    return () => {
      document.removeEventListener("keydown", deleteNode);
      document.removeEventListener("keydown", deleteLink);
    };
  }, [selectedNode, selectedLink]);
  
}
/*
  // Atualiza os botões quando um nodo é selecionado
  useEffect(() => {
    document.querySelectorAll(".node-button").forEach((btn) => btn.remove());
  
    if (selectedNode) {
      const bbox = selectedNode.getBBox();
      const paperRect = paper.el.getBoundingClientRect();
  
      const button1 = createButton("Final", 0, paperRect, bbox);
      button1.onclick = () => changeFinalStatus(selectedNode.model);
  
      const button2 = createButton("Inicial", 20, paperRect, bbox);
      button2.onclick = () => changeInitStatus(selectedNode.model);
  
      selectedNode.model.on("change:position", () =>
        updateButtonPositions(button1, button2)
      );
    }
  }, [selectedNode]);
}

*/