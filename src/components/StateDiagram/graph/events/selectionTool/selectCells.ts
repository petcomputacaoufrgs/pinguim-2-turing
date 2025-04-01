import * as joint from "jointjs";
import { deleteSelectedCells } from "./deleteSelectedCells";
import { InputValues, TokenizedInputValues, Transitions } from "../../../../../types/types";
import { getElementText, getLinkText } from "../../getNodeData";
import { tokenize } from "../../../../../utils/tokenize";


export function initCellsSelection(
    paper: joint.dia.Paper,
    selectedCells: any,
    nodes: Map<string, joint.dia.Cell>,
    selectionBoxRef: any,
    currentScale: number,
    translation: {x: number, y: number},
    inputs: InputValues ,tokenizedInputs: TokenizedInputValues, transitions: Transitions, handleInputsChange:any,
    eventHandlers: any[]

){ 

// ----------------------------------------------------------------
// INICIALIZAÇÃO
// ----------------------------------------------------------------

  // div onde o grafo está sendo desenhado
  const container = paper.el;
  
  // Referência para a caixa de seleção (div) que será desenhada na tela
  let selectionBox : HTMLDivElement;


  // Função que, dada uma célula, muda sua cor para indicar que está desenhada
  const selectCell = (cell: joint.dia.Cell) => {
    if(cell.isLink())
      cell.attr('line/stroke', 'blue');
    else if(cell.isElement())
      cell.attr('body/stroke', 'green'); 
  }

  // Função que, dada uma célula, muda sua cor para indicar que não está selecionada
  const deselectCell = (cell: joint.dia.Cell) => {
    if (cell.isLink()) {
      cell.attr("line/stroke", "black");
    } else if (cell.isElement()) {
      cell.attr("body/stroke", "black");
    }
  }


  // Se já existe uma seleção, precisa redesenhá-la conforme a escala e a translação atual
  if(selectionBoxRef.current){

    // Cria um novo retângulo de seleção
    selectionBox = document.createElement("div");

    // Estilo padrão
    selectionBox.style.position = "absolute";
    selectionBox.style.border = "1px dashed blue";
    selectionBox.style.background = "rgba(0, 0, 255, 0.2)";
    selectionBox.style.zIndex = "10";
    selectionBox.style.pointerEvents = "none"; // Para não bloquear outros eventos

    // selectionBoxRef.current.style.left guarda sempre a posição relativa à escala 1:1, já transladada pela translação atual.

    // Posiciona de acordo com a translação e a escala. A translação é uma media absoluta, independente da escala, então é preciso retirá-la para multiplicar o valor sem considerar a translação
    // pela escala, e então colocá-la de novo (porque em selectionBoxRef.current.style.left a translação já está sendo contada)
    selectionBox.style.left = `${(parseFloat(selectionBoxRef.current.style.left) - translation.x) *  currentScale + translation.x}px`;
    selectionBox.style.top = `${(parseFloat(selectionBoxRef.current.style.top) - translation.y) * currentScale + translation.y}px`;

    // Ajusta o tamanho de acordo com a escala
    selectionBox.style.width = `${parseFloat(selectionBoxRef.current.style.width) * currentScale}px`;
    selectionBox.style.height = `${parseFloat(selectionBoxRef.current.style.height) * currentScale}px`;
  
    container.appendChild(selectionBox);

    // Marca todas as células selecionadas. Isso é necessário porque a re-renderização cria novas células, ou seja, as células marcadas antes são perdidas
    selectedCells.current.forEach((cell: joint.dia.Cell, index: number) => {

      const newCell = nodes.get(getElementText(cell as joint.dia.Element));
      selectedCells.current[index] = newCell;

      if(newCell)
        selectCell(newCell);

    });

  }

// ----------------------------------------------------------------
// DEFINIÇÃO DOS EVENTOS
// ----------------------------------------------------------------

  // Lida com o evento de quando é clicado no retângulo de seleção
  const handleMouseDownOnSelection = (event: MouseEvent) => {
    event.stopPropagation(); // Impede que o clique deselecione tudo

    // Pega a posição inicial do mouse
    const startX = event.clientX;
    const startY = event.clientY;
  
    // Pega as posições iniciais das células
    const initialPositions = selectedCells.current.map((cell : joint.dia.Cell)=> ({
      cell,
      bbox: cell.getBBox(),
    }));
  
    // Pega a posição inicial da caixa de seleção desenhada e da caixa de seleção de referência
    const boxStartLeft = parseFloat(selectionBox.style.left);
    const boxStartTop = parseFloat(selectionBox.style.top);

    const refBoxStartLeft = parseFloat(selectionBoxRef.current.style.left);
    const refBoxStartTop = parseFloat(selectionBoxRef.current.style.top);

    // Inicializa as variáveis que registrarão quanto o mouse andou até um dado momento anterior ao atual. É usado porque é mais fácil guardar esses valores do que todas as
    // posições iniciais de cada vértice dos links
    let lastDx = 0;
    let lastDy = 0;


    // Função que lidará com o arraste da caixa de seleção
    const handleMouseMoveDragging = (moveEvent: MouseEvent) => {

      const dx = (moveEvent.clientX - startX) / currentScale;
      const dy = (moveEvent.clientY - startY) / currentScale;
  
      // Move a caixa de seleção e atualiza a posição da de referência
      selectionBox.style.left = `${boxStartLeft + dx * currentScale}px`;
      selectionBox.style.top = `${boxStartTop + dy *  currentScale}px`;

      selectionBoxRef.current.style.left = `${refBoxStartLeft + dx}px`;
      selectionBoxRef.current.style.top = `${refBoxStartTop + dy }px`;

      // Move cada célula individualmente
      initialPositions.forEach(({ cell , bbox } : any) => {

        // Se for um nodo (elemento), apenas os posiciona +dx +dy da sua posição inicial
        if (cell.isElement()) {
          const newX = bbox.x + dx;
          const newY = bbox.y + dy;
          cell.position(newX, newY); 
        }

        // Se for um link, incrementa a posição deles pela variação do movimento: +(dx - lasDx) +(dy - lastDy).
        // Se guardássemos a posição de todos os vértices, poderíamos fazer o mesmo que com os nodos (apenas posicioná-los segundo a posição inicial).
        // Ou poderíamos fazer com os nodos o mesmo que estamos fazendo com os links
        else if(cell.isLink() && cell.get("vertices").length > 0){
          const vertices = cell.get("vertices");
          cell.set("vertices", vertices.map((vertex :  {x: number, y: number}) => ({x: vertex.x + (dx - lastDx), y: vertex.y + (dy - lastDy)})));
        }
      });

      lastDx = dx;
      lastDy = dy;
    };
  

    // Função que lida com a largada da caixa de seleção depois do arraste
    const handleMouseUpDragging = () => {
      document.removeEventListener("mousemove", handleMouseMoveDragging);
      document.removeEventListener("mouseup", handleMouseUpDragging);
    };
  
    document.addEventListener("mousemove", handleMouseMoveDragging);
    document.addEventListener("mouseup", handleMouseUpDragging);  
    eventHandlers.push({element: document, event: "mousemove", handler: handleMouseMoveDragging});
    eventHandlers.push({element: document, event: "mouseup", handler: handleMouseUpDragging});

  };


/**
 * Lida com cliques quando a caixa de seleção está ativa.
 * Se o clique for fora da caixa de seleção ou fora do container, remove a seleção.
 */
const handleClickWithSelectionBox = (event: any) => {

  const clickedInsideContainer = container.contains(event.target as Node);
  const selectionRect = selectionBox.getBoundingClientRect();

  const clickedInsideSelectionBox =
    event.clientX >= selectionRect.left &&
    event.clientX <= selectionRect.right &&
    event.clientY >= selectionRect.top &&
    event.clientY <= selectionRect.bottom;

  if (!clickedInsideContainer || !clickedInsideSelectionBox) {
    // Remove seleção
    selectedCells.current.forEach((cell: joint.dia.Cell) => {
      deselectCell(cell);
    });

    selectedCells.current = [];
    selectionBox.remove();
    container.addEventListener("mousedown", handleMouseDown);
    document.removeEventListener("mousedown", handleClickWithSelectionBox);
    return;
  }

  handleMouseDownOnSelection(event);
};

/**
 * Lida com a exclusão de células selecionadas ao pressionar a tecla "Delete".
 */
const handleDeleteSelectedCells = (evt: any) => {
  if (evt.key !== 'Delete') return;

  deleteSelectedCells(paper, selectedCells.current, inputs, tokenizedInputs, transitions, handleInputsChange);
  document.removeEventListener("keydown", handleDeleteSelectedCells);
  document.removeEventListener("mousedown", handleClickWithSelectionBox);
  selectionBox.remove();
};


/**
 * Inicia a criação de uma caixa de seleção ao pressionar o mouse.
 */
const handleMouseDown = (event: MouseEvent) => {
  if (!container) return;

  // Limpa a seleção anterior
  selectedCells.current.forEach((cell: joint.dia.Cell) => {
    deselectCell(cell);
  });
  selectedCells.current = [];

  const containerRect = container.getBoundingClientRect();
  const startX = event.clientX;
  const startY = event.clientY;

  // Cria o retângulo de seleção
  selectionBox = document.createElement("div");
  selectionBox.style.position = "absolute";
  selectionBox.style.border = "1px dashed blue";
  selectionBox.style.background = "rgba(0, 0, 255, 0.2)";
  selectionBox.style.left = `${startX - containerRect.x}px`;
  selectionBox.style.top = `${startY - containerRect.y}px`;
  selectionBox.style.zIndex = "10";
  selectionBox.style.pointerEvents = "none";

  // SELECTIONBOXREF DEVERIA SER A REFERÊNCIA PARA UMA SELECTIONBOX EM ZOOM 1:1, MAS NÃO ESTÁ SEGUINDO ISSO
  // JÁ SELECTIONBOX É A PRÓPRIA CAIXA DE SELEÇÃO DESENHADA NA TELA, QUE É A QUE TEM A ESCALA ATUAL
  selectionBoxRef.current = selectionBox.cloneNode();

  container.appendChild(selectionBox);


  /**
   * Atualiza a caixa de seleção conforme o mouse se move.
   */
  const handleMouseMoveSelection = (moveEvent: MouseEvent) => {

    const currentX = moveEvent.clientX;
    const currentY = moveEvent.clientY;
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    selectionBox.style.left = `${Math.min(startX - containerRect.x, currentX - containerRect.x)}px`;
    selectionBox.style.top = `${Math.min(startY - containerRect.y, currentY - containerRect.y)}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;

    // Verifica quais células foram selecionadas
    const selectionRect = new joint.g.Rect(
      (Math.min(startX, moveEvent.clientX) - containerRect.left - translation.x) / currentScale,
      (Math.min(startY, moveEvent.clientY) - containerRect.top - translation.y) / currentScale,
      (Math.abs(startX - moveEvent.clientX)) / currentScale,
      (Math.abs(startY - moveEvent.clientY)) / currentScale
    );

    const allCells = paper.model.getCells();
    selectedCells.current = allCells.filter((cell) => {
      const bbox = cell.getBBox();
      if (selectionRect.intersect(bbox)) {
        selectCell(cell);
        return true;
      } else {
        deselectCell(cell);
        return false;
      }
    });
  };


  /**
   * Finaliza a seleção ao soltar o botão do mouse.
   */
  const handleMouseUp = (event: any) => {

    // Posiciona de acordo com a translação e a escala. A translação é uma media absoluta, independente da escala, então é preciso retirá-la para multiplicar o valor sem considerar a translação
    // pela escala, e então colocá-la de novo (porque em selectionBox a translação já está sendo contada)
    selectionBoxRef.current.style.left = `${(parseFloat(selectionBox.style.left) - translation.x) / currentScale + translation.x}px`;
    selectionBoxRef.current.style.top = `${(parseFloat(selectionBox.style.top) - translation.y) / currentScale + translation.y}px`;
    selectionBoxRef.current.style.width = `${parseFloat(selectionBox.style.width) / currentScale}px`;
    selectionBoxRef.current.style.height = `${parseFloat(selectionBox.style.height) / currentScale}px`;

    document.removeEventListener("mousemove", handleMouseMoveSelection);
    document.removeEventListener("mouseup", handleMouseUp);
    container.removeEventListener("mousedown", handleMouseDown);

    document.addEventListener("keydown", handleDeleteSelectedCells);
    eventHandlers.push({element: document, event: "keydown", handler: handleDeleteSelectedCells});

    document.addEventListener("mousedown", handleClickWithSelectionBox);
    eventHandlers.push({element: document, event: "mousedown", handler: handleClickWithSelectionBox});
  };

  document.addEventListener("mousemove", handleMouseMoveSelection);
  document.addEventListener("mouseup", handleMouseUp);
  eventHandlers.push({element: document, event: "mousemove", handler: handleMouseMoveSelection});
  eventHandlers.push({element: document, event: "mouseup", handler: handleMouseUp});
};

// Adiciona evento inicial de clique no container
if (container) {
  container.addEventListener("mousedown", handleMouseDown);
  eventHandlers.push({element: container, event: "mousedown", handler: handleMouseDown});
}

// Se houver células selecionadas, ativa os eventos de manipulação
if (selectedCells.current.length > 0) {
  container.removeEventListener("mousedown", handleMouseDown);
  document.addEventListener("keydown", handleDeleteSelectedCells);
  eventHandlers.push({element: document, event: "keydown", handler: handleDeleteSelectedCells});
  document.addEventListener("mousedown", handleClickWithSelectionBox);
  eventHandlers.push({element: document, event: "mousedown", handler: handleClickWithSelectionBox});
}

}