import * as joint from "jointjs";
import { deleteSelectedCells } from "./deleteSelectedCells";
import { InputValues, TokenizedInputValues, Transitions } from "../../../../../types/types";


export function initCellsSelection(
    paper: joint.dia.Paper,
    selectedCells: joint.dia.Cell[],
    currentScale: number,
    translation: {x: number, y: number},

    inputs: InputValues ,tokenizedInputs: TokenizedInputValues, transitions: Transitions, handleInputsChange:any,
    eventHandlers: any[]

){ 

    const container = paper.el;
    const graph = paper.model;

    // Quando clica com o mouse, reseta todas as seleções e cria uma nova caixa de seleção, permitindo que ela cresça/diminua conforme o movimento do mouse
    const handleMouseDown = (event: MouseEvent) => {
      if (!container) return;
    
      selectedCells.forEach((cell) => {
        if(cell.isLink()){
          cell.attr('line/stroke', 'black');
        }
        else if(cell.isElement()){
          cell.attr('body/stroke', 'black'); 

        }
      });

      selectedCells = [];

      // todas as posições devem ser relativas ao container do grafo
      const containerRect = container.getBoundingClientRect();

      // Pega a posição inicial absoluta do clique
      const startX = event.clientX;
      const startY = event.clientY;
    
      // Cria um retângulo de seleção iniciando na posição do clique
      const selectionBox = document.createElement("div");
      selectionBox.style.position = "absolute";
      selectionBox.style.border = "1px dashed blue";
      selectionBox.style.background = "rgba(0, 0, 255, 0.2)";
      selectionBox.style.left = `${startX - containerRect.x}px`;
      selectionBox.style.top = `${startY - containerRect.y}px`;
      selectionBox.style.zIndex = "10";
      selectionBox.style.pointerEvents = "none"; // Para não bloquear outros eventos
      container.appendChild(selectionBox);
    
      // Atualiza o retângulo conforme o mouse se mexe
      const handleMouseMoveSelection = (moveEvent: MouseEvent) => {
        const currentX = moveEvent.clientX;
        const currentY = moveEvent.clientY;
    

        // Calcula a largura e altura da seleção 
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
    

        // Ajusta a posição caso o usuário arraste para cima/esquerda - left e top sempre serão, respectivamente, o menor x e o menor y entre a posição do primeiro clique ou a posição atual do mouse (relativas ao container) 
        selectionBox.style.left = `${Math.min(startX - containerRect.x, currentX - containerRect.x)}px`;
        selectionBox.style.top = `${Math.min(startY - containerRect.y, currentY - containerRect.y)}px`;
        selectionBox.style.width = `${width}px`;
        selectionBox.style.height = `${height}px`;


        // Verifica quais elementos foram selecionados

        const selectionRect = new joint.g.Rect((Math.min(startX, moveEvent.clientX) - containerRect.left - translation.x) / currentScale, 
                                               (Math.min(startY, moveEvent.clientY) - containerRect.top - translation.y) / currentScale, 
                                               (Math.abs(startX - moveEvent.clientX)) / currentScale, 
                                               (Math.abs(startY - moveEvent.clientY)) / currentScale);


        const allCells = paper.model.getCells();


        // As células selecionadas são aquelas dentre todas as células no grafo que intersectam o retângulo de seleção
        selectedCells = allCells.filter((cell) => {
        const bbox = cell.getBBox(); 

        if(selectionRect.intersect(bbox)){
          if(cell.isLink())
            cell.attr('line/stroke', 'blue');
          else if(cell.isElement())
            cell.attr('body/stroke', 'green'); 

          return true;
        }
        else{
          if(cell.isLink())
            cell.attr('line/stroke', 'black');
          else if(cell.isElement())
            cell.attr('body/stroke', 'black'); 
  
          return false;
          
        }});

      };
    
      // Quando solta o clique do mouse, permite a deleção de todas as células selecionadas
      const handleMouseUp = (event:any) => {
        document.removeEventListener("mousemove", handleMouseMoveSelection);
        document.removeEventListener("mouseup", handleMouseUp);
  
        const handleDeleteSelectedCells = (evt:any) => {
          if(evt.key != 'Delete')
            return;

          deleteSelectedCells(paper, selectedCells, inputs, tokenizedInputs, transitions, handleInputsChange);
          document.removeEventListener("keydown", handleDeleteSelectedCells);
        }

        document.addEventListener("keydown", handleDeleteSelectedCells);
        eventHandlers.push({element: document, event: "keydown", handler: handleDeleteSelectedCells});
    
        selectionBox.remove();
      };
    
      // Finalmente, adiciona os listeners de movimento do mouse e de solte
      document.addEventListener("mousemove", handleMouseMoveSelection);
      document.addEventListener("mouseup", handleMouseUp);
      eventHandlers.push({element: document, event: "mousemove", handler: handleMouseMoveSelection});
      eventHandlers.push({element: document, event: "mouseup", handler: handleMouseUp});
    };
    
    // Adiciona o evento de clique ao container
    if (container) {
      container.addEventListener("mousedown", handleMouseDown);
      eventHandlers.push({element: container, event: "mousedown", handler: handleMouseDown});
    }
  }