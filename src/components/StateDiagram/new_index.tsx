import React, { useState, useEffect, useRef, useContext } from "react";
import * as joint from 'jointjs';
import { Transitions, InputValues, TokenizedInputValues, InputErrors } from '../../types/types';
import { GraphConteiner } from "./styled";
import { CurrentTool } from "../../types/types";
import { useStateContext } from "../../ContextProvider";


/*
TO DO: 

- Arrumar atribuição de nome para os estados ao serem criados com o clique duplo: no momento não funciona porque o nome é sempre q{qtd de estados}, mas como há
deleção de estados isso pode bugar
- Permitir que links sejam adicionados  
- Arrumar bug em que quando o link é redirecionado para o próprio nodo fonte formando um loop ele fica estranho (adicionar vértices nessa condição)
- Atualizar mensagens de erro quando fizer edições diretamente no grafo
- Não determinismo!

- Control + Z e Control + Y?
- Modo de tela cheia para grafo e tabela???
*/



interface i_simple_diagram {
  inputValues: InputValues;
  inputTokenizedValues : TokenizedInputValues;
  onChangeInputs: (inputs: InputValues, inputs_tokenized: TokenizedInputValues, new_transitions: Transitions) => void;
  currentTool: CurrentTool;
  transitions: Transitions;
}

