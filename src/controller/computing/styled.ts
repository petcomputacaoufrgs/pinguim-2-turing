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
    grid-template-rows: 60% auto;
    grid-template-areas:
        'div1 div3'
        'div2 div3';

    color: #343239;

    #div1 {
      grid-area: div2;
      padding-left: 3vw;
      margin-bottom: 5vh;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;

      p{
        font-weight: bold;
        font-size: 4vh;
        margin: 0;
      }

      input{
        border: none;
        border-radius: 5px;
        height: 3vh;
        width: 35%;
        margin-left: 1vw;

        &:focus{
            outline: none;
        }
      }

      background-color: blue;

    }

    #div2 {
      grid-area: div1;
      padding-left: 3vw;
      padding-top: 1vh;

      button{
        width: 35%;
        
        &:hover {
          color: #DD5B6C;
        }  
      }

      p{
        font-weight: bold;
        font-size: 4vh;
        margin: 0;
      }

      div{
        display: flex;
        align-items: flex-end;
        width: 100%;
        height: 80%;
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


export const Div11 = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 20%;
`;

export const Div12 = styled.div`
  background-color: aqua;
  width: 100%;
  height: 30%;
  margin-top: 2vh;
  margin-bottom: 1vh;
`;

export const Div13 = styled.div`
  background-color: yellow;
  width: 100%;
  height: 15%;
  margin-bottom: 1vh;
`;

export const Div14 = styled.div`
  background-color: red;
  width: 100%;
  height: 12%;
`;