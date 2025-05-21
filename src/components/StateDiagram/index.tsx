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
import { getElementText, getLinkText } from "./graph/getNodeData";
import { tokenize } from "../../utils/tokenize";
import { initLinkCreation } from "./graph/events/standardTool/linkCreation";
import { initRedirectLinks } from "./graph/events/redirectLinks/redirectLinks";

/*
TO DO: 

- Mais importantes (funcionalidades diretas do grafo e situações para arrumar)
1)

- Acessórios (estilos e funcionalidades extras)
6) Deixar botões de edição de estado final/inicial mais bonitinhos
7) Deixar caixa de ferramentas mais bonitinha
8) Salvar movimento dos nodos e links num histórico de ações para permitir que o control + Z e o control + Y capturem ações que sejam apaenas movimento
9) Deixar botões de centralização e ir ao estaod inicial mais bonitinhos
10) Repensar forma automática como inicialmente estão sendo atribuídos vértices para os links. Do jeito que está, se 2 links saem de um mesmo estado para um mesmo outro estado, eles ficam sobrepostos.
   Poderia resolver isso facilmente colocando os vértices em posições diferentes, mas isso exigiria uma checagem dos links que saem de um mesmo estado 
11) Dar o zoom baseado na posição do mouse
   
- REFATORAÇÃO:
1) Otimizar a forma como ctrl + Z e ctrl + Y estão sendo feitos. Eles estão registrando TODOS OS DADOS, completamente desnecessário. Deveriam apenas serem registrados os dados que mudaram
   Isso poderia ser feito guardando um histórico de ações, e não de estados. Cada valor desse histórico teria uma chave indicando o que foi mudado e o valor correspondente da mudança.
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
  
  const {inputStates, nodePositions, graphLinks, changesHistory, changesIndex} = useStateContext();

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

  // Estado para controle da escala
  const [currentScale, setCurrentScale] = useState(1); 
  
  // Salva a referência para a visão (câmera, se quiser chamar assim) atual do paper, ou seja, o quanto ele foi transladado
  const [translation, setTranslation] = useState<{x: number, y: number}>({x: 0, y: 0});


  const notYetDefinedLinks = useRef<Map<string, joint.shapes.standard.Link>>(new Map()); // Links que foram puxados de nodos (ainda não contém label, só o estado de origem e o estado de destino). Não tem como representá-lo na tabela de transição pois não tem símbolo de leitura definido
  // São um map do id do link para ele mesmo

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

  const nodes = getNodes(states, tokenizedInputs, nodePositions, nodesRef.current, prevSelectedCells, newSelectedCells);
  graph.addCells(Array.from(nodes.values()));
  
  const links = getAndDrawTransitions(states, alphabet, transitions, nodes, paper, currentLinks, notYetDefinedLinks, prevSelectedCells, newSelectedCells);
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

    if(currentTool.editLinks){
      initRedirectLinks(paper, graph, movingLink, setLinks, handleInputsChange, inputs, tokenizedInputs, transitions);
    }

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

      nodePositions.current.set(newStateName, {x: x - 50, y: y - 20});
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

      initLinkCreation(paper, graph, movingLink, notYetDefinedLinks);

      // Coloca os eventos de edição de vértices nos links
      attachLinkEvents(paper);

      // Permite a seleção de células e libera as opções que vem com células selecionadas
      initCellSelection(paper, nodePositions, nodes, currentCellView, movingLink, notYetDefinedLinks, inputs, tokenizedInputs, transitions, handleInputsChange, eventHandlers);

      // Permite editar textos de nodos e links
      initEditNode(paper, currentCellView, inputs, tokenizedInputs, transitions, handleInputsChange, nodePositions, eventHandlers);
      initEditLink(paper, movingLink, inputs, tokenizedInputs, transitions, handleInputsChange, notYetDefinedLinks, currentLinks, setLinks, eventHandlers);

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
          initialPosition = nodePositions.current.get(tokenizedInputs.initState[0])
        else{
          if(nodePositions.current.size > 0)
            initialPosition = nodePositions.current.values().next().value;
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
        let nodesArray = Array.from(nodePositions.current.values());

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
        <GraphConteiner ref={containerRef}></GraphConteiner>
      </>
    );
  }
  

export default StateDiagram;
