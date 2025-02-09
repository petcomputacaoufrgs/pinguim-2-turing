import React, { useState, useEffect, useRef, useContext } from "react";
import * as joint from 'jointjs';
import { Transitions, InputValues, TokenizedInputValues, InputErrors, errorCodes } from '../../types/types';
import { GraphConteiner } from "./styled";
import { CurrentTool } from "../../types/types";
import { useStateContext } from "../../ContextProvider";

import { validateInputs, revalidateTransitions } from "../../utils/validation";

/*
TO DO: 

- Arrumar atribuição de nome para os estados ao serem criados com o clique duplo: no momento não funciona porque o nome é sempre q{qtd de estados}, mas como há
deleção de estados isso pode bugar
- Permitir que links sejam adicionados  
- Arrumar bug em que quando o link é redirecionado para o próprio nodo fonte formando um loop ele fica estranho (adicionar vértices nessa condição)
- Não determinismo (para adição de nodos)!

- Modo de tela cheia para grafo e tabela???
*/


interface i_simple_diagram {
  onChangeInputs: (inputs: InputValues, inputs_tokenized: TokenizedInputValues, new_transitions: Transitions, newErrors: InputErrors) => void;
  saveStateToHistory: (inputs: InputValues, inputs_tokenized: TokenizedInputValues, new_transitions: Transitions, newErrors: InputErrors) => void;
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
  const {history, setHistory} = changesHistory;
  const {historyIndex, setHistoryIndex} = changesIndex;

  // Guarda todos os links que já foram desenhados. É um map cujas chaves são, respectivamente, um estado alvo, um estado origem e o símbolo de leitura, e o valor é o link
  const {currentLinks, setLinks} = graphLinks;

  // Salva as posições dos nós. É um map dos nomes dos estados para suas posições
  const {nodePositions, setNodePositions} = graphNodes;


  // Estado para controle da escala
  const [currentScale, setCurrentScale] = useState(1); 
  
  // Salva a referência para a visão (câmera, se quiser chamar assim) atual do paper, ou seja, o quanto ele foi transladado
  const [translation, setTranslation] = useState<{x: number, y: number}>({x: 0, y: 0});


  // Referências ao container que contém o grado e ao nodo selecionado atualmente. Essas referências não podem se perder entre renderizações
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentCellView = useRef<any>(null);


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
    const newErrors = validateInputs(newTokenizedInputs, errors);
    const revalidatedTransitions = revalidateTransitions(newTransitions, tokenizedInputs, newTokenizedInputs);
    saveStateToHistory(newInputs, newTokenizedInputs, newTransitions, newErrors);
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


    let eventHandlers = [];

    // Translada o paper para a atual visão
    paper.translate(translation.x, translation.y);
  

// ====================================================================================
// CRIAÇÃO DOS LINKS E NODOS
// ====================================================================================

