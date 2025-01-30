import React, { useState, useEffect, useRef } from "react";
import * as go from "gojs";
import { text } from "stream/consumers";
import { Transitions, InputValues, TokenizedInputValues, InputErrors } from '../../types/types';
import { transpileModule } from "typescript";



interface i_simple_diagram {
  inputValues: InputValues;
  inputTokenizedValues : TokenizedInputValues;
  onChangeInputs: (inputs: InputValues, inputs_tokenized: TokenizedInputValues, new_transitions: Transitions) => void;

  transitions: Transitions;
}


export function SimpleDiagram({inputValues, inputTokenizedValues, onChangeInputs, transitions} : i_simple_diagram) {
  const diagramRef = useRef<HTMLDivElement | null>(null);
  const states = inputTokenizedValues.states;

  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map([["q0", {x: 0, y: 0}]])); // Para salvar as posições dos nós


    // Função para lidar com a movimentação do nó e salvar a posição
    function handleNodeMove(thisPart: go.Part, newLoc: go.Point, snappedLoc: go.Point): go.Point {
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
      'clickCreatingTool.archetypeNodeData': {text : `q${states.length}`}, 
      "clickCreatingTool.insertPart": (loc: go.Point) => {

        setNodePositions((prevPositions) => {
          // Insere nova posição
          const updatedPositions = new Map(prevPositions);
          updatedPositions.set(`q${states.length}`, { x: loc.x, y: loc.y });
          return updatedPositions;
        }); // O ponto onde o nodo é criado se trada do ponto superior esquerdo.

        

        // Atualiza o estado localStrings com o novo nó
        const newNodeKey = `q${states.length}`
        const newStatesTokenized = [...states, newNodeKey]
        const newStates = `${inputValues.states}, ${newNodeKey}`;

        onChangeInputs({...inputValues, states: newStates}, {...inputTokenizedValues, states: newStatesTokenized}, transitions); 
      }

    });// Cria um novo nó ao clicar



    // Eu não sei o que está acontecendo aqui. Isso é um código pego diretamente da documentação da GoJS: https://gojs.net/latest/intro/shapes.html
    

    go.Shape.defineFigureGenerator('FramedRectangle', (shape, w, h) => { // shape - objeto que conterá os parâmetros definidos. Os dois parâmetros definidos: w - largura, h - altura
      let param1 = shape ? shape.parameter1 : NaN;
      let param2 = shape ? shape.parameter2 : NaN;
      

      if (isNaN(param1))
          param1 = 8; // default values PARAMETER 1 is for WIDTH
      if (isNaN(param2))
          param2 = 8; // default values PARAMETER 2 is for HEIGHT


      let cornerRadius = param2 / 3;

      const geo = new go.Geometry(); // Cria um objeto que armazenará a geometria da forma.

      const fig = new go.PathFigure(cornerRadius, 0, true); // Cria uma figura iniciando um caminho a partir do ponto (0, 0) e define que esse caminho será fechado (true), formando uma forma completa.

      geo.add(fig); // Adiciona a figura à geometria (forma final)



      fig.add(new go.PathSegment(go.SegmentType.Line, w - cornerRadius, 0)); // linha reta do topo (0, 0) -> (w - cornerRadius, 0)

      fig.add(new go.PathSegment(go.SegmentType.Arc, 270, 90, w - cornerRadius, cornerRadius, cornerRadius, cornerRadius)); 
      // 270º: rotação feita a partir de onde a linha estava apontando
      // 90º: desenha um arco de 90º
      // w - cornerRadius, cornerRadius: coordenadas do centro da circunferência (w - cornerRadius, cornerRadius)
      // cornerRadius, cornerRadius: raio horizontal, raio vertical. Como os dois são iguais, temos um arco de circunferência
      
      fig.add(new go.PathSegment(go.SegmentType.Line, w, h - cornerRadius)); // linha reta à direita
      fig.add(new go.PathSegment(go.SegmentType.Arc, 0, 90, w - cornerRadius, h - cornerRadius, cornerRadius, cornerRadius)); // canto inferior direito
      fig.add(new go.PathSegment(go.SegmentType.Line, cornerRadius, h)); // linha reta na parte inferior
      fig.add(new go.PathSegment(go.SegmentType.Arc, 90, 90, cornerRadius, h - cornerRadius, cornerRadius, cornerRadius)); // canto inferior esquerdo
      fig.add(new go.PathSegment(go.SegmentType.Line, 0, cornerRadius)); // linha reta à esquerda
      fig.add(new go.PathSegment(go.SegmentType.Arc, 180, 90, cornerRadius, cornerRadius, cornerRadius, cornerRadius)); // canto superior esquerdo



      /*
      // Cria o retângulo externo. Ele tem linhas que vão de: (0, 0) -> (w, 0) -> (w, h) -> (0, h) -> (0, 0)
      fig.add(new go.PathSegment(go.SegmentType.Line, w, 0));
      fig.add(new go.PathSegment(go.SegmentType.Line, w, h));
      fig.add(new go.PathSegment(go.SegmentType.Line, 0, h).close()); // .close() fecha a figura, voltando ao (0, 0) definido em go.PathFigure

      */


      if (param1 < w / 2 && param2 < h / 2) {

          const innerGeo = new go.Geometry();
          const innerFig = new go.PathFigure(param1, param2, true);
          geo.add(innerFig);

          // Cria o retângulo interno
          innerFig.add(new go.PathSegment(go.SegmentType.Move, param1, param2)); // Move o caminho para o ponto (param1, param2) sem desenhar uma linha.
          innerFig.add(new go.PathSegment(go.SegmentType.Line, param1, h - param2));
          innerFig.add(new go.PathSegment(go.SegmentType.Line, w - param1, h - param2));
          innerFig.add(new go.PathSegment(go.SegmentType.Line, w - param1, param2).close());
      }

      
      geo.setSpots(0, 0, 1, 1, param1, param2, -param1, -param2); // Define "spots" para o posicionamento de objetos dentro de uma forma retangular. 
      // Os quatro primeiros parâmetros definem os pontos entre os quais os objetos serão posicionados. Eles são relativos a figura, indo de (0, 0) - canto superior esquerdo
      // a (1, 1) - canto inferior direito. Basicamente, passando 0, 0, 1, 1; definimos que objetos posicinoado podem estar em toda a área retangular do começo ao fim da imagem
      // o restamte são offsets em relação aos pontos definidos nos primeiros quatro parâmetros. Como está, estamos definindo que os objetos devem ser posicionados no interior do retângulo interno
      return geo;
    });
    

    // Define o template dos nós
    diagram.nodeTemplate = $(
      go.Node,
      "Auto",
  
      $(
        go.Shape,
        "RoundedRectangle", // Forma do nó
        { stroke: "black" , strokeWidth: 2, portId: '', 
          fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
          toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true, cursor: "pointer"},

          new go.Binding("fill", "type", (type) => (type == "start")? "#98FF98" : ((type == "final-start")? "#98FF98" : "lightblue")),
          new go.Binding("figure", "type", (type) => (type == "final")? "FramedRectangle" : ((type == "final-start")? "FramedRectangle" : "RoundedRectangle"))
      ),

      $(
        go.TextBlock,
        { margin: 20, editable: true, font: "bold 12pt sans-serif" },
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
      toShortLength: 10,
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


  go.Shape.defineFigureGenerator('Flag', (shape, w, h) => {
    const geo = new go.Geometry();
    const fig = new go.PathFigure(0, 0.1 * h, true);
    geo.add(fig);
    fig.add(new go.PathSegment(go.SegmentType.Line, 0, h));
    fig.add(new go.PathSegment(go.SegmentType.Move, 0, 0.1 * h));
    fig.add(new go.PathSegment(go.SegmentType.Bezier, 0.5 * w, 0.1 * h, 0.15 * w, 0, 0.35 * w, 0));
    fig.add(new go.PathSegment(go.SegmentType.Bezier, w, 0.1 * h, 0.65 * w, 0.2 * h, 0.85 * w, 0.2 * h));
    fig.add(new go.PathSegment(go.SegmentType.Line, w, 0.5 * h));
    fig.add(new go.PathSegment(go.SegmentType.Bezier, 0.5 * w, 0.5 * h, 0.85 * w, 0.6 * h, 0.65 * w, 0.6 * h));
    fig.add(new go.PathSegment(go.SegmentType.Bezier, 0, 0.5 * h, 0.35 * w, 0.4 * h, 0.15 * w, 0.4 * h).close());
    return geo;
});


  function changeNodeType(e: any, obj : any){
    const node = obj.part.adornedPart;
    const nodeData = node.data;

    let newFinalStates : string[];

    if(nodeData.type == "start" || nodeData.type == "standard"){
      if(inputTokenizedValues.finalStates.length == 1 && inputTokenizedValues.finalStates[0] == "") 
        newFinalStates = [nodeData.key];
      else
        newFinalStates = [...inputTokenizedValues.finalStates, nodeData.key];
    }
    
    else
      newFinalStates = inputTokenizedValues.finalStates.filter((state) => state != nodeData.key);
    

    onChangeInputs({...inputValues, finalStates: newFinalStates.join(", ")}, {...inputTokenizedValues, finalStates: newFinalStates}, transitions);

  }
    // unlike the normal selection Adornment, this one includes a Button
    diagram.nodeTemplate.selectionAdornmentTemplate = new go.Adornment('Spot')
      .add(
        new go.Panel('Auto')
          .add(
            new go.Shape('RoundedRectangle', { fill: null, stroke: "#facbcb", strokeWidth: 3 }),
            new go.Placeholder() // a Placeholder sizes itself to the selected Node
          ),

        // the button to create a "next" node, at the top-right corner
        go.GraphObject.build('Button', {
          alignment: go.Spot.TopRight,
          click: changeNodeType // this function is defined below
        })
          .add(
            new go.Shape('Flag', { width: 6, height: 6 })
          ) // end button
      );

  // Listener para capturar mudanças de texto nos nodos
  diagram.addDiagramListener("TextEdited", (e) => {

    const newPart = e.subject.part;

    // Se estiver editando um nodo, atualiza o nome dele nas posições e atualiza os nomes dos estados
    if(newPart instanceof go.Node){
      const newString = e.subject.text;
      const previousString = e.parameter;
  
      const newStatesTokenized = states.map((s) => (s === previousString ? newString : s));
      const newStates = newStatesTokenized.join(", ");

      onChangeInputs({...inputValues, states: newStates}, {...inputTokenizedValues, states: newStatesTokenized}, transitions); 
    }

    if(newPart instanceof go.Link){
      const linkData = newPart.data;
      linkData.altered = true;

      const alphabet = Array.from(new Set([inputTokenizedValues.initSymbol[0], ...inputTokenizedValues.inAlphabet.filter((symbol) => symbol != "").concat(inputTokenizedValues.auxAlphabet.filter((symbol) => symbol != "")), inputTokenizedValues.blankSymbol[0]]));

      const previousText = e.parameter;
      const previousTransition = previousText.split(",").map((token: string) => token.trim()).filter((token : string) => token.length > 0);

      const newTransitions = {...transitions};

      if(newTransitions[linkData.from] === undefined){
        newTransitions[linkData.from] = {};
      }

      if(alphabet.includes(previousTransition[0] && newTransitions[linkData.from][previousTransition[0]] !== undefined))
        newTransitions[linkData.from][previousTransition[0]].next = "";
      
  
      const text = linkData.text;
      if(text === undefined || text == "")
        return;

      let newTransition = text.split(",").map((token: string) => token.trim()).filter((token : string) => token.length > 0);

      

      if(!alphabet.includes(newTransition[0])){
        return;
      }

      

      const prevTransitionFromTable = newTransitions[linkData.from][newTransition[0]];

      if(prevTransitionFromTable !== undefined && prevTransitionFromTable.next !== ""){
        alert(`Não determinismo não é permitido. Uma trnasição do estado ${linkData.from} com o símbolo ${newTransition[0]} já existe. Ela será substituída pela nova transição`);
      }


      
      newTransitions[linkData.from][newTransition[0]] = {next: `${linkData.to}, ${newTransition[1]}, ${newTransition[2]}`, error: 0};
      


      onChangeInputs(inputValues, inputTokenizedValues, newTransitions);
    }
  });




  diagram.addDiagramListener("SelectionDeleted", (e) => {
    let remainingStates: string[] = states; 
    const remainingTransitions = transitions;



    e.subject.each((part: any) => {

      if (part instanceof go.Node) {

        remainingStates = remainingStates.filter((state) => state != part.data.text);
        delete remainingTransitions[part.data.text];

      }

      if (part instanceof go.Link){
        const linkText : string = part.data.text;

        if(linkText !== undefined){
          const symbol = linkText.split(',').map(token => token.trim()).filter(token => token.length > 0)[0]; 


          const transitionsFromState = remainingTransitions[part.data.from];

          if(transitionsFromState !== undefined){
              transitionsFromState[symbol].next = "";
              transitionsFromState[symbol].error = 0;
          }
      }
    }});



    onChangeInputs({...inputValues, states: remainingStates.join(", ")}, {...inputTokenizedValues, states: remainingStates}, remainingTransitions);

  })


  function calculateNewPosition(positions: {x: number, y: number}[]){
    const maxX = positions.reduce((max, pos) => Math.max(max, pos.x), 0);
    const minY = positions.reduce((min, pos) => Math.min(min, pos.y), 0);
    const maxY = positions.reduce((max, pos) => Math.max(max, pos.y), 0);
    const centerY = (minY + maxY) / 2;

    return {x: maxX + 100, y: centerY};
  }


  function getNodeType(state: string, inputTokenizedValues: TokenizedInputValues){
    const final = inputTokenizedValues.finalStates.includes(state);
    const start = state == inputTokenizedValues.initState[0];

    if(final && start)
      return "final-start"

    if(final)
      return "final";

    if(start)
      return "start";

    return "standard";

  }

    const nodes = (states).map((string: string) => {
  
    const position = nodePositions.get(string) || calculateNewPosition(Array.from(nodePositions.values()));
    
    if(!Array.from(nodePositions.keys()).includes(string)){


      setNodePositions((prevPositions) => {
      // Insere nova posição
      const updatedPositions = new Map(prevPositions);
      updatedPositions.set(string, position);
      return updatedPositions;
      }); 
    }

    
    
    return { key: string, text: string, location: `${position.x} ${position.y}`, type: getNodeType(string, inputTokenizedValues)};

    });


    function getTransitions(inputTokenizedValues: TokenizedInputValues, transitions: Transitions){
      const links = [];
      const initial_symbol = inputTokenizedValues.initSymbol[0];
      const blankSymbol = inputTokenizedValues.blankSymbol[0];

      const alphabet = Array.from(new Set([initial_symbol, ...(inputTokenizedValues.inAlphabet.filter((symbol) => symbol != "").concat(inputTokenizedValues.auxAlphabet.filter((symbol) => symbol != ""))), blankSymbol]));
      
        for (const state of states) {
          for (const symbol of alphabet){
          
            if(transitions[state] === undefined)
              continue;

            const transition = transitions[state][symbol];

            if(transition === undefined)
              continue;

    
            if(transition.next == "")
              continue;

            const transitionInfo = transition.next.split(',').map(token => token.trim()).filter(token => token.length > 0);

            const linkData = {
              from: state,
              to: transitionInfo[0],
              text: `${symbol}, ${transitionInfo[1]}, ${transitionInfo[2]}`,
              altered: false
            }
            
            links.push(linkData);

          }   
      }

      return links;
    }


/* AGRUPANDO TRANSIÇÕES POR ESTADO DE DESTINO (substituir isso na função getTransitions se for necessário)

              if (!transitionMap.has(targetState)) {
                transitionMap.set(targetState, new Map<string, Map<String, string[]>>());
              }
              
              let transitionsToState = transitionMap.get(targetState);

              if (!transitionsToState?.has(writeSymbol)) {
                transitionsToState?.set(writeSymbol, new Map<String, string[]>());
              }

              let transitionsToStateWithSymbol = transitionsToState?.get(writeSymbol);

              if(!transitionsToStateWithSymbol?.has(direction)){
                transitionsToStateWithSymbol?.set(direction, []);
              }

              transitionsToStateWithSymbol?.get(direction)?.push(symbol);

            }

            for (const [targetState, transitionsToState] of Array.from(transitionMap.entries())) {
              for (const [writeSymbol, transitionsWithSymbol] of Array.from(transitionsToState.entries())) {
                for (const [direction, symbols] of Array.from(transitionsWithSymbol.entries())) {

                  const linkData = {
                    from: state,
                    to: targetState,
                    text: `[${transitionsWithSymbol.get(direction)}], ${direction}, ${writeSymbol}`
                  }

                  links.push(linkData);

                }
              }
            }
          }   */


      console.log(nodes);
      console.log(getTransitions(inputTokenizedValues, transitions))
      diagram.model = new go.GraphLinksModel(nodes, getTransitions(inputTokenizedValues, transitions));

    // Cleanup ao desmontar o componente (ocorre quando o componenete ou seu pai é removido da árvore de componentes, ou quando o componente é atualizado)
    return () => {
      diagram.div = null; // Remove o diagrama da div
    };
  }, [inputTokenizedValues, transitions]);



  

  return (
      <div
        ref={diagramRef}
        style={{ border: "1px solid black" }}
      ></div>
  );
}

export default SimpleDiagram;
