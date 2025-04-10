import { InputValues, TokenizedInputValues, Transitions } from "../../../../../types/types";
import { getElementText } from "../../getNodeData";
import { linkDeleteHandler, nodeDeleteHandler } from "./deleteHandler";
import { createButton, handleChangeFinalStatus, handleChangeInitStatus, handleUpdateButtonsPositions } from "./stateButtons";

export function initCellSelection(
    paper: joint.dia.Paper,
    nodePositions: React.MutableRefObject<Map<string, {x: number; y: number;}>>,
    nodes: Map<string, any>,
    currentCellView: any,
    movingLink: any,
    notYetDefinedLinks: React.MutableRefObject<Map<string, joint.shapes.standard.Link>>,
    inputs: InputValues ,tokenizedInputs: TokenizedInputValues, transitions: Transitions, handleInputsChange:any,
    eventHandlers: any[]

){  
  
    const deleteNode = nodeDeleteHandler(paper, nodePositions, currentCellView, inputs, tokenizedInputs, transitions, handleInputsChange);
    const deleteLink = linkDeleteHandler(paper, movingLink, notYetDefinedLinks, inputs, tokenizedInputs, transitions, handleInputsChange)

    document.removeEventListener("keydown", deleteNode);
    document.querySelectorAll('.node-button').forEach(btn => btn.remove());

    let createLink = false;


        // Se existir uma célula selecionada
        if(currentCellView.current){
          // Mas a célula não representa nenhum estado (o que não deveria acontecer), desceleciona a célula 
          if(!nodes.get(getElementText(currentCellView.current.model)))
            currentCellView.current = null
          
          // Se a célula representa algum estado, é preciso atualizá-la para a nova renderização, pois currentCellView guarda as informações do nodo da renderização passada
          else{
            // Atribui à célula selecionada o novo nodo
            currentCellView.current =  nodes.get(getElementText(currentCellView.current.model)).findView(paper);
    
            currentCellView.current.model.attr('body/stroke', 'green'); 
    
            // e cria novamente os botões de edição de estado final/inicial
            const bbox = currentCellView.current.getBBox();
    
            const button1 = createButton('Final', 0, paper.el, bbox);
            button1.onclick = handleChangeFinalStatus(currentCellView.current.model, inputs, tokenizedInputs, transitions, handleInputsChange);
      
            const button2 = createButton('Inicial', 20, paper.el, bbox);
            button2.onclick = handleChangeInitStatus(currentCellView.current.model, inputs, tokenizedInputs, transitions, handleInputsChange);
          }
        }


  // Seleção/Desceleção de nodo/link

      // Desceleciona ao clicar no vazio
      paper.on("blank:pointerdown", (evt, x, y) => { 
        document.removeEventListener("keydown", deleteNode);

        if(evt.target.tagName != "svg")
          return;

        if(currentCellView.current !== null){
          currentCellView.current.model.attr('body/stroke', 'black');
          document.querySelectorAll('.node-button').forEach(btn => btn.remove());
          currentCellView.current = null;
        }

        if(movingLink.current !== null){
          movingLink.current.model.attr('line/stroke', 'black');
          document.removeEventListener('keydown', deleteLink);
          movingLink.current = null;
        }
      });


      // Ao clicar em um link, seleciona ele e desceleciona qualquer outra coisa selecionada 
      paper.on("link:pointerdown", (linkView, evt, x, y) => {
        if(currentCellView.current !== null){
          currentCellView.current.model.attr('body/stroke', 'black');
          document.querySelectorAll('.node-button').forEach(btn => btn.remove());
          document.removeEventListener("keydown", deleteNode);
          currentCellView.current = null;
        }

        if(movingLink.current != linkView){
          if(movingLink.current !== null)
            movingLink.current.model.attr('line/stroke', 'black');

          document.removeEventListener('keydown', deleteLink);

          movingLink.current = linkView;
          movingLink.current.model.attr('line/stroke', 'blue');
        }

        document.addEventListener('keydown', deleteLink);
        eventHandlers.push({element: document, event: "keydown", handler: deleteLink});

      })


      const handleMoveOnCell = (evt: any) => {

        if(evt.target.tagName != "path")
          return;

        const cellRect = evt.target.getBoundingClientRect(); 
        const x = evt.clientX;
        const y = evt.clientY;
        const borderWidth = 5;

        if(x < cellRect.x + borderWidth || x > cellRect.x + cellRect.width - borderWidth || y < cellRect.y + borderWidth || y > cellRect.y + cellRect.height - borderWidth){
          // Se o mouse estiver na borda do nodo, faz o pointer ficar em forma de clique
          evt.target.style.cursor = 'pointer';
          createLink = true;
        }
        else{
          // Se o mouse não estiver na borda do nodo, faz o pointer ficar na forma padrão
          evt.target.style.cursor = 'default';
          createLink = false;
        }

        
      }


      paper.on('cell:mouseenter', (cellView, evt) => {
        if(cellView.model.isLink())
          return;
          
        document.addEventListener('mousemove', handleMoveOnCell);
      })


      paper.on('cell:mouseleave', (cellView, evt) => {
        document.removeEventListener('mousemove', handleMoveOnCell);
      })


      
        // Ao clicar em um nodo, seleciona ele e cria os botões que permitem tornar o nodo estado inicial e estado final, além de descelecionar qualquer outra coisa
        paper.on('cell:pointerdown', (cellView, evt, x, y) => {    
          
          document.querySelectorAll('.node-button').forEach(btn => btn.remove());
          document.removeEventListener("keydown", deleteNode);

          if(cellView != currentCellView.current){
            if(currentCellView.current !== null)
              currentCellView.current.model.attr('body/stroke', 'black');
          
            currentCellView.current = cellView;
          }

          
          const cellRect = evt.target.getBoundingClientRect(); 
          const borderWidth = 5;

          
          const clientX = evt.clientX;
          const clientY = evt.clientY;

          if(!clientX || !clientY)
            return;

          if(evt.target.tagName == "path" && (clientX < cellRect.x + borderWidth || clientX > cellRect.x + cellRect.width - borderWidth || clientY < cellRect.y + borderWidth || clientY > cellRect.y + cellRect.height - borderWidth)){
            currentCellView.current.model.attr('body/stroke', 'black');
            currentCellView.current = null;
            return;

          }
          

          currentCellView.current.model.attr('body/stroke', 'green');

          document.addEventListener('keydown', deleteNode);
          eventHandlers.push({element: document, event: "keydown", handler: deleteNode});

          if(movingLink.current !== null){
            movingLink.current.model.attr('line/stroke', 'black');
            document.removeEventListener('keydown', deleteLink);
            movingLink.current = null;
          }

          const bbox = currentCellView.current.getBBox();

          // Cria os botões e define suas ações. Deu algum problema de sincronização ao usar a função updateButtonPositions para definir a posição dos botões logo na inicialização
          // Por isso, as posições estão sendo definidas diretamente na createButtons, e então ao mover as posições são atualizadas
          const button1 = createButton('Final', 0, paper.el, bbox);
          button1.onclick = handleChangeFinalStatus(currentCellView.current.model, inputs, tokenizedInputs, transitions, handleInputsChange);

          const button2 = createButton('Inicial', 20, paper.el, bbox);
          button2.onclick = handleChangeInitStatus(currentCellView.current.model, inputs, tokenizedInputs, transitions, handleInputsChange) 

          cellView.model.on('change:position', handleUpdateButtonsPositions(paper, currentCellView.current, button1, button2));

        })


    }