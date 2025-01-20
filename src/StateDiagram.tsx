import React, { useState, useEffect, useRef } from "react";
import * as go from "gojs";
import { text } from "stream/consumers";



interface i_simple_diagram {
    strings: string[];
    onChangeStrings: (strings: string[]) => void;
}


export function SimpleDiagram({strings, onChangeStrings} : i_simple_diagram) {
  const diagramRef = useRef<HTMLDivElement | null>(null);


  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map()); // Para salvar as posições dos nós


    // Função para lidar com a movimentação do nó e salvar a posição
    function handleNodeMove(thisPart: go.Part, newLoc: go.Point, snappedLoc: go.Point): go.Point {
        console.log("Movendo nó");
        const node = thisPart;
        if (node instanceof go.Node) {
          const newPosition = { x: newLoc.x, y: newLoc.y };
          setNodePositions((prevPositions) => {
            const updatedPositions = new Map(prevPositions);
            updatedPositions.set(node.key as string, newPosition); // Atualiza a posição do nó
            return updatedPositions;
          });
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
      'clickCreatingTool.archetypeNodeData': {text : `new node ${strings.length}`}, 
      "clickCreatingTool.insertPart": (loc: go.Point) => {

        setNodePositions((prevPositions) => {
          // Insere nova posição
          const updatedPositions = new Map(prevPositions);
          updatedPositions.set(`new node ${strings.length}`, { x: loc.x, y: loc.y });
          return updatedPositions;
        });

        console.log(loc);
        // Atualiza o estado localStrings com o novo nó
        onChangeStrings([...strings, `new node ${strings.length}`]); // Adiciona o novo nó a localStrings
      }

    });// Cria um novo nó ao clicar

    

    // Define o template dos nós
    diagram.nodeTemplate = $(
      go.Node,
      "Auto", // Disposição do nó
      $(
        go.Shape,
        "RoundedRectangle", // Forma do nó
        { fill: "lightblue", stroke: "black" }
      ),
      $(
        go.TextBlock,
        { margin: 10 },
        new go.Binding("text", "text") // Define o texto
      ),
      {
        dragComputation: handleNodeMove // Função para lidar com a movimentação do nó
      },
      new go.Binding("location", "location", go.Point.parse).makeTwoWay(go.Point.stringify) // Define a localização
    );

    if(strings === undefined) console.log("strings é undefined");
    console.log(strings);



    const nodes = (strings || ["a", "b"]).map((string: string) => {
        const position = nodePositions.get(string) || { x: 0, y: 0 }; // Posição inicial (0, 0) se não houver posição salva
        console.log(position) 
        return { key: string, text: string, location: `${position.x} ${position.y}` };
      });


    diagram.model = new go.GraphLinksModel(nodes, []);





    // Cleanup ao desmontar o componente (ocorre quando o componenete ou seu pai é removido da árvore de componentes, ou quando o componente é atualizado)
    return () => {
      diagram.div = null; // Remove o diagrama da div
    };
  }, [strings]);


  function changeStrings() {
    console.log("Mudando strings");
    if(strings[0] != "a"){
        console.log(strings)
        onChangeStrings(["a", "b"]);
     }
    else
        onChangeStrings(["c", "d"]);
  }

  

  return (
    <div>
      <h1>Diagrama Simples</h1>

      <div
        ref={diagramRef}
        style={{ width: "400px", height: "300px", border: "1px solid black" }}
      ></div>

      <button onClick={changeStrings}>Mude a String</button>

    </div>
  );
}

export default SimpleDiagram;