  /**
   * Cria e posiciona os nós do grafo representando os estados.
   * 
   * @param {string[]} states - Lista de estados.
   * @returns {Map<string, any>} - Mapa associando os nomes dos estados ao nodo no grafo
   */
  const createNodes = (states:string[]) => {
    const nodesMap = new Map();

    // Futuramente mudar forma como os nodos estão sendo dimensionados para ser mais dinâmico em relação à altura
    const nodeHeight = 40;
    const spacing = 20;

    states.forEach((state, index) => {
        const isFinal = tokenizedInputs.finalStates.includes(state);
        const isInitial = tokenizedInputs.initState[0] === state;
        
        // Determina a largura do nó dinamicamente baseado no tamanho do nome do estado
        const standardWidth = Math.max(100, state.length * 12);
        const nodeWidth = isInitial ? 1.2 * standardWidth : standardWidth;

        // Criação do nó e dimensionamento
        const node = new joint.shapes.standard.Path();
        node.resize(nodeWidth, nodeHeight);

        // Define a posição do nó: se o nó já estava no grafo, sua posição já está guardada
        if (nodePositions.has(state)) {
            const position = nodePositions.get(state);
            if(position)
              node.position(position.x, position.y);

        // Do contrário tem que definir alguma posição. Futuramente mudar forma como posição está sendo definida
        } else {
            const position = { x: spacing + index * (nodeWidth + spacing), y: 100 };
            node.position(position.x, position.y);
            setNodePositions((prev) => new Map(prev.set(state, position)));
        }

        // Define atributos visuais do nodo
        node.attr({
            body: { fill: isInitial ? '#c6e9d4' : '#dfe3e6', stroke: '#000' },
            label: {
                text: state,
                fill: '#000',
                fontSize: 12,
                refX: isInitial ? "60%" : "50%", // Se ele é inicial, estamos desenhando uma seta que ocupa 20% do espaço dele. A centralização do texto precisa considerá-la
                refY: "50%",
                textAnchor: 'middle',
                textVerticalAnchor: 'middle'
            }
        });

        // Define a forma do nó dependendo do tipo de estado
        if (!isInitial && !isFinal) {
            // Um retângulo simples
            node.attr('body/refD', ['M 0 0 0 10 10 10 10 0 0 0']);
        } else if (isInitial && isFinal) {
            // 2 retângulos: 1 interno e outro externo + 1 seta no lado esquerdo apontando que o nodo é inicial
            node.attr('body/refD', [
                'M 0 0 0 10 2 5 0 0',
                'M 2 0 2 10 10 10 10 0 2 0',
                'M 2.75 1.5 2.75 8.5 9.25 8.5 9.25 1.5 2.75 1.5'
            ]);
          
        } else if (isFinal) {
            // 2 retângulos: 1 interno e outro externo
            node.attr('body/refD', [
                'M 0 0 0 10 10 10 10 0 0 0',
                'M 0.75 1.5 0.75 8.5 9.25 8.5 9.25 1.5 0.75 1.5'
            ]);
        } else {
            // 1 seta no lado esquerdo apontando que o nodo é inicial
            node.attr('body/refD', ['M 0 0 0 10 2 5 0 0', 'M 2 0 2 10 10 10 10 0 2 0']);
        }

        // Define um listener para o nó que atualiza a posição dele quando ele é movido
        node.on('change:position', (cell, newPosition) => {
            const nodeName = cell.attributes.attrs.label.text;
            setNodePositions((prev) => new Map(prev.set(nodeName, { x: newPosition.x, y: newPosition.y })));
        });

        nodesMap.set(state, node);
    });

    return nodesMap;
  };

  
    const addLink = (
      links: Map<string, Map<string, Map<string, joint.shapes.standard.Link>>>,
      target: string,
      source: string,
      symbol: string,
      link: joint.shapes.standard.Link
    ) => {
      // Se não existir um mapa para o target, inicializa
      if (!links.has(target)) {
        links.set(target, new Map());
      }
    
      const linksToTarget = links.get(target)!;
    
      // Se não existir um mapa para o source dentro do target, inicializa
      if (!linksToTarget.has(source)) {
        linksToTarget.set(source, new Map());
      }
    
      const linksToTargetFromSource = linksToTarget.get(source)!;
    
      // Insere o link associado ao símbolo
      linksToTargetFromSource.set(symbol, link);
    }
    
    const attachLinkEvents = (link: joint.shapes.standard.Link) => {
      const verticesTool = new joint.linkTools.Vertices({stopPropagation: false}); // Permite a adição e edição de vértices num link
      const toolsView = new joint.dia.ToolsView({ tools: [verticesTool] });
      
      //linkView.addTools(toolsView);
      //linkView.removeTools();
  
      // Quando o mouse "entra" no link, se ele estiver entre 20% e 80% da extensão do link (modificar isso depois), permite a edição de vértices
      paper.on("link:mouseenter", (linkView, evt) => {
        const bbox = linkView.findMagnet(evt.target)?.getBoundingClientRect();
        const isTarget = evt.clientX !== undefined && bbox &&
          evt.clientX < bbox.left + bbox.width &&
          evt.clientX > bbox.left;
  
        if (isTarget) linkView.addTools(toolsView);
  
      });
  
      paper.on("link:mouseleave", (linkView) => {
        linkView.removeTools();
      });
    }

