import styled from "styled-components";


export const GraphConteiner = styled.div`
  .joint-paper-background, .joint-paper-grid{
    position: absolute; /* Elementos internos empilhados na mesma posição */
    width: 100%;
    height: 100%;
  }

  .joint-paper-background {
    z-index: 1; /* Fundo do Paper */
  }

  .joint-paper-grid {
    z-index: 2; /* Grade */
  }

  svg{
    position: absolute;
    z-index: 3; /* Desenho */
    width: 100%;
    height: 100%;
  }

`;




