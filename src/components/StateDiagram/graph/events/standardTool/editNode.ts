import { InputValues, TokenizedInputValues, Transitions } from "../../../../../types/types";





export function initEditNode(
    paper: joint.dia.Paper,
    currentCellView: any,
    inputs: InputValues ,tokenizedInputs: TokenizedInputValues, transitions: Transitions, handleInputsChange:any,
    eventHandlers: any[]
){  


    const container = paper.el;
    const states = tokenizedInputs.states;

    // Habilita a edição de texto ao clicar duas vezes sobre nodo
    paper.on('element:pointerdblclick', (cellView, event, x, y) => {

        // Cancela os eventos de deleção do nodo
        eventHandlers.forEach((eventHandler) => {
            
            if(eventHandler.event == "keydown"){
                eventHandler.element.removeEventListener(eventHandler.event, eventHandler.handler as EventListener);
            }
        })
  
        if(container === null)
          return;
  
        document.querySelectorAll('.node-button').forEach(btn => btn.remove());
  
        const cell = cellView.model;
  
        const currentText = cell.attr('label/text');
        const originalText = currentText;
  
        const bbox = cellView.getBBox();
        const paperRect = container.getBoundingClientRect();
  
        // Cria um elemento input para edição
        const input = document.createElement('input');
        input.value = currentText;
        input.style.position = 'absolute';
        input.style.left = `${paperRect.x + bbox.x}px`;
        input.style.top = `${paperRect.y + bbox.y}px`;
        input.style.fontSize = '12px';
        input.style.padding = '2px';
        input.style.zIndex = '1000';
        input.style.background = '#fff';
        input.style.border = '1px solid #ccc';
        input.style.borderRadius = '4px';
        input.style.width = `${bbox.width}px`;
        input.style.height = `${bbox.height}px`;
  
  
        document.body.appendChild(input);
  
        
        input.focus(); // Permite edição imediata
  
  
        const handleClick = (event: any) => {
          if (event.target === input) return;
          saveText();
          document.removeEventListener('mousedown', handleClick);
        };

        const handleWheel = (event: WheelEvent) => {
          event.preventDefault(); // Evita o scroll padrão da página
          saveText();
          paper.el.removeEventListener('wheel', handleWheel);
        };
  
  
        document.addEventListener("mousedown", handleClick);
        eventHandlers.push({element: document, event: "mousedown", handler: handleClick});
  
        paper.el.addEventListener('wheel', handleWheel);
        eventHandlers.push({element: paper.el, event: "wheel", handler: handleWheel});

  
        // Lida com teclas pressionadas enquanto o texto está sendo editado
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key == 'Escape') 
            saveText();
        });
      
  
        const saveText = () => {
          if (input) {
  
            if(input.value == originalText){
              input.remove();
              return;
            }
  
            cell.attr('label/text', input.value); 
  
            if(currentCellView.current)
              currentCellView.current = null;
            
  
            let newStatesTokenized;
            let newFinalStatesTokenized = tokenizedInputs.finalStates;
            let newInitState = tokenizedInputs.initState;
  
            if(input.value == ''){
              newStatesTokenized = states.filter((s) => (s != originalText));
              newFinalStatesTokenized = newFinalStatesTokenized.filter((s) => (s != originalText));
              newInitState = newInitState.filter((s) => (s != originalText));
            }
            else{
              if(tokenizedInputs.finalStates.includes(originalText))
                newFinalStatesTokenized = newFinalStatesTokenized.map((s) => (s === originalText ? input.value : s));
  
              if(tokenizedInputs.initState.includes(originalText))
                newInitState = newInitState.map((s) => (s === originalText ? input.value : s));
  
              newStatesTokenized = states.map((s) => (s === originalText ? input.value : s));
            }
              
              
            handleInputsChange({...inputs, states: newStatesTokenized.join(", "), finalStates:newFinalStatesTokenized.join(", "), initState: newInitState.join(", ")}, 
              {...tokenizedInputs, states: newStatesTokenized, finalStates:newFinalStatesTokenized, initState:newInitState}, 
              transitions); 
  
            input.remove();
            document.removeEventListener('mousedown', handleClick);
            paper.el.removeEventListener('wheel', handleWheel);
            
          }
        };
      
      });

    }