import * as joint from 'jointjs';
import { getElementText, getLinkText } from '../../getNodeData';
import { tokenize } from '../../../../../utils/tokenize';




export function initRedirectLinks(paper : joint.dia.Paper, graph : any, movingLink : any, setLinks: any, handleInputsChange: any, inputs: any, tokenizedInputs: any, transitions: any) {



let targetNode:any = null;  // Referência ao nodo que o link está em cima
let mustMove = false; // Indica se de fato clicamos para mover o link
let initialPosition:any = null; // Guarda a posição inicial caso precise desfazer
let initialVertices: any = null; // Guarda os vértices iniciais, cao precise desfazer
let initialTargetID: any = null; // Guarda o taerget inicial do link caso precise desfazer
let createLink: boolean = false;
    

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
  
          movingLink.current.model.set('target', newPosition);
  
        }
      }


    
    // Finaliza o movimento quando solta o clique do mouse
    const handleMouseUp = (evt : any) => {
      if (movingLink.current) {
    
        if (targetNode) {
          // Havendo um nodo alvo, define ele como target e recalcula os vértices do link
          movingLink.current.model.set('target', { id: targetNode.id });
          targetNode.attr('body/stroke', 'black');

          if(initialTargetID == targetNode.id)
            movingLink.current.model.set('vertices', initialVertices);

          else{
            const newTargetState = getElementText(targetNode as joint.dia.Element);
            const sourceState = getElementText(graph.getCell(movingLink.current.model.attributes.source.id) as joint.dia.Element);
            const transition = getLinkText(movingLink.current.model);
            const readSymbol = tokenize(transition)[0]; // Sempre existirá pois se não existisse o link não estaria nem sendo desenhado

            // setLinks é assíncrono. Ele vai executar depois do desmonte do componente. Nisso o movingLink já vai ter valor null. Aqui guardamos o valor para utilizá-lo depois
            const linkModel = movingLink.current.model;

             // (caso em que precisa de fato recalcular para não sobrepor nada)
            setLinks((prevLinks : Map<string,Map<string,Map<string,joint.shapes.standard.Link>>>) => {
              const newLinks = new Map(prevLinks);

              if (!newLinks.has(newTargetState)) {
                newLinks.set(newTargetState, new Map());
              }

              const targetMap = newLinks.get(newTargetState)!;

              if (!targetMap.has(sourceState)) {
                targetMap.set(sourceState, new Map());
              }

              const sourceMap = targetMap.get(sourceState)!;

              sourceMap.set(readSymbol, linkModel);

              return newLinks;
            })

            const newTransitionTableText = `${newTargetState}, ${tokenize(transition).slice(1).join(", ")}`;


            const newTransitions = {
              ...transitions, 
              [sourceState]: {
                ...transitions[sourceState], 
                [readSymbol]: {
                  transitionText: newTransitionTableText, 
                  nextState: newTargetState, 
                  newSymbol: "", 
                  direction: "", 
                  error: 0
                }
              }
            };

            
            handleInputsChange(inputs, tokenizedInputs, newTransitions);

          } 
          
          
          
        } else {
          // Se não, volta à posição inicial com os vértices iniciais


          movingLink.current.model.set('source', initialPosition.source);
          movingLink.current.model.set('target', initialPosition.target);
          movingLink.current.model.set('vertices', initialVertices);
        }
    
        movingLink.current.model.attr('line/stroke', 'black'); // Retorna a cor do link que estava sendo movido
        movingLink.current = null; 
        targetNode = null;
      }

    
      document.removeEventListener('mousemove', handleMouseMoveLink);
      document.removeEventListener('mouseup', handleMouseUp);
    }










    // Início do movimento quando o mouse clica no link
      paper.on('link:pointerdown', (linkView, evt, x, y) => {
      evt.preventDefault();
    
      initialTargetID = linkView.model.get('target').id;

      movingLink.current = linkView; 
      const movingLinkModel = movingLink.current.model;

      initialPosition = {
        source: movingLinkModel.get('source'),
        target: movingLinkModel.get('target'),
      };

      initialVertices = movingLinkModel.get('vertices');


      // Remove os vértices pra não ficar feio o movimento (teria que guardar eles pra caso não ocorra mudança, retorná-los)
      movingLink.current.model.set('vertices', []);      

      const bbox = linkView.findMagnet(evt.target)?.getBoundingClientRect(); // findMagnte identifica um elemento de conexão do link (magnet), e getBoundingClientRect retorna as coordenadas e extensão desse elemento
      mustMove = evt.clientX !== undefined && bbox !== undefined;
    
      if(!mustMove)
        return;

      movingLink.current.model.attr('line/stroke', 'blue'); // Desta o link que está sendo movido

      document.addEventListener('mousemove', handleMouseMoveLink);
      document.addEventListener('mouseup', handleMouseUp);
    });

}