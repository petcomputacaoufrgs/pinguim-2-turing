import React, { useState, useEffect, useRef } from "react";
import * as joint from 'jointjs';
import { Transitions, InputValues, TokenizedInputValues, InputErrors, errorCodes } from '../../types/types';
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
1) Permitir que links sejam adicionados
2) Tratar não determinismo (para adição de links)!
3) Arrumar atribuição de nome para os estados ao serem criados com o clique duplo: no momento não funciona porque o nome é sempre q{qtd de estados}, mas como há
deleção de estados isso pode bugar 
4) Arrumar situação em que quando o link é redirecionado para o próprio nodo fonte formando um loop ou quando o loop tem seus vértices retirados ele fica estranho (adicionar vértices nessa condição)

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
}


export function SimpleDiagram({onChangeInputs, saveStateToHistory, currentTool}: i_simple_diagram) {


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


    let eventHandlers:{element: any, event: string, handler: any}[] = [];

    // Translada o paper para a atual visão
    paper.translate(translation.x, translation.y);
  

// ====================================================================================
// CRIAÇÃO DOS LINKS E NODOS
// ====================================================================================

  const nodes = getNodes(states, tokenizedInputs, nodePositions, setNodePositions);
  graph.addCells(Array.from(nodes.values()));
  
  const links = getAndDrawTransitions(states, alphabet, transitions, nodes, paper, currentTool, currentLinks);
  setLinks(links);

// ====================================================================================
// EVENTOS E LISTENERS 
// ====================================================================================

// ------------------------------------------------------------------------------------
// GERAIS:
// ------------------------------------------------------------------------------------

// Lógica de control + Z (undo) e control + Y (redo)
  if(!currentTool.noEdit && onChangeInputs)
    initUndoRedo(history, historyIndex, setHistoryIndex, onChangeInputs, eventHandlers);

// Permite movimento do paper através do arraste
  if(!currentTool.selection)
    initDragHandler(paper, containerRef.current, setTranslation, eventHandlers)

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
      setNodePositions((prev) => new Map(prev.set(`q${states.length}`, { x: x - 50, y: y - 20})));

      let newStateName = "";
      let cont = 0;

      while(newStateName === ""){
        if(!states.includes(`q${cont}`))
          newStateName = `q${cont}`;
        cont++;
      }

      handleInputsChange({...inputs, states: (states.length > 0)? `${inputs.states}, ${newStateName}` : `${newStateName}`}, {...tokenizedInputs, states: (states.length > 0)? [...states, newStateName] : [newStateName]}, transitions);
    })

  }



  // ------------------------------------------------------------------------------------
  // APENAS VISUALIZAÇÃO
  // ------------------------------------------------------------------------------------

  if(currentTool.noEdit){
      // Coloca os eventos de edição de vértices nos links
      attachLinkEvents(paper);
  }
  // ------------------------------------------------------------------------------------
  // SELEÇÃO
  // ------------------------------------------------------------------------------------

  if(currentTool.selection){

    let selectedCells:joint.dia.Cell[] = [];

    // Permite selecionar várias células ao mesmo tempo para deletá-las juntas
    initCellsSelection(paper, selectedCells, currentScale, translation, inputs, tokenizedInputs, transitions, handleInputsChange, eventHandlers);
  }

  // ------------------------------------------------------------------------------------
  // PADRÃO
  // ------------------------------------------------------------------------------------

    if(currentTool.standard){

      // Coloca os eventos de edição de vértices nos links
      attachLinkEvents(paper);

      // Permite a seleção de células e libera as opções que vem com células selecionadas
      initCellSelection(paper, nodes, currentCellView, movingLink, inputs, tokenizedInputs, transitions, handleInputsChange, eventHandlers);

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
    }, [tokenizedInputs, transitions, currentScale, currentTool]); 
  



    return (
        <GraphConteiner ref={containerRef}></GraphConteiner>
    );
  }
  

export default SimpleDiagram;
