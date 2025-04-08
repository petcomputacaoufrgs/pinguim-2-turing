import * as joint from 'jointjs';
import { CurrentTool, TokenizedInputValues, Transitions } from '../../../types/types';
import { getElementText, getLinkText } from './getNodeData';
import { tokenize } from '../../../utils/tokenize';
import { createLink } from './styleNode';
 

 /**
   * Cria e posiciona os nós do grafo representando os estados.
   * 
   * @param {string[]} states - Lista de estados.
   * @returns {Map<string, any>} - Mapa associando os nomes dos estados ao nodo no grafo
   */
  export const getNodes = (states:string[], 
                       tokenizedInputs: TokenizedInputValues, 
                       nodePositions: React.MutableRefObject<Map<string, {x: number; y: number;}>>, 
                       prevNodesMap: Map<string, any>,
                       prevSelectedCells: any,
                       newSelectedCells: any ) => 
  {

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
        if (nodePositions.current.has(state)) {
            const position = nodePositions.current.get(state);
            if(position)
              node.position(position.x, position.y);

        // Do contrário tem que definir alguma posição. Futuramente mudar forma como posição está sendo definida
        } else {
            const position = { x: spacing + index * (nodeWidth + spacing), y: 100 };
            node.position(position.x, position.y);
            nodePositions.current.set(state, position);
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
            const nodeName = getElementText(cell);
            nodePositions.current.set(nodeName, {x: newPosition.x, y: newPosition.y});
        });

        nodesMap.set(state, node);

        if(prevSelectedCells && prevSelectedCells.includes(prevNodesMap.get(state)))
          newSelectedCells.push(node);
        
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

  /**
   * Toma as transições da máquina e as adiciona ao grafo para serem representadas graficamente.
   * @param tokenizedInputs - Valores tokenizados da entrada, incluindo símbolos iniciais e do alfabeto.
   * @param transitions - Objeto contendo as transições da máquina de Turing.
   * @param nodes - Mapa do nome dos estados para o id deles no grafo
   * @returns Um Map que mapeia estados de destino, símbolos de leitura e escrita, respectivamente, para o link correspondente.
   */
  export const getAndDrawTransitions = (
    states: string[],
    alphabet: string[],
    transitions: Transitions,
    nodes: Map<string, any>,
    paper: joint.dia.Paper,
    currentLinks: Map<string, Map<string, Map<string, joint.shapes.standard.Link>>>,
    notYetDefinedLinks: React.MutableRefObject<Map<string, joint.shapes.standard.Link>>,
    prevSelectedCells: any,
    newSelectedCells: any
  ) => {

    // Atualiza o state que contém os links
    const links = new Map<string, Map<string, Map<string, joint.shapes.standard.Link>>>();
    const targetsMap = new Map<string, joint.shapes.standard.Link[]>();

    const newNotYetDefinedLinks = new Map<string, joint.shapes.standard.Link>();

    // Vai passando por cada transição
    for (const state of states) {
      for (const symbol of alphabet) {
        if (!transitions[state]) continue;
        const transition = transitions[state][symbol];
        if (!transition || transition.transitionText === "") continue;

        // E tomando as informações da transição
        const transitionInfo = tokenize(transition.transitionText);


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
          const newLink = createLink(transitionInfo, transition.error, symbol, sourceNode, targetNode, paper, existingLink);

          if(prevSelectedCells && prevSelectedCells.includes(existingLink)){
            newSelectedCells.push(newLink);
          }

          newLink.addTo(paper.model);
          addLink(links, transitionInfo[0], state, symbol, newLink);
          continue;
        }
      
        const newLink = createLink(transitionInfo, transition.error, symbol, sourceNode, targetNode, paper);
        newLink.addTo(paper.model);
        addLink(links, transitionInfo[0], state, symbol, newLink);
          
      }
    }

    // Desenha os links ainda não definidos
    notYetDefinedLinks.current.forEach((link) => {
      const source = getElementText(link.getSourceElement()!);
      const target = getElementText(link.getTargetElement()!);

      const sourceNode = nodes.get(source);
      const targetNode = nodes.get(target);

      if (sourceNode && targetNode) {
        const newLink = createLink([], 1, "", sourceNode, targetNode, paper, link);

        paper.model.addCell(newLink);

        newNotYetDefinedLinks.delete(link.id.toString());
        newNotYetDefinedLinks.set(newLink.id.toString(), newLink);

      }
    })

    // Atualiza os links ainda não definidos
    notYetDefinedLinks.current = newNotYetDefinedLinks;

    return links;
  }
