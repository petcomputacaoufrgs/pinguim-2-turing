import React, { useState, useEffect, useRef } from "react";
import * as joint from 'jointjs';
import { Transitions, InputValues, TokenizedInputValues, InputErrors } from '../../types/types';
import { GraphConteiner } from "./styled";
import { CurrentTool } from "../../types/types";
import { useStateContext } from "../../ContextProvider";

import { validateInputs, revalidateTransitions } from "../../utils/validation";
import { getNodes, getAndDrawTransitions } from "./graph/drawGraph";
import { initUndoRedo } from "./graph/events/general/undoRedo";
import { initZoomHandler } from "./graph/events/general/zoomHandler";
import { initDragHandler } from "./graph/events/general/dragHandler";
import { initCellSelection } from "./graph/events/standardTool/cellSelection";
import { initEditLink } from "./graph/events/standardTool/editLink";
import { initEditNode } from "./graph/events/standardTool/editNode";
import { attachLinkEvents } from "./graph/events/standardTool/attachLinkEvents";
import { initCellsSelection } from "./graph/events/selectionTool/selectCells";

/*
TO DO: 

- Mais importantes (funcionalidades diretas do grafo e situações para arrumar)
1) Permitir que links sejam adicionados - Kami
2) Tratar não determinismo (para adição de links)!
4) Arrumar situação em que quando o link é redirecionado para o próprio nodo 
   fonte formando um loop ou quando o loop tem seus vértices retirados ele fica estranho (adicionar vértices nessa condição) - Kami
5) Mover várias células ao mesmo tempo - Edu

- Acessórios (estilos e funcionalidades extras)
5) Modo de tela cheia para grafo e tabela
6) Deixar botões de edição de estado final/inicial mais bonitinhos
7) Deixar caixa de ferramentas mais bonitinha
8) Salvar movimento dos nodos e links no histórioco de ações para permitir que o control + Z e o control + Y capturem ações que sejam apaenas movimento
9) Possibilitar movimento de todas as células selecionadas na opção "seleção"

- REFATORAÇÃO:
1) Arrumar uma forma de diminuir o número de argumentos passados para cada evento (de novo usar o contexto?)
2) Tentar separar esse único hook useEffect gigantesco em vários menores controlando aspectos diferentes: desenho do grafo, escala, seleção, deleção, etc - primeira tentativa falhou porque introduziu atraso na renderização

*/


interface i_simple_diagram {
  onChangeInputs?: (inputs: InputValues, inputs_tokenized: TokenizedInputValues, new_transitions: Transitions, newErrors: InputErrors) => void;
  saveStateToHistory?: (inputs: InputValues, inputs_tokenized: TokenizedInputValues, new_transitions: Transitions, newErrors: InputErrors) => void;
  currentTool: CurrentTool;
  currState?: string;
  selectedCells?: any;
  selectionBoxRef?: any; 
}


