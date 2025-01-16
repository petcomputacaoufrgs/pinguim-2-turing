import styled from "styled-components";

export const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const ContainerBody = styled.div`
  height: 100vh;

  overflow: auto;

  background-color: #E4DADF;

  display: grid;
    grid-template-columns: 55% auto;
    grid-template-rows: 40% auto;
    grid-template-areas:
        'div1 div4'
        'div2 div3'
        'div5 div5';

    color: #343239;


    #div1 {
      display: grid;


      grid-area: div1;

      grid-template-columns: 55% auto;
      padding-left: 3vw;
      padding-top: 1vh;


      #div1_doc{

        display: flex;
        width: 100%;

      }
    }

    #div2 {
      grid-area: div2;
      padding-left: 3vw;
      p{
        font-weight: bold;
        font-size: 1.5vw;
        margin-bottom: 0.2vh;
      }

      div{
        width: 100%;
        height: auto;
        min-height: 66%;
        background-color: #FFF;
        margin-bottom: 1vh;
        overflow: auto;
      }

      button{
        width: 100%;
      }
    }

    #div3 {
      grid-area: div3;
      display: flex;
      flex-direction: column;
      align-items: center;
  

      p{
        font-weight: bold;
        font-size: 1.5vw;
        margin-bottom: 0.2vh;
      }

      div{
        width: 80%;
        height: 75%;
        background-color: #FFF;
      }
    }

    #div4 {

      grid-area: div4;
      padding-left: 3vw;
      margin: auto;
    }

    
    #div5 {
      grid-area: div5;
      margin: auto;
    }
`;