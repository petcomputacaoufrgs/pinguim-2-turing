import React, { useState, useEffect, useRef } from "react";
import * as joint from 'jointjs';
import { Transitions, InputValues, TokenizedInputValues, InputErrors } from '../../types/types';
import { GraphConteiner } from "./styled";


/*
TO DO: 

- Aba de ferramentas?
- Arrumar atribuição de nome para os estados ao serem criados com o clique duplo: no momento não funciona porque o nome é sempre q{qtd de estados}, mas como há
deleção de estados isso pode bugar
- Rever toda a questão de seleção de nodos
- Permitir que links sejam adicionados  
- Rever forma como a edição de vértices e a mudança de alvo de uma aresta está sendo tratada. No momento, as duas se sobrepõem
- Arrumar bug em que quando o link é redirecionado para o próprio nodo fonte formando um loop ele fica estranho (adicionar vértices nessa condição)
- Permitir edição do texto de um link. Não permitir mudança de posição do texto do link. Sugestões: ou sempre deixar o texto no meio do link sem curvá-lo ou excluir o texto quando for para editá-lo
- Permitir seleção de estados finais e inicial no próprio grafo
- Atualizar mensagens de erro quando fizer edições diretamente no grafo
- Não determinismo!

- Modo de tela cheia para grafo e tabela???
*/


interface i_simple_diagram {
  inputValues: InputValues;
  inputTokenizedValues : TokenizedInputValues;
  onChangeInputs: (inputs: InputValues, inputs_tokenized: TokenizedInputValues, new_transitions: Transitions) => void;

  transitions: Transitions;
}

