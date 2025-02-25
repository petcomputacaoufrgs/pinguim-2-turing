import { InputValues, TokenizedInputValues, Transitions } from "../../../../../types/types";
import { tokenize } from "../../../../../utils/tokenize";
import { getElementText, getLinkText } from "../../getNodeData";

export const deleteSelectedCells = (
        paper: joint.dia.Paper,
        selectedCells: joint.dia.Cell[],
        inputs: InputValues ,tokenizedInputs: TokenizedInputValues, transitions: Transitions, 
        handleInputsChange:any,
        ) => {
      let newTransitions = structuredClone(transitions);
      let newStates = [...tokenizedInputs.states];
      let newFinalStates = [...tokenizedInputs.finalStates];
      let newInitState = [...tokenizedInputs.initState];

      const alphabet = Array.from(
        new Set([
          tokenizedInputs.initSymbol[0],
          ...tokenizedInputs.inAlphabet.filter((symbol) => symbol !== ""),
          ...tokenizedInputs.auxAlphabet.filter((symbol) => symbol !== ""),
          tokenizedInputs.blankSymbol[0],
        ]))

        
      // Para cada célula selecionada
      selectedCells.forEach((cell) => {

        // Se ela for um nodo (estado)
        if(cell.isElement()){
          const deletedState = getElementText(cell); // pega o nome dele
          newStates = newStates.filter((state) => state != deletedState); // tira ele dos estados
          newFinalStates = newFinalStates.filter((state) => state != deletedState); // tira dos estados finais
          newInitState = newInitState.filter((state) => state != deletedState); // tira do estado inicial

          delete newTransitions[deletedState]; // deleta todas as transições com ele como origem
        }

        // Se ela for um link
        else if(cell.isLink()){

          // Pega o texto da transição
          const deletedTransition = tokenize(getLinkText(cell));

          // Se tiver algo no texto da transição
          if(deletedTransition.length > 0){
            const readSymbol = deletedTransition[0];
            const originNode = paper.model.getCell(cell.attributes.source.id);

            // Checa se o nodo de origem não tem label. Se ele não tiver, apenas retorna
            // Isso não deveria acontecer, pois se há um link desenhado deve haver um estado de origem com nome para esse link
            if(originNode === null || originNode.attributes === undefined || originNode.attributes.attrs === undefined || originNode.attributes.attrs.label === undefined)
                return;

            // Pega o nome do estado de origem
            const originState = getElementText(originNode as joint.dia.Element);

            // Isso também não deveria acontecer, pois se há um estado desenhado ele deveria ter um nome (um texto)
            if(!originState)
              return;
            
            // Checa se esse estado está na tabela. Como estamos apagando os estados e junto deles todas as suas transições, essa situação pode ocorrer 
            // (quando apaguei o estado apaguei todas as transições dele junto, e agora estou tentnado apagar uma transição dele de novo). Nesse caso só retorna
            if(!newTransitions[originState])
              return;

            // Por fim, se o símbolo de leitura for válido para o alfabeto, aí sim apaga a transição
            if(alphabet.includes(readSymbol))
              newTransitions[originState] = {...newTransitions[originState], [readSymbol]: { transitionText: "", direction: "", nextState: "", newSymbol: "", error: 0 } };
          }
          
          else{ // Não ter nada no texto da transição não deveria acontecer, pois nesse caso a transição já deveria ter sido excluída
            alert("Transição sem texto");
          }
          
        }
      });

      handleInputsChange({...inputs, states: newStates.join(", "), finalStates: newFinalStates.join(", "), initState: newInitState.join(", ")},
                         {...tokenizedInputs, states: newStates, finalStates: newFinalStates, initState: newInitState},
                         newTransitions);
    }