  /**
   * Toma as transições da máquina e as adiciona ao grafo para serem representadas graficamente.
   * @param tokenizedInputs - Valores tokenizados da entrada, incluindo símbolos iniciais e do alfabeto.
   * @param transitions - Objeto contendo as transições da máquina de Turing.
   * @param nodes - Mapa do nome dos estados para o id deles no grafo
   * @returns Um Map que mapeia estados de destino, símbolos de leitura e escrita, respectivamente, para o link correspondente.
   */
  const getTransitions = (
    tokenizedInputs: TokenizedInputValues,
    transitions: Transitions,
    nodes: Map<string, any>
  ) => {

    // Atualiza o state que contém os links
    const links = new Map<string, Map<string, Map<string, joint.shapes.standard.Link>>>();

    
    const targetsMap = new Map<string, joint.shapes.standard.Link[]>();

    // Vai passando por cada transição
    for (const state of states) {
      for (const symbol of alphabet) {
        if (!transitions[state]) continue;
        const transition = transitions[state][symbol];
        if (!transition || transition.next === "") continue;

        // E tomando as informações da transição
        const transitionInfo = transition.next
          .split(",")
          .map((token) => token.trim())
          .filter((token) => token.length > 0);

        // Se o estado alvo da transição não existe, pula para a próxima
        const targetNode = nodes.get(transitionInfo[0]);
        if (!targetNode) continue;
        
        const sourceNode = nodes.get(state);
        if (!targetsMap.has(targetNode.id)) {
          targetsMap.set(targetNode.id, []);
        }

        // Se ele existe, inevitavelmente um link será colocado entre o alvo e a origem.
        
        // Verifica se já existe um link igual entre esses nós. Se já existir, é preciso usá-lo para guardar sua posição e vértices
        const existingLink = currentLinks.get(transitionInfo[0])?.get(state)?.get(symbol);

        
        if (existingLink) {
          const text = existingLink.attributes.labels?.[0]?.attrs?.text?.text;

          if (text && transitionInfo[1] === transition.next.split(',').map(token => token.trim()).filter(token => token.length > 0)[1]) {
            // Clona o link existente preservando vértices e propriedades, o adiciona ao grafo e pula para a próxima transição
            const newLink = new joint.shapes.standard.Link({
              source: { id: sourceNode.id },
              target: { id: targetNode.id },
              vertices: existingLink.get("vertices"),
              attrs: existingLink.get("attrs"),
            });

            newLink.appendLabel({
              position: { distance: 0.5, offset: -15 },
              attrs: {
                text: { 
                  text: `${symbol}, ${transitionInfo[1]}, ${transitionInfo[2]}`, 
                  fontSize: 12, 
                  fontWeight: "bold" 
                },
                rect: {
                  fill: '#fff', // Cor de fundo da caixa de texto
                  stroke: '#000', // Cor da borda
                  strokeWidth: 1,
                  refWidth: '120%',
                  refHeight: '120%',
                  refX: '-10%',
                  refY: '-10%',
                }
              }
            });
            newLink.addTo(graph);
            addLink(links, transitionInfo[0], state, symbol, newLink);


            if(currentTool.standard)
              attachLinkEvents(newLink);

            continue;
          }
        }

        // Se já não existir um link, é preciso criar um novo

        // Definiremos um único vértice inicial para esse novo link: o ponto central entre source e target
        const targetNodePosition = graph.getCell(targetNode).position();
        const sourceNodePosition = graph.getCell(sourceNode).position();
        const center = {
          x: (targetNodePosition.x + sourceNodePosition.x) / 2,
          y: (targetNodePosition.y + sourceNodePosition.y) / 2,
        };
        
        // Criação de um novo link e adição ao grafo
        const linkData = new joint.shapes.standard.Link({
          source: { id: sourceNode.id },
          target: { id: targetNode.id },
          vertices:
            sourceNode === targetNode // Se o link é na verdade um loop, vamos definir dois vértices para que o loop seja visível (pois o ponto central é o próprio centro do nodo)
              ? [
                  { x: center.x + 10, y: center.y - 20 },
                  { x: center.x + 80, y: center.y - 20 },
                ]
              : [{ x: center.x, y: center.y }],
        });

        // Adiciona uma caixa de texto ao link exatamente na metade do caminho dele
        linkData.appendLabel({
          position: { distance: 0.5, offset: -15 }, // distance 0.5 - metade do caminho, com um pequeno offset para não deixar o texto completamente em cima do link quando ele estiver na horizontal
          attrs: {
            text: { 
              text: `${symbol}, ${transitionInfo[1]}, ${transitionInfo[2]}`, 
              fontSize: 12, 
              fontWeight: "bold" 
            },
            rect: {
              fill: '#fff', 
              stroke: '#000', 
              strokeWidth: 1,
              refWidth: '120%',
              refHeight: '120%',
              refX: '-10%',
              refY: '-10%',
            }
          }
        });

        
        linkData.addTo(graph);
        addLink(links, transitionInfo[0], state, symbol, linkData);

        if(currentTool.standard)
          attachLinkEvents(linkData);
      }
    }

    return links;
  }