export function SimpleDiagram({ inputValues, inputTokenizedValues, onChangeInputs, transitions }: i_simple_diagram) {

    const containerRef = useRef<HTMLDivElement | null>(null);

    // Guarda todos os links que já foram desenhados. É um map cujas chaves são, respectivamente, um estado alvo, um estado origem e o símbolo de leitura, e o valor é o link
    const [currentLinks, setLinks] = useState<Map<string, Map<string, Map<string, joint.shapes.standard.Link>>>>(new Map())

    // Salva as posições dos nós. É um map dos nomes dos estados para suas posições
    const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map([["q0", {x: 20, y: 100}]])); 

    const [currentScale, setCurrentScale] = useState(1); // Estado para controle da escala
    

    const states = inputTokenizedValues.states;
  
    useEffect(() => {

        if(containerRef.current === null){
            return;
        }

        containerRef.current.style.setProperty('width', '100%');
        containerRef.current.style.setProperty('height', '100%');
        containerRef.current.style.setProperty('position', 'relative');
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
          interactive: { useLinkTools: false }
          
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
    const alphabet = Array.from(
      new Set([
        initialSymbol,
        ...inputTokenizedValues.inAlphabet.filter((symbol) => symbol !== ""),
        ...inputTokenizedValues.auxAlphabet.filter((symbol) => symbol !== ""),
        blankSymbol,
      ])
    );

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
              labels: [
                {
                  position: { distance: 0.5, offset: -15 },
                  attrs: {
                    text: { text: `${symbol}, ${transitionInfo[1]}, ${transitionInfo[2]}`, fontSize: 12, fontWeight: "bold" },
                  },
                },
              ],
              attrs: existingLink.get("attrs"),
            });

            newLink.addTo(graph);
            addLink(links, transitionInfo[0], state, symbol, newLink);
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
          labels: [
            {
              position: { distance: 0.5, offset: -15 },
              attrs: {
                text: { text: `${symbol}, ${transitionInfo[1]}, ${transitionInfo[2]}`, fontSize: 12, fontWeight: "bold" },
              },
            },
          ],
        });

        linkData.addTo(graph);
        addLink(links, transitionInfo[0], state, symbol, linkData);
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
    const verticesTool = new joint.linkTools.Vertices(); // Permite a adição e edição de vértices num link
    const toolsView = new joint.dia.ToolsView({ tools: [verticesTool] });
    const linkView = link.findView(paper);
    
    linkView.addTools(toolsView);
    linkView.removeTools();

    // Quando o mouse "entra" no link, se ele estiver entre 20% e 80% da extensão do link (modificar isso depois), permite a edição de vértices
    paper.on("link:mouseenter", (linkView, evt) => {
      const bbox = linkView.findMagnet(evt.target)?.getBoundingClientRect();
      const isTarget = evt.clientX !== undefined && bbox &&
        evt.clientX < bbox.left + bbox.width / 1.25 &&
        evt.clientX > bbox.left + bbox.width / 5;

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
    const scale = paper.scale();
    dragStartPosition = { x: x * scale.sx, y: y * scale.sy }; // Ajuste para o escalonamento
  });
      

  // limpar a posição de arraste quando o mouse for solto
  paper.on("cell:pointerup blank:pointerup", () => {
    dragStartPosition = null;
  });
      
  // Função para mover conteúdo do paper conforme o mouse se move
  const handleMouseMove = (event: MouseEvent) => {
    if (dragStartPosition !== null) {
      const offsetX = event.offsetX;
      const offsetY = event.offsetY;
      
      // Translaciona o conteúdo do paper
      paper.translate(offsetX - dragStartPosition.x, offsetY - dragStartPosition.y);
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
    paper.on('link:pointerdown', (linkView, evt, x, y) => {
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

// ------------------------------------------------------------------------------------

    // Eventos relacionados a nodos

    let currentCellView : any = null; // referência ao nodo selecionado no momento


    // Seleção do nodo ao clicar sobre ele
    paper.on('cell:pointerdown', (cellView, evt, x, y) => {
      if(currentCellView === null)
        currentCellView = cellView;

      
      document.addEventListener('keydown', deleteNode);

      currentCellView.el.style.cursor = 'pointer'; // Mudança de cursor para indicar que pode criar um nodo
      currentCellView.model.attr('body/stroke', 'green');

    })


    // Deleção de um nodo selecionado
    function deleteNode(e:any){

      if(e.key != 'Delete' || !currentCellView)
        return;

      const deletedState = currentCellView.model.attributes.attrs.label.text;

      const newStates = inputTokenizedValues.states.filter((state) => state != deletedState);
      const newFinalStates = inputTokenizedValues.finalStates.filter((state) => state != deletedState);
      const newInitState = inputTokenizedValues.initState.filter((state) => state != deletedState);

      const newTransitions = transitions;
      delete newTransitions[deletedState];

      currentCellView = null;

      onChangeInputs({...inputValues, states: newStates.join(", "), finalStates: newFinalStates.join(", "), initState: newInitState.join(", ")},
        {...inputTokenizedValues, states: newStates, finalStates: newFinalStates, initState: newInitState},
        newTransitions
      )


    }

    // "Desseleção" de um nodo
    paper.on('cell:mouseout', function(cellView, evt){
      if(!currentCellView)
        return;

      
      const bbox = currentCellView.getBBox(); // Pega as coordenadas e o tamanho da célula

      // Distância da borda para considerar 
      const horizontalEdgeThreshold = bbox.width * 0.15; 
      const verticalEdgeThreshold = bbox.height * 0.15;

      const x = evt.clientX;
      const y = evt.clientY;

      if(!x || !y)
        return;

      const mouseX = x - paper.el.getBoundingClientRect().left;
      const mouseY = y - paper.el.getBoundingClientRect().top;

      // Verifica se o mouse está, de fato, fora dos limites do nodo. A necessidade disso se deve ao fato de que o evento 'mouseout' também ativa se o mouse estiver sobre o texto do nodo
      if(mouseX < bbox.x + bbox.width && mouseX > bbox.x && mouseY > bbox.y && mouseY < bbox.y + bbox.height){
        return;
      }

      currentCellView.model.attr('body/stroke', 'black');
      currentCellView = null;
      document.removeEventListener('keydown', deleteNode);

    });

    

    // Adiciona um novo nodo ao clicar duas vezes sobre espaço vazio
    paper.on('blank:pointerdblclick', (evt, x, y) => {
      setNodePositions((prev) => new Map(prev.set(`q${states.length}`, { x: x - 50, y: y - 20})));
      onChangeInputs({...inputValues, states: (states.length > 0)? `${inputValues.states}, q${states.length}` : `q${states.length}`}, {...inputTokenizedValues, states: (states.length > 0)? [...states, `q${states.length}`] : [`q${states.length}`]}, transitions);
    })


    // Habilita a edição de texto ao clicar duas vezes sobre nodo
    paper.on('element:pointerdblclick', (cellView, event, x, y) => {

      if(containerRef.current === null)
        return;

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
          
          const newStatesTokenized = states.map((s) => (s === originalText ? input.value : s));
          const newStates = newStatesTokenized.join(", ");
    
          onChangeInputs({...inputValues, states: newStates}, {...inputTokenizedValues, states: newStatesTokenized}, transitions); 

          input.remove();
        }
      };
    
    });


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

    console.log("Terminou o desenho");

    return () => {
      // Função de cleanup?
    };
    }, [inputTokenizedValues, transitions, currentScale]); 
  


    return (
        <GraphConteiner ref={containerRef}></GraphConteiner>
    );
  }
  

export default SimpleDiagram;
