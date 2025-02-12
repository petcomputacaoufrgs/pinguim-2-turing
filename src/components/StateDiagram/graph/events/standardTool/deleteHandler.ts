import { useEffect } from "react";
import { InputValues, TokenizedInputValues, Transitions } from "../../../../../types/types";
import { getElementText, getLinkText } from "../../utils";
import { tokenize } from "../../../../../utils/tokenize";


export const nodeDeleteHandler = (paper:joint.dia.Paper, selectedNode : any, inputs: InputValues ,tokenizedInputs: TokenizedInputValues, transitions: Transitions, handleInputsChange:any) => {
    // Deleta o nodo selecionado quando a tecla Delete é apertada
    const deleteNode = (e:any) => {

      if(e.key != 'Delete' || !(selectedNode.current))
        return;

      document.querySelectorAll('.node-button').forEach(btn => btn.remove());

      const deletedState = getElementText(selectedNode.current.model as joint.dia.Element);


      const newStates = tokenizedInputs.states.filter((state) => state != deletedState);
      const newFinalStates = tokenizedInputs.finalStates.filter((state) => state != deletedState);
      const newInitState = tokenizedInputs.initState.filter((state) => state != deletedState);

      const newTransitions = {...transitions};
      delete newTransitions[deletedState];


      selectedNode.current = null;
      
      handleInputsChange({...inputs, states: newStates.join(", "), finalStates: newFinalStates.join(", "), initState: newInitState.join(", ")},
        {...tokenizedInputs, states: newStates, finalStates: newFinalStates, initState: newInitState},
        newTransitions
      )
    }

    return deleteNode;
  }

export const linkDeleteHandler = (paper:joint.dia.Paper, selectedLink: any, inputs: InputValues ,tokenizedInputs: TokenizedInputValues, transitions: Transitions, handleInputsChange:any) => {

    // Deleção de um link selecionado
    const deleteLink = (e:any) => {
    
        const alphabet = Array.from(
            new Set([
              tokenizedInputs.initSymbol[0],
              ...tokenizedInputs.inAlphabet.filter((symbol) => symbol !== ""),
              ...tokenizedInputs.auxAlphabet.filter((symbol) => symbol !== ""),
              tokenizedInputs.blankSymbol[0],
            ]))
            
              if(e.key != 'Delete' || !selectedLink.current)
                return;
        
              const deletedTransition = tokenize(getLinkText(selectedLink.current.model));
    
              
              if(deletedTransition.length > 0){
                const readSymbol = deletedTransition[0];
                const originNode = paper.model.getCell(selectedLink.current.model.attributes.source.id);
    
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
    

            return deleteLink;
          }