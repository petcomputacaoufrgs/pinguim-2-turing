// linkCreation.ts

import * as joint from 'jointjs';

export function initLinkCreation(paper : joint.dia.Paper, graph : any, movingLink : any, notYetDefinedLinks : any) {
  let targetNode: any = null;
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

  const handleMouseUpNewLink = () => {
    if (movingLink.current) {
      if (targetNode) {
        movingLink.current.model.set('target', { id: targetNode.id });
        targetNode.attr('body/stroke', 'black');
        movingLink.current.model.attr('line/stroke', 'black');

        if (notYetDefinedLinks.current) {
          notYetDefinedLinks.current.set(
            movingLink.current.model.id,
            movingLink.current.model as joint.shapes.standard.Link
          );
        }

        targetNode = null;
      } else {
        movingLink.current.model.remove();
      }

      movingLink.current = null;
    }

    paper.setInteractivity(() => true);

    document.removeEventListener('mousemove', handleMouseMoveLink);
    document.removeEventListener('mouseup', handleMouseUpNewLink);
  };

  const handleNodeClick = (nodeView: joint.dia.ElementView, evt: any) => {
    evt.stopPropagation();
    evt.preventDefault();

    const sourceNode = nodeView.model;
    const initTarget = paper.clientToLocalPoint(evt.clientX, evt.clientY);

    targetNode = sourceNode;
    sourceNode.attr('body/stroke', '#00A8FF');

    const tempLink = new joint.shapes.standard.Link({
      source: { id: sourceNode.id },
      target: { x: initTarget.x, y: initTarget.y },
      attrs: { line: { stroke: 'blue', strokeWidth: 2 } },
    });

    tempLink.appendLabel({
      position: { distance: 0.5, offset: -15 },
      attrs: {
        text: {
          text: 'undefined',
          fontSize: 12,
          fontWeight: 'bold',
        },
        rect: {
          fill: '#ffe6e6',
          stroke: 'red',
          strokeWidth: 1,
          refWidth: '120%',
          refHeight: '120%',
          refX: '-10%',
          refY: '-10%',
        },
      },
    });

    graph.addCell(tempLink);
    movingLink.current = { model: tempLink };

    paper.setInteractivity((cellView: { model: any }) => {
      if (cellView.model === sourceNode) {
        return { elementMove: false };
      }
      return true;
    });

    document.addEventListener('mousemove', handleMouseMoveLink);
    document.addEventListener('mouseup', handleMouseUpNewLink);
  };

  const handleMoveOnCell = (evt: any) => {
    if (evt.target.tagName != 'path') return;

    const cellRect = evt.target.getBoundingClientRect();
    const x = evt.clientX;
    const y = evt.clientY;
    const borderWidth = 5;

    if (
      x < cellRect.x + borderWidth ||
      x > cellRect.x + cellRect.width - borderWidth ||
      y < cellRect.y + borderWidth ||
      y > cellRect.y + cellRect.height - borderWidth
    ) {
      evt.target.style.cursor = 'pointer';
      createLink = true;
    } else {
      evt.target.style.cursor = 'default';
      createLink = false;
    }
  };

  paper.on('element:pointerdown', (nodeView, evt) => {
    evt.preventDefault();
    if (createLink) handleNodeClick(nodeView, evt);
  });

  paper.on('cell:mouseenter', (cellView, evt) => {
    if (!cellView.model.isLink()) {
      document.addEventListener('mousemove', handleMoveOnCell);
    }
  });

  paper.on('cell:mouseleave', () => {
    document.removeEventListener('mousemove', handleMoveOnCell);
  });
}