  const nodes = createNodes(states);

  graph.addCells(Array.from(nodes.values()));
  const links = getTransitions(tokenizedInputs, transitions, nodes);
  setLinks(links);


// ====================================================================================
// EVENTOS E LISTENERS 
// ====================================================================================


// ------------------------------------------------------------------------------------
// GERAIS:
// ------------------------------------------------------------------------------------

// Lógica de control + Z (undo) e control + Y (redo)

const undo = () => {
  
  if (historyIndex > 0) {
    const state = history[historyIndex - 1];

    setHistoryIndex(historyIndex - 1);
    onChangeInputs({...state.inputs}, {...state.tokenizedInputs}, {...state.transitions}, {...state.errors}); // Restaura o estado anterior
  }
};

const redo = () => {

  if (historyIndex < history.length - 1) {

    const state = history[historyIndex + 1];
    setHistoryIndex(historyIndex + 1);
    onChangeInputs({...state.inputs}, {...state.tokenizedInputs}, {...state.transitions}, {...state.errors}); // Restaura o próximo estado
  }
};


const handleKeyDown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key.toLowerCase() === "z") {
      e.preventDefault(); // Evita ações padrão do navegador
    undo();
  } else if (e.ctrlKey && e.key.toLowerCase() === "y") {
      e.preventDefault();
    redo();
  }
};

document.addEventListener("keydown", handleKeyDown);
eventHandlers.push({element: document, event: "keydown", handler: handleKeyDown});
// ------------------------------------------------------------------------------------

  // Adiciona eventos para exibição de ferramentas ao passar o mouse sobre um link



// ------------------------------------------------------------------------------------

  // Permite movimento do paper através do arraste


  if(!currentTool.selection){
  let dragStartPosition: { x: number; y: number } | null = null; // Variável para armazenar a posição inicial de arraste


  // Captura a posição inicial de arrate quando ocorre um clique numa área em branco
  paper.on("blank:pointerdown", (evt, x, y) => { 


    if(evt.target.tagName != "svg") return;
    
    const scale = paper.scale();

    if(dragStartPosition === null)
      dragStartPosition = { x: x * scale.sx, y: y * scale.sy }; // Ajuste para o escalonamento

    
    
  });

  // limpa a posição de arraste quando o mouse é solto
  paper.on("blank:pointerup", () => {
    dragStartPosition = null;
  });
      
  // Função para mover conteúdo do paper conforme o mouse se move
  const handleMouseMove = (event: MouseEvent) => {
    if (dragStartPosition !== null) {
      const deltaX = event.offsetX - dragStartPosition.x;
      const deltaY = event.offsetY - dragStartPosition.y;

      // Translaciona o conteúdo do paper
      paper.translate(deltaX , deltaY );
      setTranslation({ x: deltaX, y: deltaY });
    }
  };

  containerRef.current?.addEventListener("mousemove", handleMouseMove);
  eventHandlers.push({element: containerRef.current, event: "mousemove", handler: handleMouseMove});
}

// ------------------------------------------------------------------------------------

  // Controle da escala (zoom)

  paper.scale(currentScale);

  const paperContainer = document.getElementById('paper-container');

  const scaleIncrement = 0.1; // Incremento/decremento da escala
  const minScale = 0.2; // Escala mínima
  const maxScale = 2; // Escala máxima


  if (paperContainer) {
    paperContainer.addEventListener('wheel', function (event){
    event.preventDefault(); // Evita o scroll padrão da página

    if (event.deltaY < 0) {
        // Scroll para cima (zoom in)
        setCurrentScale(Math.min(currentScale + scaleIncrement, maxScale));
    } else {
        // Scroll para baixo (zoom out)
        setCurrentScale(Math.max(currentScale - scaleIncrement, minScale));
    }
        });
    }




