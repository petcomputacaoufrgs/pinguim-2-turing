import styled from "styled-components";

export const Container = styled.div<{$expand: string}>`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const ContainerBody = styled.div<{$expand: string}>`
  height: ${({ $expand }) => ($expand !== 'none' ? '120vh' : '100vh')};
  overflow: auto;
  background-color: #E4DADF;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 1vh;
  color: #343239;
  padding: 1vh 3vw;

  &.expand-diagram,
  &.expand-table,
  &.standard {
    // classes mantidas para compatibilidade, caso queira usar lógica de ordenação com elas
  }

  #div1, #div2, #div3, #div4, #div5 {
    box-sizing: border-box;
    margin-bottom: 1vh;
  }

  #div1 {
    display: flex;
    width: 55%;
    
    #div1_doc {
      display: flex;
      width: 100%;
    }
  }

  #div4 {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 45%;
    margin: auto 0;
  }

  #div2 {
    width: 48%;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    p {
      font-weight: bold;
      font-size: 2rem;
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
      font-size: 2rem;
      margin-bottom: 0.2vh;
      margin-top: 0;
    }

  }

  #div5 {
    width: 100%;
    margin-left: 0;
  }
`;
