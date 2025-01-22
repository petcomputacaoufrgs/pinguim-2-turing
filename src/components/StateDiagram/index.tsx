import React, { useState, useEffect, useRef } from "react";
import * as go from "gojs";
import { text } from "stream/consumers";
import { Transitions, InputValues, TokenizedInputValues, InputErrors } from '../../types/types';



interface i_simple_diagram {
  inputValues: InputValues;
  inputTokenizedValues : TokenizedInputValues;
  onChangeInputs: (inputs: InputValues, inputs_tokenized: TokenizedInputValues, new_transitions: Transitions) => void;

  transitions: Transitions;
}


export function SimpleDiagram({inputValues, inputTokenizedValues, onChangeInputs, transitions} : i_simple_diagram) {
  const diagramRef = useRef<HTMLDivElement | null>(null);
  const states = inputTokenizedValues.states;

  const [nodePositions, setNodePositions] = useState<{ x: number; y: number }[]>([{ x: 0, y: 0}]); // Para salvar as posições dos nós


    // Função para lidar com a movimentação do nó e salvar a posição
    function handleNodeMove(thisPart: go.Part, newLoc: go.Point, snappedLoc: go.Point): go.Point {
        console.log("Movendo nó");
        const node = thisPart;
        if (node instanceof go.Node) {
          const newPosition = { x: newLoc.x, y: newLoc.y };
          setNodePositions([...nodePositions, newPosition]);
        }
        return newLoc;
      }


  // Atualiza o diagrama quando as strings mudam
  // useEffect é um hook que executa uma função no início e sempre que uma variável definida no array de dependências (segundo argumento) muda
  // Neste caso, a função é executada no início e sempre que a variável strings muda
  useEffect(() => {
    const $ = go.GraphObject.make;

    if (diagramRef.current === null) return;

    // Cria o diagrama GoJS
    const diagram = $(go.Diagram, diagramRef.current, {
      "undoManager.isEnabled": true, // Permite desfazer ações
      'toolManager.mouseWheelBehavior': go.WheelMode.Zoom, // Permite dar zoom com a roda do mouse
      'clickCreatingTool.archetypeNodeData': {text : `new node ${states.length}`}, 
      "clickCreatingTool.insertPart": (loc: go.Point) => {

        setNodePositions([...nodePositions, { x: loc.x, y: loc.y}]); // O ponto onde o nodo é criado se trada do ponto superior esquerdo.

        

        console.log(loc);
        // Atualiza o estado localStrings com o novo nó
        const newNodeKey = `new node ${states.length}`
        const newStatesTokenized = [...states, newNodeKey]
        const newStates = `${inputValues.states}, ${newNodeKey}`;

        onChangeInputs({...inputValues, states: newStates}, {...inputTokenizedValues, states: newStatesTokenized}, transitions); 
      }

    });// Cria um novo nó ao clicar

    

    // Define o template dos nós
    diagram.nodeTemplate = $(
      go.Node,
      "Auto", // Disposição do nó
      $(
        go.Shape,
        "RoundedRectangle", // Forma do nó
        { fill: "lightblue", stroke: "black" , strokeWidth: 1.5, portId: '',
          fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
          toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true, cursor: "pointer"}
      ),
      $(
        go.TextBlock,
        { margin: 20, editable: true },
        new go.Binding("text", "text") // Define o texto
      ),
      {
        dragComputation: handleNodeMove // Função para lidar com a movimentação do nó
      },
      new go.Binding("location", "location", go.Point.parse).makeTwoWay(go.Point.stringify)

      ); // Define a localização


    // replace the default Link template in the linkTemplateMap
    diagram.linkTemplate = $(go.Link,
    {
      // shadow options are for the label, not the link itself
      isShadowed: true,
      shadowBlur: 0,
      shadowColor: 'black',
      shadowOffset: new go.Point(2.5, 2.5),

      curve: go.Curve.Bezier,
      curviness: 40,
      adjusting: go.LinkAdjusting.Stretch,
      reshapable: true,
      relinkableFrom: true,
      relinkableTo: true,
      fromShortLength: 8,
      toShortLength: 10
    },
    new go.Binding('points').makeTwoWay(),
    new go.Binding("curviness"),
    // Forma principal do link
    $(go.Shape, 
      { strokeWidth: 2, shadowVisible: false, stroke: 'black' },
      new go.Binding("strokeDashArray", "progress", (progress) => (progress ? [] : [5, 6])),
      new go.Binding("opacity", "progress", (progress) => (progress ? 1 : 0.5))
    ),
    // Arrowhead de origem
    $(go.Shape, 
      { fromArrow: "circle", strokeWidth: 1.5, fill: "white" },
      new go.Binding("opacity", "progress", (progress) => (progress ? 1 : 0.5))
    ),
    // Arrowhead de destino
    $(go.Shape, 
      { toArrow: "standard", stroke: null, scale: 1.5, fill: "black" },
      new go.Binding("opacity", "progress", (progress) => (progress ? 1 : 0.5))
    ),
    // Rótulo do link
    $(go.Panel, "Auto",
      $(go.Shape, "RoundedRectangle", 
        { shadowVisible: true, fill: "#faeb98", strokeWidth: 0.5 }
      ),
      $(go.TextBlock, 
        {
          font: "9pt helvetica, arial, sans-serif",
          margin: 1,
          editable: true,
          text: "Read, Direction (R/L), Write"
        },
        new go.Binding("text").makeTwoWay() // Vincula o texto do rótulo ao modelo
      )
    )
  );

  // Listener para capturar mudanças de texto nos nodos
  diagram.addDiagramListener("TextEdited", (e) => {

    const newPart = e.subject.part;

    // Se estiver editando um nodo, atualiza o nome dele nas posições e atualiza os nomes dos estados
    if(newPart instanceof go.Node){
      const newString = e.subject.text;
      const previousString = e.parameter;
  
      const newStatesTokenized = states.map((s) => (s === previousString ? newString : s));
      const newStates = newStatesTokenized.join(',');

      onChangeInputs({...inputValues, states: newStates}, {...inputTokenizedValues, states: newStatesTokenized}, transitions); 
    }

    // Se estiver editando um link, atualiza na tabela

    
  });

    console.log(states);
    console.log(nodePositions);

    const nodes = (states || ["a", "b"]).map((string: string, index: number) => {
  

        if (index >= nodePositions.length) {
          const newPosition = {x: 0, y : 0};
          setNodePositions([...nodePositions, newPosition]);
          return { key: string, text: string, location: `${newPosition}` }
        }

        const position = nodePositions[index];
        return { key: string, text: string, location: `${position.x} ${position.y}` };
      });


    diagram.model = new go.GraphLinksModel(nodes, []);





    // Cleanup ao desmontar o componente (ocorre quando o componenete ou seu pai é removido da árvore de componentes, ou quando o componente é atualizado)
    return () => {
      diagram.div = null; // Remove o diagrama da div
    };
  }, [inputTokenizedValues]);



  

  return (
      <div
        ref={diagramRef}
        style={{ border: "1px solid black" }}
      ></div>
  );
}

export default SimpleDiagram;
