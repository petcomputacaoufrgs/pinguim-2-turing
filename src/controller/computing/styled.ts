import styled from "styled-components";

export const Container = styled.div<{$expand: string}>`
  display: flex;
  flex-direction: column;
  min-height: max(100vh, 555px);
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


  #div2, #div3 {
    box-sizing: border-box;
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
      height: 100%;
      overflow: auto;
    }

    #div2_inputs {
      height: 40%;
      display: flex;
      flex-direction: column;
      gap: 10px;
    
    }


  }

    #div_inputs {
      display: flex;
      flex-direction: column;
      gap: 10px;
    
    }

  #div3 {
    display: flex;
    width: 40%;
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


export const Div11 = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;

  input {
    border: none;
    border-radius: 5px;
    height: 66%;
    width: max(18vw, 120px);

    &:focus{
        outline: none;
    }
  
  }
`;

export const Div12 = styled.div`
  background-color: white;
  width: 100%;
  height: 75%;
  overflow: auto;
  overflow-y: hidden;


  p{
    font-size: 12px;
    font-family: monospace;
  }
`;

export const Div13 = styled.div`
  width: 100%;
  height: 25%;
  display: flex;
  align-items: center;
`;

export const Div14 = styled.div`
  background-color: transparent;
  width: 100%;
  height: 10%;
  display: flex;
  align-items: center;
`;


export const Div2p = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 5px;
`;
