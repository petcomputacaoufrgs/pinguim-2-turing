import styled from "styled-components";

export const Container = styled.div<{$expand: string}>`
  display: flex;
  flex-direction: column;
  min-height: ${({ $expand }) => ($expand !== 'none' ? '140vh' : '100vh')};
  min-width: 350px;
`;

export const ContainerBody = styled.div<{$expand: string}>`
  flex-grow: 1;
  background-color: #E4DADF;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 1vh;
  color: #343239;
  padding: 9px 3vw;

  &.expand-diagram,
  &.expand-table,
  &.standard {
    // classes mantidas para compatibilidade, caso queira usar lógica de ordenação com elas
  }

  #div1, #div2, #div3, #div4, #div5 {
    box-sizing: border-box;
  }

  #upper_div {
    display: flex;
    width: 100%;
    gap: 10px;
    min-height: max(37vh, 240px);

    @media (max-width: 768px) {
      flex-direction: column;
    
    }
  }

  #div1 {
    display: flex;
    width: 65%;
    gap: 10px;
    min-height: max(37vh, 240px);
    max-height: max(37vh, 240px);
    
    #div1_doc {
      display: flex;
      width: 100%;
    }
    
    #div1_inputs {
    }

    @media (max-width: 768px) {
      width: 100%;
    }
  }

  #div4 {
    display: flex;
    flex-direction: column;
    width: 35%;
    margin: auto 0;

    p {
      font-size: max(0.8vw, 10px); 
    }
    
    @media (max-width: 768px) {
      flex-direction: row;
      width: 100%;
      justify-content: flex-start;
      flex-wrap: wrap;
      column-gap: 3.3vw;

      p {
        width: 30%;
      }
    }

    @media (max-width: 680px) {
      p {
        font-size: 8px;
      }
    }

  }

  #div2 {
    width: 48%;
    display: flex;
    flex-direction: column;
    flex-grow: 1;

    p {
      font-weight: bold;
      font-size: 1.5rem;
      margin-bottom: 0.2vh;
      margin-top: 0;
    }

    #div2_table {
      width: 100%;
      background-color: #FFF;
      margin-bottom: 1vh;
      flex-grow: 1;
      overflow-x: auto;
    }


  }

  #div3 {
    display: flex;
    width: 48%;
    flex-direction: column;
    flex-grow: 1;
    
    p {
      font-weight: bold;
      font-size: 1.5rem;
      margin-bottom: 0.2vh;
      margin-top: 0;
    }

  }

  #div5 {
    width: 100%;
    margin-left: 0;
  }
`;