export function SimpleDiagram({ inputValues, inputTokenizedValues, onChangeInputs, currentTool, transitions }: i_simple_diagram) {

    const containerRef = useRef<HTMLDivElement | null>(null);
    const currentCellView = useRef<any>(null);

    // Se é pra tirar as posições já do contexto, talvez seja melhor já pegar tudo do contexto, aí não precisa ficar passando coisas como parâmetro
    const {graphNodes, graphLinks} = useStateContext();

    // Guarda todos os links que já foram desenhados. É um map cujas chaves são, respectivamente, um estado alvo, um estado origem e o símbolo de leitura, e o valor é o link
    const {currentLinks, setLinks} = graphLinks;

    // Salva as posições dos nós. É um map dos nomes dos estados para suas posições
    const {nodePositions, setNodePositions} = graphNodes;

    const [currentScale, setCurrentScale] = useState(1); // Estado para controle da escala
    
    const [translation, setTranslation] = useState<{x: number, y: number}>({x: 0, y: 0});




    const alphabet = Array.from(
      new Set([
        inputTokenizedValues.initSymbol[0],
        ...inputTokenizedValues.inAlphabet.filter((symbol) => symbol !== ""),
        ...inputTokenizedValues.auxAlphabet.filter((symbol) => symbol !== ""),
        inputTokenizedValues.blankSymbol[0],
      ]))

    const states = inputTokenizedValues.states;
  
    useEffect(() => {

        if(containerRef.current === null){
            return;
        }

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
          interactive: { useLinkTools: false, labelMove: false }
          
        });
  

  /**
   * Cria e posiciona os nós do grafo representando os estados.
   * 
   * @param {string[]} states - Lista de estados.
   * @returns {Map<string, any>} - Mapa associando os nomes dos estados ao id correspondente deles no grafo.
   */
  const createNodes = (states:string[]) => {
    const nodesMap = new Map();

    // Futuramente mudar forma como os nodos estão sendo dimensionados para ser mais dinâmico em relação à altura
    const nodeHeight = 40;
    const spacing = 20;

    states.forEach((state, index) => {
        const isFinal = inputTokenizedValues.finalStates.includes(state);
        const isInitial = inputTokenizedValues.initState[0] === state;
        
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

    function addLink(
      links: Map<string, Map<string, Map<string, joint.shapes.standard.Link>>>,
      target: string,
      source: string,
      symbol: string,
      link: joint.shapes.standard.Link
    ) {
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
    

  /**
   * Toma as transições da máquina e as adiciona ao grafo para serem representadas graficamente.
   * @param inputTokenizedValues - Valores tokenizados da entrada, incluindo símbolos iniciais e do alfabeto.
   * @param transitions - Objeto contendo as transições da máquina de Turing.
   * @param nodes - Mapa do nome dos estados para o id deles no grafo
   * @returns Um mapa de links organizados por estados de destino.
   */
  function getTransitions(
    inputTokenizedValues: TokenizedInputValues,
    transitions: Transitions,
    nodes: Map<string, any>
  ) {

    // Atualiza o state que contém os links
    const links = new Map<string, Map<string, Map<string, joint.shapes.standard.Link>>>();

    
    const targetsMap = new Map<string, joint.shapes.standard.Link[]>();

    const initialSymbol = inputTokenizedValues.initSymbol[0];
    const blankSymbol = inputTokenizedValues.blankSymbol[0];
 

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

        linkData.appendLabel({
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

        
        linkData.addTo(graph);
        addLink(links, transitionInfo[0], state, symbol, linkData);

        if(currentTool.standard)
          attachLinkEvents(linkData);
      }
    }

    setLinks(links);
    return targetsMap;
  }

  const nodes = createNodes(states);
  graph.addCells(Array.from(nodes.values()));
  getTransitions(inputTokenizedValues, transitions, nodes);


// ====================================================================================
// EVENTOS E LISTENERS
// ====================================================================================

  // Adiciona eventos para exibição de ferramentas ao passar o mouse sobre um link
  function attachLinkEvents(link: joint.shapes.standard.Link) {
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

// ------------------------------------------------------------------------------------

  // Permitir movimento do paper através do arraste

  let dragStartPosition: { x: number; y: number } | null = null; // Variável para armazenar a posição inicial de arraste


  // Captura a posição inicial de arrate quando ocorre um clique numa área em branco
  paper.on("blank:pointerdown", (evt, x, y) => { 
    if(evt.target.tagName != "svg")
      return;


    const scale = paper.scale();

    if(dragStartPosition === null)
      dragStartPosition = { x: x * scale.sx, y: y * scale.sy }; // Ajuste para o escalonamento

    
    
  });
      

  // limpar a posição de arraste quando o mouse for solto
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

  // Movimento de links

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

    // Eventos relacionados a nodos

    






    

    // Adiciona um novo nodo ao clicar duas vezes sobre espaço vazio
    paper.on('blank:pointerdblclick', (evt, x, y) => {
      setNodePositions((prev) => new Map(prev.set(`q${states.length}`, { x: x - 50, y: y - 20})));
      onChangeInputs({...inputValues, states: (states.length > 0)? `${inputValues.states}, q${states.length}` : `q${states.length}`}, {...inputTokenizedValues, states: (states.length > 0)? [...states, `q${states.length}`] : [`q${states.length}`]}, transitions);
    })





    /*


        // Evento de clique
    paper.on('cell:click', (cellView, evt) => {
      const bbox = cellView.getBBox();
      const mouseX = evt.clientX - paper.el.getBoundingClientRect().left;
      const mouseY = evt.clientY - paper.el.getBoundingClientRect().top;
    
      const nearEdge =
        mouseX < bbox.x + edgeThreshold || 
        mouseX > bbox.x + bbox.width - edgeThreshold ||
        mouseY < bbox.y + edgeThreshold ||
        mouseY > bbox.y + bbox.height - edgeThreshold;
    
      if (nearEdge) {
        // Código para criar novo nodo e adicionar listeners de movimentação e criação de links
        console.log('Criar novo nodo');
        // Aqui você pode criar o novo nodo e adicionar as funcionalidades que deseja.
      } else {
        // Código para mover a célula
        console.log('Mover a célula');
        // Se já tiver a funcionalidade de mover a célula, ela pode ser executada aqui.
      }
    });

    function handleMoveOnCell(evt:any){

      if(!currentCellView)
        return;

      const bbox = currentCellView.getBBox(); // Pega as coordenadas e o tamanho da célula
      const horizontalEdgeThreshold = bbox.width * 0.15; // Distância da borda para considerar 
      const verticalEdgeThreshold = bbox.height * 0.15;
      const x = evt.clientX;
      const y = evt.clientY;



      if(!x || !y)
        return;

      const mouseX = x - paper.el.getBoundingClientRect().left;
      const mouseY = y - paper.el.getBoundingClientRect().top;

      // Verifica se o mouse está perto da borda
      const nearEdge =
        mouseX < bbox.x + horizontalEdgeThreshold || 
        mouseX > bbox.x + bbox.width - horizontalEdgeThreshold ||
        mouseY < bbox.y + verticalEdgeThreshold ||
        mouseY > bbox.y + bbox.height - verticalEdgeThreshold;
    
      if (nearEdge) {
        // Permite criação de um novo nodo (você pode adicionar um clique para isso)
        currentCellView.el.style.cursor = 'pointer'; // Mudança de cursor para indicar que pode criar um nodo
        currentCellView.model.attr('body/stroke', 'green');

      
        document.addEventListener('click', handleClickOnCell);

      } else {
        // Permite movimentação da célula
        currentCellView.el.style.cursor = 'default'; 
        currentCellView.model.attr('body/stroke', 'black');
        document.removeEventListener('click', handleClickOnCell);
      }
    }


    */


// ------------------------------------------------------------------------------------


const changeFinalStatus = (cell:any) => {

  const state = cell?.attributes?.attrs?.label?.text || '';


  let newFinalStates : string[];

  if(inputTokenizedValues.finalStates.includes(state)){
    newFinalStates = inputTokenizedValues.finalStates.filter((s) => s != state);
  }
  else{
    if(inputTokenizedValues.finalStates.length == 1 && inputTokenizedValues.finalStates[0] == "") 
      newFinalStates = [state];
    else
      newFinalStates = [...inputTokenizedValues.finalStates, state];
  }
  
  onChangeInputs({...inputValues, finalStates: newFinalStates.join(", ")}, {...inputTokenizedValues, finalStates: newFinalStates}, transitions);
}


const changeInitStatus = (cell:any) => {
  const state = cell?.attributes?.attrs?.label?.text || '';

  let newInitState : string[]; 

  if(inputTokenizedValues.initState.includes(state))
    newInitState = inputTokenizedValues.initState.filter((s) => s != state);
  else
    newInitState = [state];
  
  onChangeInputs({...inputValues, initState: newInitState.join(", ")}, {...inputTokenizedValues, initState: newInitState}, transitions);
}




    // Criar função auxiliar para gerar botões
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
      
      // Criar função para posicionar botões dinamicamente
      const updateButtonPositions = (button1:HTMLButtonElement, button2:HTMLButtonElement) => {
      const bbox = currentCellView.current.getBBox();
      const paperRect = paper.el.getBoundingClientRect();


      button1.style.left = `${bbox.x + bbox.width + 10}px`;
      button1.style.top = `${bbox.y}px`;
            
      button2.style.left = `${bbox.x + bbox.width + 10}px`;
      button2.style.top = `${bbox.y + 20}px`;
      };


          // Deleção de um nodo selecionado
    const deleteNode = (e:any) => {

      if(e.key != 'Delete' || !(currentCellView.current))
        return;

      document.querySelectorAll('.node-button').forEach(btn => btn.remove());

      const deletedState = currentCellView.current.model.attributes.attrs.label.text;


      const newStates = inputTokenizedValues.states.filter((state) => state != deletedState);
      const newFinalStates = inputTokenizedValues.finalStates.filter((state) => state != deletedState);
      const newInitState = inputTokenizedValues.initState.filter((state) => state != deletedState);

      const newTransitions = {...transitions};
      delete newTransitions[deletedState];


      currentCellView.current = null;

      onChangeInputs({...inputValues, states: newStates.join(", "), finalStates: newFinalStates.join(", "), initState: newInitState.join(", ")},
        {...inputTokenizedValues, states: newStates, finalStates: newFinalStates, initState: newInitState},
        newTransitions
      )

      


    }

let buttons = document.querySelectorAll('.node-button');

if(currentCellView.current){
  if(!nodes.get(currentCellView.current.model?.attributes?.attrs?.label?.text || '')){
    buttons.forEach(btn => btn.remove());
    currentCellView.current = null
  }
  else{
    currentCellView.current =  nodes.get(currentCellView.current.model?.attributes?.attrs?.label?.text || '').findView(paper);
    document.addEventListener('keydown', deleteNode);
    currentCellView.current.model.attr('body/stroke', 'green');
  }
}


buttons = document.querySelectorAll('.node-button');
if(buttons.length > 0){  

  const bbox = currentCellView.current.getBBox();
  const paperRect = paper.el.getBoundingClientRect();

  buttons.forEach(btn => btn.remove());

  const button1 = createButton('Final', 0, paperRect, bbox);
  button1.onclick = () => changeFinalStatus(currentCellView.current.model);

  const button2 = createButton('Inicial', 20, paperRect, bbox);
  button2.onclick = () => changeInitStatus(currentCellView.current.model);

 

}

  
    if(currentTool.editLinks){
      console.log("Editando Link");

    }


    else if(currentTool.standard){






      paper.on("blank:pointerdown", (evt, x, y) => { 
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


      paper.on("link:pointerdown", (linkView, evt, x, y) => {
        if(currentCellView.current !== null){
          currentCellView.current.model.attr('body/stroke', 'black');
          document.querySelectorAll('.node-button').forEach(btn => btn.remove());
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

      })

      
        // Seleção do nodo ao clicar sobre ele, além da criação dos botões que permitem tornar o nodo estado inicial e estado final
        paper.on('cell:pointerdown', (cellView, evt, x, y) => {          
          document.querySelectorAll('.node-button').forEach(btn => btn.remove());
          
          
          if(cellView != currentCellView.current){


            if(currentCellView.current !== null)
              currentCellView.current.model.attr('body/stroke', 'black');
          
            document.querySelectorAll('.node-button').forEach(btn => btn.remove());
            currentCellView.current = cellView;
          }

          document.addEventListener('keydown', deleteNode);
    
          
          currentCellView.current.model.attr('body/stroke', 'green');


          if(movingLink !== null){
            movingLink.model.attr('line/stroke', 'black');
            document.removeEventListener('keydown', deleteLink);
            movingLink = null;
          }

          const bbox = currentCellView.current.getBBox();
          const paperRect = paper.el.getBoundingClientRect();

  // Criar botões e definir suas ações. Deu algum problema de sincronização ao usar a função updateButtonPositions para definir a posição dos botões logo na inicialização
  // Por isso, as posições estão sendo definidas diretamente na createButtons, e então ao mover as posições são atualizadas
  const button1 = createButton('Final', 0, paperRect, bbox);
  button1.onclick = () => changeFinalStatus(currentCellView.current.model);

  const button2 = createButton('Inicial', 20, paperRect, bbox);
  button2.onclick = () => changeInitStatus(currentCellView.current.model);



  cellView.model.on('change:position', () => updateButtonPositions(button1, button2));

        })


        



        paper.on('link:pointerdblclick', (linkView, event) => {
          if (containerRef.current === null) return;

          if(event.target.tagName === "circle") // clicou em um vértice (para editar, é preciso clicar na caixa de texto)
            return;

          const link = linkView.model;
          const currentText = link.attributes.labels[0].attrs.text.text; // Obtém o texto atual do rótulo
          const originalText = currentText;
        
          const readSymbol = originalText.split(',').map((token: string) => token.trim()).filter((token:string) => token.length > 0)[0];

          const originNode = graph.getCell(movingLink.model.attributes.source.id);
          const originState = originNode?.attributes?.attrs?.label?.text || '';

          const targetNode = graph.getCell(movingLink.model.attributes.target.id);
          const targetState = targetNode?.attributes?.attrs?.label?.text || '';

          const labelPosition = link.label(0)?.position || { distance: 0.5, offset: -15 };
        
          const textBox = event.target.getBoundingClientRect();
          const containerBox = containerRef.current.getBoundingClientRect();

          

          // Cria um elemento input para edição
          const input = document.createElement('input');
          input.value = currentText;
          input.style.position = 'absolute';
          input.style.left = `${textBox.x - containerBox.x}px`; // Centraliza na linha
          input.style.top = `${textBox.y - containerBox.y}px`;
          input.style.fontSize = '12px';
          input.style.padding = '2px';
          input.style.zIndex = '1000';
          input.style.background = '#fff';
          input.style.border = '1px solid #ccc';
          input.style.borderRadius = '4px';
          input.style.width = `${textBox.width}px`;
          input.style.height = `${textBox.height}px`;
        
          containerRef.current.appendChild(input);
        
          input.focus();
        
          // Fecha o input ao clicar fora
          const handleClick = (event: any) => {
            if (event.target === input) return;
            saveText();
            document.removeEventListener('mousedown', handleClick);
          };
        
          document.addEventListener('mousedown', handleClick);
        
          // Fecha o input ao pressionar Enter ou Escape
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'Escape') saveText();
          });
        
          const saveText = () => {
            if (input) {
              link.label(0, {
                position: labelPosition,
                attrs: {
                  text: { text: input.value, fontSize: 12, fontWeight: "bold" },
                },
              });
        
              document.removeEventListener('mousedown', handleClick);
        
              const newTransitions = { ...transitions };
              if (newTransitions[originState]?.[readSymbol]) {
                let transitionInfo = input.value.split(',').map((token: string) => token.trim()).filter((token:string) => token.length > 0);
                
                if(!alphabet.includes("undefined"))
                  transitionInfo = transitionInfo.filter((token:string) => token != "undefined");


                let next;
                if(transitionInfo.length > 1)
                  next = `${targetState}, ${transitionInfo.slice(1).join(", ")}`;
                else
                  next = targetState;
                
                newTransitions[originState][readSymbol] = { ...newTransitions[originState][readSymbol], next: next };

              }
        
              onChangeInputs(inputValues, inputTokenizedValues, newTransitions);
              input.remove();
            }
          };
        });
        


    // Habilita a edição de texto ao clicar duas vezes sobre nodo
    paper.on('element:pointerdblclick', (cellView, event, x, y) => {

      if(containerRef.current === null)
        return;

      document.querySelectorAll('.node-button').forEach(btn => btn.remove());

      const cell = cellView.model;

      const currentText = cell.attr('label/text');
      const originalText = currentText;

      const bbox = cellView.getBBox();

      // Cria um elemento input para edição
      const input = document.createElement('input');
      input.value = currentText;
      input.style.position = 'absolute';
      input.style.left = `${bbox.x}px`;
      input.style.top = `${bbox.y}px`;
      input.style.fontSize = '12px';
      input.style.padding = '2px';
      input.style.zIndex = '1000';
      input.style.background = '#fff';
      input.style.border = '1px solid #ccc';
      input.style.borderRadius = '4px';
      input.style.width = `${bbox.width}px`;
      input.style.height = `${bbox.height}px`;

      containerRef.current.appendChild(input);

      input.focus(); // Permite edição imediata

      // Lida com cliques dados enquanto o texto está sendo editado
      const handleClick = (event: any) => {
        // Se o clique for no input, não faz nada
        if (event.target === input) return;
        // Se o clique for no diagrama, salva o texto
        saveText();
        document.removeEventListener('mousedown', handleClick);
                  
      };

      document.addEventListener('mousedown', handleClick);


      // Lida com teclas pressionadas enquanto o texto está sendo editado
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key == 'Escape') saveText();
      });
    

      const saveText = () => {
        if (input) {

          cell.attr('label/text', input.value); 

          document.removeEventListener('mousedown', handleClick);
          if(currentCellView.current)
            currentCellView.current = null;
          

          let newStatesTokenized;
          let newFinalStatesTokenized = inputTokenizedValues.finalStates;
          let newInitState = inputTokenizedValues.initState;

          if(input.value == ''){
            newStatesTokenized = states.filter((s) => (s != originalText));
            newFinalStatesTokenized = newFinalStatesTokenized.filter((s) => (s != originalText));
            newInitState = newInitState.filter((s) => (s != originalText));
          }
          else{
            if(inputTokenizedValues.finalStates.includes(originalText))
              newFinalStatesTokenized = newFinalStatesTokenized.map((s) => (s === originalText ? input.value : s));

            if(inputTokenizedValues.initState.includes(originalText))
              newInitState = newInitState.map((s) => (s === originalText ? input.value : s));

            newStatesTokenized = states.map((s) => (s === originalText ? input.value : s));
          }
            
            
          onChangeInputs({...inputValues, states: newStatesTokenized.join(", "), finalStates:newFinalStatesTokenized.join(", "), initState: newInitState.join(", ")}, 
            {...inputTokenizedValues, states: newStatesTokenized, finalStates:newFinalStatesTokenized, initState:newInitState}, 
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
              const newTransitions = transitions;
              newTransitions[originState][readSymbol] = {next: "", error: 0};
              onChangeInputs(inputValues, inputTokenizedValues, {...transitions, [originState]: {...transitions[originState], [readSymbol]: { next: "", error: 0 } } });
            }
            else{ // Muito menos isso, mas por enquanto deixa aí
              alert("Erro: Símbolo lido não existe no alfabeto");
              onChangeInputs(inputValues, inputTokenizedValues, transitions);
            }
          
          }
        }

    } 


    paper.translate(translation.x, translation.y);

    console.log("Terminou o desenho");
    
    return () => {
      document.removeEventListener("keydown", deleteNode);
     // document.removeEventListener("keydown", deleteLink);
      document.removeEventListener("mousemove", handleMouseMove);

      if(movingLink){
        movingLink.model.attr('line/stroke', 'black');
        movingLink = null;
      }
    };
    }, [inputTokenizedValues, transitions, currentTool, currentScale]); 
  



    return (
        <GraphConteiner ref={containerRef}></GraphConteiner>
    );
  }
  

export default SimpleDiagram;
