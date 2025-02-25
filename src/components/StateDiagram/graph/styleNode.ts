/*import * as joint from 'jointjs';

const createLink = (    
    transitionInfo,                 
    transitionError,
    symbol,  
    sourceNode, 
    targetNode,
    paper  
) => {


    const targetNodePosition = paper.model.getCell(targetNode).position();
    const sourceNodePosition = paper.model.getCell(sourceNode).position();
    const center = {
      x: (targetNodePosition.x + sourceNodePosition.x) / 2,
      y: (targetNodePosition.y + sourceNodePosition.y) / 2,
    };
    

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




  const firstPart =
  transitionInfo[1] || transitionInfo[2]
    ? "," +
      (transitionInfo[1] ? transitionInfo[1] : "") +
      (transitionInfo[2] ? `,${transitionInfo[2]}` : "")
    : "";

const secondPart =
  transitionInfo.length > 3 ? `,${transitionInfo.slice(3).join(",")}` : "";

const newText = symbol + firstPart + secondPart;

  // Adiciona uma caixa de texto ao link exatamente na metade do caminho dele

  // const newLink = createLink(sourceNode, targetNode, center);
  // newLink.appendLabel(createLinkLabel(transitionInfo, transition.error));


  linkData.appendLabel({
    position: { distance: 0.5, offset: -15 }, // distance 0.5 - metade do caminho, com um pequeno offset para não deixar o texto completamente em cima do link quando ele estiver na horizontal
    attrs: {
      text: { 
        text: newText, 
        fontSize: 12, 
        fontWeight: "bold" 
      },
      rect: {
        fill: transition.error == 0 ? '#fff' : "#ffe6e6", 
        stroke: transition.error == 0 ? '#000' : "red", 
        strokeWidth: 1,
        refWidth: '120%',
        refHeight: '120%',
        refX: '-10%',
        refY: '-10%',
      }
    }
  });

  return linkData;
  
}

export default createLink;*/