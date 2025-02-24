import { InputValues, TokenizedInputValues, Transitions } from "../../../../../types/types";
import { tokenize } from "../../../../../utils/tokenize";
import { getElementText, getLinkText } from "../../utils";

export function initEditLink(
    paper: joint.dia.Paper,
    movingLink: any,
    inputs: InputValues ,tokenizedInputs: TokenizedInputValues, transitions: Transitions, handleInputsChange:any,
    eventHandlers: any[]
){  

    const alphabet = Array.from(
        new Set([
          tokenizedInputs.initSymbol[0],
          ...tokenizedInputs.inAlphabet.filter((symbol) => symbol !== ""),
          ...tokenizedInputs.auxAlphabet.filter((symbol) => symbol !== ""),
          tokenizedInputs.blankSymbol[0],
        ]))

    const graph = paper.model;
    const container = paper.el;
      
    
      // Edição de link ao clicar 2 vezes sobre ele
        paper.on('link:pointerdblclick', (linkView, event) => {

        // Cancela os eventos de deleção do link
        eventHandlers.forEach((eventHandler) => {
            if(eventHandler.event == "keydown")
                eventHandler.element.removeEventListener(eventHandler.event, eventHandler.handler as EventListener);
        })

          if (container === null) return;

          // Se clicou sobre um círculo é porque clicou em um vértice (para editar, é preciso clicar direto na caixa de texto)
          if(event.target.tagName === "circle") 
            return;

          const link = linkView.model;

          // Obtém o texto antes da edição
          const currentText = getLinkText(link);
          const originalText = currentText;
        
          // tokeniza o texto e obtém o símbolo de leitura da transição
          const readSymbol = tokenize(originalText)[0];

          // Obtém o alvo e a fonte
          const originNode = graph.getCell(movingLink.current.model.attributes.source.id);
          const originState = getElementText(originNode as joint.dia.Element);

          const targetNode = graph.getCell(movingLink.current.model.attributes.target.id);
          const targetState = getElementText(targetNode as joint.dia.Element);
        
          

          // Cria um elemento input para edição e o adiciona ao documento

          const textBox = event.target.getBoundingClientRect();

          const input = document.createElement('input');
          input.value = currentText;
          input.style.position = 'absolute';
          input.style.left = `${textBox.x}px`; 
          input.style.top = `${textBox.y}px`;
          input.style.fontSize = '12px';
          input.style.padding = '2px';
          input.style.zIndex = '4';
          input.style.background = '#fff';
          input.style.border = '1px solid #ccc';
          input.style.borderRadius = '4px';
          input.style.width = `${textBox.width}px`;
          input.style.height = `${textBox.height}px`;
        
          document.body.appendChild(input);
        
          input.focus();
        
          // Salva o texto e fecha o input ao teclar enter ou esc
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'Escape') saveText();
          });

          // salva o texto e fecha o input ao cliar fora dele
          const handleClick = (event: any) => {
            if (event.target === input) return;
          
            saveText();
            document.removeEventListener('mousedown', handleClick);
          };
        
          document.addEventListener('mousedown', handleClick);
          eventHandlers.push({element: document, event: "mousedown", handler: handleClick});
        
          const saveText = () => {
            // tokeniza o texto editado
            let transitionInfo = tokenize(input.value);
            const newTransitions = structuredClone(transitions); 
            
            // Se o alfabeto não inclui o símbolo de leitura e tem alguma coisa escrita na trANSIÇÃO, retorna. Ou seja, não salva a edição e deixa como estava
            if(transitionInfo.length == 0 || !alphabet.includes(transitionInfo[0])){
              newTransitions[originState][readSymbol].transitionText = "";
              newTransitions[originState][readSymbol].direction = "";
              newTransitions[originState][readSymbol].nextState = "";
              newTransitions[originState][readSymbol].newSymbol = "";
              input.remove();
              document.removeEventListener('mousedown', handleClick);
              handleInputsChange(inputs, tokenizedInputs, newTransitions);
              return;
            }




            // Se tiver algo, tem que tomar cuidado com o não determinismo:

            // Pega a transição antiga do estado de origem lendo o símbolo definido na edição 
            const prevTransition = newTransitions[originState][transitionInfo[0]];


              // Se o símbolo de leitura foi trocado na edição e a transição antiga não é vazia, temos 2 transições diferentes partindo do mesmo estado e lendo o mesmo símbolo: não determinismo
              // Aqui a edição está apenas sendo ignorada
            if(readSymbol != transitionInfo[0] && prevTransition.transitionText != ""){
              alert(`Não determinismo detectado: [${originState}, ${transitionInfo[0]}]`); 
              input.remove();
              document.removeEventListener('mousedown', handleClick);
              return;
            }

            // Apaga a transição antiga
            newTransitions[originState][readSymbol].transitionText = "";
            newTransitions[originState][readSymbol].direction = "";
            newTransitions[originState][readSymbol].nextState = "";
            newTransitions[originState][readSymbol].newSymbol = "";

            // Passando do teste do não determinismo, pode salvar a transição, colocar o valor nela na nova label do link e atualizar as transições
              let next;
              if(transitionInfo.length > 1)
                next = `${targetState}, ${transitionInfo.slice(1).join(", ")}`;
              else
                next = targetState;

              newTransitions[originState][transitionInfo[0]] = { ...newTransitions[originState][transitionInfo[0]], transitionText: next, direction: transitionInfo[2], nextState: targetState, newSymbol: transitionInfo[1] };
              
            if (input) {
              link.label(0, {
                position: { distance: 0.5, offset: -15 },
                attrs: {
                  text: { text: input.value, fontSize: 12, fontWeight: "bold" },
                },
              });
        
              document.removeEventListener('mousedown', handleClick);
        
              handleInputsChange(inputs, tokenizedInputs, newTransitions);
              input.remove();
            }
          };
        });

    }