// ------------------------------------------------------------------------------------
// ESPECÍFICOS DE FERRAMENTAS
// ------------------------------------------------------------------------------------

  // ------------------------------------------------------------------------------------
  // EDITAR LINKS
  // ------------------------------------------------------------------------------------


  // Permite mover os links

    let movingLink:any = null; // Referência ao link sendo movido
    let targetNode:any = null;  // Referência ao nodo que o link está em cima
    let mustMove = false; // Indica se de fato clicamos para mover o link
    let initialPosition:any = null; // Guarda a posição inicial caso precise desfazer
    
    // Início do movimento quando o mouse clica no link
   /* paper.on('link:pointerdown', (linkView, evt, x, y) => {
      evt.preventDefault();
    
      movingLink = linkView.model; 
    
      initialPosition = {
        source: movingLink.get('source'),
        target: movingLink.get('target'),
      };

      // Remove os vértices pra não ficar feio o movimento (teria que guardar eles pra caso não ocorra mudança, retorná-los)
      movingLink.set('vertices', []);      


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
      if (movingLink) {

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

        movingLink.set('target', newPosition);

      }
    }
    
    // Finaliza o movimento quando solta o clique do mouse
    function handleMouseUp(evt : any) {
      if (movingLink) {
    
        if (targetNode) {
          // Havendo um nodo alvo, define ele como target
          movingLink.set('target', { id: targetNode.id });
          targetNode.attr('body/stroke', 'black');
          
        } else {
          // Se não, volta à posição inicial
          movingLink.set('source', initialPosition.source);
          movingLink.set('target', initialPosition.target);
        }
    
        movingLink = null; 
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
      handleInputsChange({...inputs, states: (states.length > 0)? `${inputs.states}, q${states.length}` : `q${states.length}`}, {...tokenizedInputs, states: (states.length > 0)? [...states, `q${states.length}`] : [`q${states.length}`]}, transitions);
    })

  }




  // ------------------------------------------------------------------------------------
  // SELEÇÃO
  // ------------------------------------------------------------------------------------

  if(currentTool.selection){

    // Todas as células selecionadas
    let selectedCells:joint.dia.Cell[] = [];

    
    const deleteSelectedCells = (selectedCells: joint.dia.Cell[]) => {
      let newTransitions = {...transitions};
      let newStates = [...states];
      let newFinalStates = [...tokenizedInputs.finalStates];
      let newInitState = [...tokenizedInputs.initState];

      // Para cada célula selecionada
      selectedCells.forEach((cell) => {

        // Se ela for um nodo (estado)
        if(cell.isElement()){
          const deletedState = cell.attributes?.attrs?.label?.text || ""; // pega o nome dele
          newStates = newStates.filter((state) => state != deletedState); // tira ele dos estados
          newFinalStates = newFinalStates.filter((state) => state != deletedState); // tira dos estados finais
          newInitState = newInitState.filter((state) => state != deletedState); // tira do estado inicial

          delete newTransitions[deletedState]; // deleta todas as transições com ele como origem
        }

        // Se ela for um link
        else if(cell.isLink()){

          // Pega o texto da transição
          const deletedTransition = cell.attributes.labels[0].attrs.text.text.split(',').map((token: string) => token.trim()).filter((token:string) => token.length > 0);

          // Se tiver algo no texto da transição
          if(deletedTransition.length > 0){
            const readSymbol = deletedTransition[0];
            const originNode = graph.getCell(cell.attributes.source.id);

            // Isso não deveria acontecer, pois se há um link desenhado deve haver um estado de origem para esse link
            if(originNode === null || originNode.attributes === undefined || originNode.attributes.attrs === undefined || originNode.attributes.attrs.label === undefined)
                return;

            const originState = originNode.attributes.attrs.label.text;

            // Isso também não deveria acontecer, pois se há um estado desenhado ele deveria ter um nome (um texto)
            if(!originState)
              return;
            
            // Como estamos apagando os estados também e junto deles todas as suas transições, essa situação pode ocorrer (apaguei o estado e todos os links nele e agora estou tentando apagar o link de novo)
            if(!newTransitions[originState])
              return;

            // Por fim, se o símbolo de leitura for válido para o alfabeto, aí sim apaga a transição
            if(alphabet.includes(readSymbol))
              newTransitions[originState] = {...newTransitions[originState], [readSymbol]: { next: "", error: 0 } };
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

    // Quando clica com o mouse, reseta todas as seleções e cria uma nova caixa de seleção, permitindo que ela cresça/diminua conforme o movimento do mouse
    const handleMouseDown = (event: MouseEvent) => {
      if (!containerRef.current) return;
    
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
      const container = containerRef.current;
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


        const allCells = graph.getCells();


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

          deleteSelectedCells(selectedCells);
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
    if (containerRef.current) {
      containerRef.current.addEventListener("mousedown", handleMouseDown);
      eventHandlers.push({element: containerRef.current, event: "mousedown", handler: handleMouseDown});
    }
  }

  // ------------------------------------------------------------------------------------
  // PADRÃO
  // ------------------------------------------------------------------------------------

    if(currentTool.standard){


    // FUNÇÕES AUXILIARES


    // Dada uma célula (um nodo), checa se o estado representado por aquela célula é um estado final. Se for, torna ele um estado não final. Se não for, torna ele um estado final
    const changeFinalStatus = (cell:any) => {
      const state = cell?.attributes?.attrs?.label?.text || '';
      let newFinalStates : string[];

      if(tokenizedInputs.finalStates.includes(state)){
        newFinalStates = tokenizedInputs.finalStates.filter((s) => s != state);
      }
      else{
        if(tokenizedInputs.finalStates.length == 1 && tokenizedInputs.finalStates[0] == "") 
          newFinalStates = [state];
        else
          newFinalStates = [...tokenizedInputs.finalStates, state];
      }
  
      handleInputsChange({...inputs, finalStates: newFinalStates.join(", ")}, {...tokenizedInputs, finalStates: newFinalStates}, transitions);
    }


    // Dada uma célula (um nodo), checa se o estado representado por aquela célula é um estado inicial. Se for, torna ele um estado não inicial. Se não for, torna ele um estado inicial
    const changeInitStatus = (cell:any) => {
      const state = cell?.attributes?.attrs?.label?.text || '';

      let newInitState : string[]; 

      if(tokenizedInputs.initState.includes(state))
        newInitState = tokenizedInputs.initState.filter((s) => s != state);
      else
        newInitState = [state];
  
      handleInputsChange({...inputs, initState: newInitState.join(", ")}, {...tokenizedInputs, initState: newInitState}, transitions);
    }


    // Função auxiliar usada para criar os botões que permitem tornar o estado de um nodo selecionado um estado inicial/final. Ela é usada para criar os botões ao lado dos nodos
    // Dado um texto, um deslocamento no eixo y e as informações de uma caixa, cria um botão no lado direito da caixa deslocado em y pelo valor passado e com o texto passado
    const createButton = (text:string, topOffset:number, paperRect:any, bbox:any) => {
      const button = document.createElement('button');
      button.textContent = text;
      button.className = 'node-button';
      button.style.position = 'absolute';
      button.style.left = `${bbox.x + bbox.width + 10}px`; // Ao lado do nó
      button.style.top = `${bbox.y + topOffset}px`; // Ajuste vertical
      button.style.zIndex = "4"; // Garantir que fique acima do SVG
      if(containerRef.current)
        containerRef.current.appendChild(button);
      return button;
      };
      
      // Função usada para atualizar as posições dos botões que alteram o status inicial/final do nodo selecionado conforme ele se mexe
      // Dados dois botões, atualiza a posição deles para eles ficarem ao lado do nodo selecionado no momento. 
      const updateButtonPositions = (button1:HTMLButtonElement, button2:HTMLButtonElement) => {
      const bbox = currentCellView.current.getBBox();
      const paperRect = paper.el.getBoundingClientRect();


      button1.style.left = `${bbox.x + bbox.width + 10}px`;
      button1.style.top = `${bbox.y}px`;
            
      button2.style.left = `${bbox.x + bbox.width + 10}px`;
      button2.style.top = `${bbox.y + 20}px`;
      };


    // Deleta o nodo selecionado quando a tecla Delete é apertada
    const deleteNode = (e:any) => {

      if(e.key != 'Delete' || !(currentCellView.current))
        return;

      document.querySelectorAll('.node-button').forEach(btn => btn.remove());

      const deletedState = currentCellView.current.model.attributes.attrs.label.text;


      const newStates = tokenizedInputs.states.filter((state) => state != deletedState);
      const newFinalStates = tokenizedInputs.finalStates.filter((state) => state != deletedState);
      const newInitState = tokenizedInputs.initState.filter((state) => state != deletedState);

      const newTransitions = {...transitions};
      delete newTransitions[deletedState];


      currentCellView.current = null;
      
      document.removeEventListener("keydown", deleteNode);


      handleInputsChange({...inputs, states: newStates.join(", "), finalStates: newFinalStates.join(", "), initState: newInitState.join(", ")},
        {...tokenizedInputs, states: newStates, finalStates: newFinalStates, initState: newInitState},
        newTransitions
      )
    }






// ------------------------------------------------------------------------------------

    // INICIALIZAÇÃO
  
    // Elimina resquícios de listeners e botões de outras renderizações (poderia colocar no cleanup, mas aí teria que tirar a função auxiliar deleteNode do condicional)
    document.removeEventListener("keydown", deleteNode);
    document.querySelectorAll('.node-button').forEach(btn => btn.remove());


    // Se existir uma célula selecionada
    if(currentCellView.current){
      // Mas a célula não representa nenhum estado (o que não deveria acontecer), desceleciona a célula 
      if(!nodes.get(currentCellView.current.model?.attributes?.attrs?.label?.text || ''))
        currentCellView.current = null
      
      // Se a célula representa algum estado, é preciso atualizá-la para a nova renderização, pois currentCellView guarda as informações do nodo da renderização passada
      else{
        // Atribui à célula selecionada o novo nodo
        currentCellView.current =  nodes.get(currentCellView.current.model?.attributes?.attrs?.label?.text || '').findView(paper);

        currentCellView.current.model.attr('body/stroke', 'green'); 

        // e cria novamente os botões de edição de estado final/inicial
        const bbox = currentCellView.current.getBBox();
        const paperRect = paper.el.getBoundingClientRect();

        const button1 = createButton('Final', 0, paperRect, bbox);
        button1.onclick = () => changeFinalStatus(currentCellView.current.model);
  
        const button2 = createButton('Inicial', 20, paperRect, bbox);
        button2.onclick = () => changeInitStatus(currentCellView.current.model);
      }
    }

// ------------------------------------------------------------------------------------

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

        if(movingLink !== null){
          movingLink.model.attr('line/stroke', 'black');
          document.removeEventListener('keydown', deleteLink);
          movingLink = null;
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

        if(movingLink != linkView){
          if(movingLink !== null)
            movingLink.model.attr('line/stroke', 'black');

          document.removeEventListener('keydown', deleteLink);

          movingLink = linkView;
          movingLink.model.attr('line/stroke', 'blue');
        }

        document.addEventListener('keydown', deleteLink);
        eventHandlers.push({element: document, event: "keydown", handler: deleteLink});

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

          document.addEventListener('keydown', deleteNode);
          eventHandlers.push({element: document, event: "keydown", handler: deleteNode});
          currentCellView.current.model.attr('body/stroke', 'green');

          if(movingLink !== null){
            movingLink.model.attr('line/stroke', 'black');
            document.removeEventListener('keydown', deleteLink);
            movingLink = null;
          }

          const bbox = currentCellView.current.getBBox();
          const paperRect = paper.el.getBoundingClientRect();

          // Cria os botões e define suas ações. Deu algum problema de sincronização ao usar a função updateButtonPositions para definir a posição dos botões logo na inicialização
          // Por isso, as posições estão sendo definidas diretamente na createButtons, e então ao mover as posições são atualizadas
          const button1 = createButton('Final', 0, paperRect, bbox);
          button1.onclick = () => changeFinalStatus(currentCellView.current.model);

          const button2 = createButton('Inicial', 20, paperRect, bbox);
          button2.onclick = () => changeInitStatus(currentCellView.current.model);

          cellView.model.on('change:position', () => updateButtonPositions(button1, button2));

        })


// ------------------------------------------------------------------------------------

    // Edição de nodos/links

        // Edição de link ao clicar 2 vezes sobre ele
        paper.on('link:pointerdblclick', (linkView, event) => {

          if (containerRef.current === null) return;

          // Se clicou sobre um círculo é porque clicou em um vértice (para editar, é preciso clicar direto na caixa de texto)
          if(event.target.tagName === "circle") 
            return;

          const link = linkView.model;

          // Obtém o texto antes da edição
          const currentText = link.attributes.labels[0].attrs.text.text;
          const originalText = currentText;
        
          // tokeniza o texto e obtém o símbolo de leitura da transição
          const readSymbol = originalText.split(',').map((token: string) => token.trim()).filter((token:string) => token.length > 0)[0];

          // Obtém o alvo e a fonte
          const originNode = graph.getCell(movingLink.model.attributes.source.id);
          const originState = originNode?.attributes?.attrs?.label?.text || '';

          const targetNode = graph.getCell(movingLink.model.attributes.target.id);
          const targetState = targetNode?.attributes?.attrs?.label?.text || '';
        
          

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
            let transitionInfo = input.value.split(',').map((token: string) => token.trim()).filter((token:string) => token.length > 0);
            const newTransitions = { ...transitions };
            
            // A configuração atual inclui, quando algo não pe definido na transição, a palavra "undefined" na hora do desenho
            // Se o alfabeto não incluir essa palavra, elimina ela. Não tem perigo de ela ser o símbolo de leitura (índice 0), porque a transição nem existiria se fosse assim, vide abaixo
            if(!alphabet.includes("undefined"))
              transitionInfo = transitionInfo.filter((token:string) => token != "undefined");

            // Se o alfabeto não inclui o símbolo de leitura e tem alguma coisa escrita na trANSIÇÃO, retorna. Ou seja, não salva a edição e deixa como estava
            if(transitionInfo.length != 0 && !alphabet.includes(transitionInfo[0])){
              input.remove();
              document.removeEventListener('mousedown', handleClick);
              return;
            }

            // Apaga a transição antiga
            newTransitions[originState][readSymbol].next = "";

            // Se no texto editado não tem nada escrito, atualiza as transições e retorna
            if(transitionInfo.length == 0){
              
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
            if(readSymbol != transitionInfo[0] && prevTransition.next != ""){
              alert("Não determinismo detectado"); 
              input.remove();
              document.removeEventListener('mousedown', handleClick);
              return;
            }


            // Passando do teste do não determinismo, pode salvar a transição, colocar o valor nela na nova label do link e atualizar as transições
              let next;
              if(transitionInfo.length > 1)
                next = `${targetState}, ${transitionInfo.slice(1).join(", ")}`;
              else
                next = targetState;


              newTransitions[originState][transitionInfo[0]] = { ...newTransitions[originState][transitionInfo[0]], next: next };

            
            
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
        


    // Habilita a edição de texto ao clicar duas vezes sobre nodo
    paper.on('element:pointerdblclick', (cellView, event, x, y) => {

      document.removeEventListener("keydown", deleteNode);

      if(containerRef.current === null)
        return;

      document.querySelectorAll('.node-button').forEach(btn => btn.remove());

      const cell = cellView.model;

      const currentText = cell.attr('label/text');
      const originalText = currentText;

      const bbox = cellView.getBBox();
      const paperRect = containerRef.current.getBoundingClientRect();

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


      document.addEventListener("mousedown", handleClick);
      eventHandlers.push({element: document, event: "mousedown", handler: handleClick});


      // Lida com teclas pressionadas enquanto o texto está sendo editado
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key == 'Escape') saveText();
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
        }
      };
    
    });

    // Deleção de um nodo selecionado
    const deleteLink = (e:any) => {

          if(e.key != 'Delete' || !movingLink)
            return;
    
          const deletedTransition = movingLink.model.attributes.labels[0].attrs.text.text.split(',').map((token: string) => token.trim()).filter((token:string) => token.length > 0);

          
          if(deletedTransition.length > 0){
            const readSymbol = deletedTransition[0];
            const originNode = graph.getCell(movingLink.model.attributes.source.id);

            // Isso não deveria acontecer...
            if(originNode === null || originNode.attributes === undefined || originNode.attributes.attrs === undefined || originNode.attributes.attrs.label === undefined)
                return;

            const originState = originNode.attributes.attrs.label.text;

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

    } 




    console.log("Terminou o desenho");
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keydown", undo);
      document.removeEventListener("keydown", redo);

      eventHandlers.forEach((listener) => listener.element.removeEventListener(listener.event, listener.handler as EventListener));
      
      //document.removeEventListener("mousemove", handleMouseMove);
      

      if(movingLink){
        movingLink.model.attr('line/stroke', 'black');
        movingLink = null;
      }
    };
    }, [tokenizedInputs, transitions, currentTool, currentScale]); 
  



    return (
        <GraphConteiner ref={containerRef}></GraphConteiner>
    );
  }
  

export default SimpleDiagram;