export function StateDiagram({onChangeInputs, saveStateToHistory, currentTool, currState, selectedCells, selectionBoxRef}: i_simple_diagram) {

// ====================================================================================
// DEFINIÇÃO DE STATES E CONSTANTES
// ====================================================================================
  
  const {inputStates, graphNodes, graphLinks, changesHistory, changesIndex} = useStateContext();

  // Dados relacionados aos inputs
  const {errors} = inputStates;
  const {inputs} = inputStates;
  const {tokenizedInputs} = inputStates;
  const {transitions} = inputStates;

  // Histórico de ações (habilita control + Z e control + Y). Consiste de uma pilha de todas as modificações
  const {history} = changesHistory;
  const {historyIndex, setHistoryIndex} = changesIndex;

  // Guarda todos os links que já foram desenhados. É um map cujas chaves são, respectivamente, um estado alvo, um estado origem e o símbolo de leitura, e o valor é o link
  const {currentLinks, setLinks} = graphLinks;

  // Salva as posições dos nós. É um map dos nomes dos estados para suas posições
  const {nodePositions, setNodePositions} = graphNodes;


  // Estado para controle da escala
  const [currentScale, setCurrentScale] = useState(1); 
  
  // Salva a referência para a visão (câmera, se quiser chamar assim) atual do paper, ou seja, o quanto ele foi transladado
  const [translation, setTranslation] = useState<{x: number, y: number}>({x: 0, y: 0});


  

  // Referências ao container que contém o grafo e ao nodo selecionado atualmente. Essas referências não podem se perder entre renderizações
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentCellView = useRef<any>(null);
  const movingLink = useRef<any>(null); // Referência ao link sendo movido

  const paperRef = useRef<joint.dia.Paper>();
  const nodesRef = useRef<Map<string, any>>(new Map());


  // Constantes para facilitar o acesso
  const alphabet = Array.from(
    new Set([
      tokenizedInputs.initSymbol[0],
      ...tokenizedInputs.inAlphabet.filter((symbol) => symbol !== ""),
      ...tokenizedInputs.auxAlphabet.filter((symbol) => symbol !== ""),
      tokenizedInputs.blankSymbol[0],
    ]))

  const states = tokenizedInputs.states;



  // Dados novos valores aos inputs, faz a validação deles, salva o estado no histórico de edições e então atualiza os valores
  const handleInputsChange = (newInputs: InputValues, newTokenizedInputs: TokenizedInputValues, newTransitions: Transitions) => {

    if(!saveStateToHistory || !onChangeInputs) 
      return;


    const newErrors = validateInputs(newTokenizedInputs, errors);
    const revalidatedTransitions = revalidateTransitions(newTransitions, tokenizedInputs, newTokenizedInputs);

    saveStateToHistory(newInputs, newTokenizedInputs, revalidatedTransitions, newErrors);
    onChangeInputs(newInputs, newTokenizedInputs, revalidatedTransitions, newErrors);
      
  };


// RENDERIZAÇÃO

  useEffect(() => {


// ====================================================================================
// INICIALIZAÇÃO
// ====================================================================================

    if(containerRef.current === null) return;
      
    containerRef.current.style.setProperty('width', '100%');
    containerRef.current.style.setProperty('height', '100%');
    containerRef.current.style.setProperty('position', 'relative');
    containerRef.current.style.setProperty("overflow", "hidden");

    containerRef.current.id = "paper-container";
        
    // O Graph é responsável por manter o estado dos dados do diagrama, ou seja, ele gerencia os elementos, links e a relação entre eles
    const graph = new joint.dia.Graph({});

    // O paper modela o Graph e é responsável por renderizá-lo na tela
    const paper = new joint.dia.Paper({
      el: containerRef.current,
      model: graph,
      width: "100%",
      height: "100%",
      drawGrid: true,
      defaultConnector: { name: 'smooth' }, // Por padrão, os links fazem curvas suaves (curva de Bézier)
      interactive: { useLinkTools: false, labelMove: false, elementMove: !currentTool.selection }
          
    });

    paperRef.current = paper;

    let eventHandlers:{element: any, event: string, handler: any}[] = [];

    // Translada o paper para a atual visão
    paper.translate(translation.x, translation.y);
  

// ====================================================================================
// CRIAÇÃO DOS LINKS E NODOS
// ====================================================================================
  
  let newSelectedCells = null;
  let prevSelectedCells = null;

  if(selectedCells && prevSelectedCells){
    newSelectedCells = [];
    prevSelectedCells = selectedCells.current;
  }

  const nodes = getNodes(states, tokenizedInputs, nodePositions, setNodePositions, nodesRef.current, prevSelectedCells, newSelectedCells);
  graph.addCells(Array.from(nodes.values()));
  
  const links = getAndDrawTransitions(states, alphabet, transitions, nodes, paper, currentLinks, prevSelectedCells, newSelectedCells);
  setLinks(links);

  nodesRef.current = nodes;

// ====================================================================================
// EVENTOS E LISTENERS 
// ====================================================================================

// ------------------------------------------------------------------------------------
// GERAIS:
// ------------------------------------------------------------------------------------

// Lógica de control + Z (undo) e control + Y (redo)
  if(!currentTool.noEdit && onChangeInputs)
    initUndoRedo(history, historyIndex, setHistoryIndex, onChangeInputs, eventHandlers);
  
  
// Se a ferramenta não é a de seleção, permite movimento do paper através do arraste e remove qualquer seleção de células existente
  if(!currentTool.selection){
    initDragHandler(paper, containerRef.current, setTranslation, eventHandlers);

    if(selectedCells && selectionBoxRef){
      selectedCells.current = [];
      selectionBoxRef.current = null;
    }
  }

// Controle da escala (zoom)
  paper.scale(currentScale);
  initZoomHandler(currentScale, setCurrentScale, eventHandlers);


// -----------------------------------------------------------------------------------
// ESPECÍFICOS DE FERRAMENTAS
// ------------------------------------------------------------------------------------

  // ------------------------------------------------------------------------------------
  // EDITAR LINKS
  // ------------------------------------------------------------------------------------


  // Permite mover os links


    let targetNode:any = null;  // Referência ao nodo que o link está em cima
    let mustMove = false; // Indica se de fato clicamos para mover o link
    let initialPosition:any = null; // Guarda a posição inicial caso precise desfazer
    
    // Início do movimento quando o mouse clica no link
   /* paper.on('link:pointerdown', (linkView, evt, x, y) => {
      evt.preventDefault();
    
      movingLink.current = linkView.model; 
    
      initialPosition = {
        source: movingLink.current.get('source'),
        target: movingLink.current.get('target'),
      };

      // Remove os vértices pra não ficar feio o movimento (teria que guardar eles pra caso não ocorra mudança, retorná-los)
      movingLink.current.set('vertices', []);      


      // Identifica se de fato clicou para mover o link (logo no começo dele ou logo no fim)
      const bbox = linkView.findMagnet(evt.target)?.getBoundingClientRect(); // findMagnet identifica um elemento de conexão do link (magnet), e getBoundingClientRect retorna as coordenadas e extensão desse elemento
      mustMove = evt.clientX !== undefined && bbox !== undefined && (evt.clientX >= (bbox.left + bbox.width - 10) || (evt.clientX <= bbox.left + 10));
    
      if(!mustMove)
        return;

      document.addEventListener('mousemove', handleMouseMoveLink);
      document.addEventListener('mouseup', handleMouseUp);
    });
    

    // Atualiza a posição do link enquanto o mouse se move
    const handleMouseMoveLink = (evt: any) => {
      if (movingLink.current) {

        const newPosition = paper.clientToLocalPoint(evt.clientX, evt.clientY); // pega as coordenadas absolutas do clique e retorna as coordenadas relativas ao paper
    
        // procura algum elemento por perto do link
        const newTargetNode = graph.findModelsInArea({
          x: newPosition.x - 10,
          y: newPosition.y - 10,
          width: 20,
          height: 20,
        })[0];

        // Se encontrou, destaca esse elemento com uma borda diferente e guarda a referência para ele
        if (targetNode && newTargetNode) {
          if(targetNode.id != newTargetNode.id){
            targetNode.attr('body/stroke', 'black');
            targetNode = newTargetNode;
            targetNode.attr('body/stroke', '#00A8FF');
          }
        }
        else if(targetNode){
          targetNode.attr('body/stroke', 'black');
          targetNode = null;
        }
        else if(newTargetNode){
          targetNode = newTargetNode;
          targetNode.attr('body/stroke', '#00A8FF');
        }

        movingLink.current.set('target', newPosition);

      }
    }
    
    // Finaliza o movimento quando solta o clique do mouse
    function handleMouseUp(evt : any) {
      if (movingLink.current) {
    
        if (targetNode) {
          // Havendo um nodo alvo, define ele como target
          movingLink.current.set('target', { id: targetNode.id });
          targetNode.attr('body/stroke', 'black');
          
        } else {
          // Se não, volta à posição inicial
          movingLink.current.set('source', initialPosition.source);
          movingLink.current.set('target', initialPosition.target);
        }
    
        movingLink.current = null; 
        targetNode = null;
      }
    
      document.removeEventListener('mousemove', handleMouseMoveLink);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    */


  // ------------------------------------------------------------------------------------
  // ADICIONAR NODOS (talvez desnecessário?)
  // ------------------------------------------------------------------------------------

    if(currentTool.addNodes || currentTool.standard){
  
    // Adiciona um novo nodo ao clicar duas vezes sobre espaço vazio
    paper.on('blank:pointerdblclick', (evt, x, y) => {

      let newStateName = "";
      let cont = 0;

      while(newStateName === ""){
        if(!states.includes(`q${cont}`))
          newStateName = `q${cont}`;
        cont++;
      }

      setNodePositions((prev) => new Map(prev.set(newStateName, { x: x - 50, y: y - 20})));
      handleInputsChange({...inputs, states: (states.length > 0)? `${inputs.states}, ${newStateName}` : `${newStateName}`}, {...tokenizedInputs, states: (states.length > 0)? [...states, newStateName] : [newStateName]}, transitions);
    })

  }



  // ------------------------------------------------------------------------------------
  // APENAS VISUALIZAÇÃO
  // ------------------------------------------------------------------------------------

  if(currentTool.noEdit){
      // Coloca os eventos de edição de vértices nos links
      attachLinkEvents(paper);

      if(currState){
        const node = nodes.get(currState);
        node.attr('body/stroke', 'green');
      }


  }
  // ------------------------------------------------------------------------------------
  // SELEÇÃO
  // ------------------------------------------------------------------------------------

  if(currentTool.selection){
    if(selectedCells && selectionBoxRef)
    // Permite selecionar várias células ao mesmo tempo para deletá-las juntas
    initCellsSelection(paper, selectedCells, nodes, selectionBoxRef, currentScale, translation, inputs, tokenizedInputs, transitions, handleInputsChange, eventHandlers);
  }

  // ------------------------------------------------------------------------------------
  // PADRÃO
  // ------------------------------------------------------------------------------------

    if(currentTool.standard){

      // Coloca os eventos de edição de vértices nos links
      attachLinkEvents(paper);

      // Permite a seleção de células e libera as opções que vem com células selecionadas
      initCellSelection(paper, nodePositions, setNodePositions, nodes, currentCellView, movingLink, inputs, tokenizedInputs, transitions, handleInputsChange, eventHandlers);

      // Permite editar textos de nodos e links
      initEditNode(paper, currentCellView, inputs, tokenizedInputs, transitions, handleInputsChange, eventHandlers);
      initEditLink(paper, movingLink, inputs, tokenizedInputs, transitions, handleInputsChange, eventHandlers);

    }

    console.log("Terminou o desenho");

    return () => {

      eventHandlers.forEach((listener) => listener.element?.removeEventListener(listener.event, listener.handler as EventListener));
            
      
      if(movingLink.current){
        movingLink.current.model.attr('line/stroke', 'black');
        movingLink.current = null;
      }
    };
    }, [tokenizedInputs, transitions, currentScale, currentTool, currState]); 
  



    const goToInitState = () => {
      if(currentCellView.current){
        document.querySelectorAll('.node-button').forEach(btn => btn.remove());
        currentCellView.current.model.attr('body/stroke', 'black');
        currentCellView.current = null;
      }


      if(paperRef){
        let initialPosition;

        if(tokenizedInputs.initState.length > 0)
          initialPosition = nodePositions.get(tokenizedInputs.initState[0])
        else{
          if(nodePositions.size > 0)
            initialPosition = nodePositions.values().next().value;
          else
            return;
        }
          
        const x = (initialPosition?.x || 0) * currentScale - (containerRef.current?.clientWidth || 0)/2 + 60;
        const y = (initialPosition?.y || 0) * currentScale - (containerRef.current?.clientHeight || 0)/2 + 20; 

        paperRef.current?.translate(-x, -y);

        setTranslation({x : -x, y: -y});
      }
    }


    const centralizeGraph = () => {
      if(currentCellView.current){
        document.querySelectorAll('.node-button').forEach(btn => btn.remove());
        currentCellView.current.model.attr('body/stroke', 'black');
        currentCellView.current = null;
      }


      if(paperRef){
        let nodesArray = Array.from(nodePositions.values());

        if (nodesArray.length === 0) return; 
      
        // Calcula a média das posições x e y
        const sumX = nodesArray.reduce((acc, node) => acc + node.x, 0);
        const sumY = nodesArray.reduce((acc, node) => acc + node.y, 0);
        
        const centerX = sumX / nodesArray.length;
        const centerY = sumY / nodesArray.length;
      
        const x = centerX * currentScale - (containerRef.current?.clientWidth || 0) / 2 + 60;
        const y = centerY * currentScale - (containerRef.current?.clientHeight || 0) / 2 + 20;
      
        paperRef.current?.translate(-x, -y);
      
        setTranslation({ x: -x, y: -y });
      }
    }

    

    return (
      <>
        <button onClick={goToInitState}>Ir ao estado inicial</button>
        <button onClick={centralizeGraph}>Centralizar</button>
        <button>{currentScale}</button>
        <GraphConteiner ref={containerRef}></GraphConteiner>
      </>
    );
  }
  

export default StateDiagram;
