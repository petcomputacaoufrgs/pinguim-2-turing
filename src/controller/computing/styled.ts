import styled from "styled-components";

export const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const ContainerBody = styled.div`
  height: 100vh;
  background-color: #E4DADF;

  display: grid;
    grid-template-columns: 55% auto;
    grid-template-rows: 40% auto;
    grid-template-areas:
        'div1 div3'
        'div2 div3';

    color: #343239;

    #div1 {
      grid-area: div2;
      padding-left: 3vw;
      
    }

    #div2 {
      grid-area: div1;
      padding-left: 3vw;
      padding-top: 1vh;

      button{
        width: 35%;
      }

      p{
        font-weight: bold;
        font-size: 4vh;
        margin-bottom: 0.2vh;
        margin-top: 0.2vh;
      }

      div{
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: #FFF;
      }
    }

    #div3 {
      grid-area: div3;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      margin-bottom: 5vh;

      p{
        font-weight: bold;
        font-size: 4vh;
        margin-bottom: 0.4vh;
        margin-top: 5vh;
      }

      div{
        width: 80%;
        height: 100%;
        overflow: auto;
        background-color: #FFF;
      }
    }
`;