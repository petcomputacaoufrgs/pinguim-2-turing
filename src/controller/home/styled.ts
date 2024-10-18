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
        'div1 div4'
        'div2 div3';

    color: #343239;

    #div1 {
      grid-area: div1;

      padding-left: 3vw;
      padding-top: 1vh;

      #div1_buttons{
        display: flex;
      }
      
      #div1_part2{
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        height: 87%; 

        #div1_part2_inputs{
          width: 82%;
        }
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
        height: 65%;
        overflow: auto;
        background-color: #FFF;
        margin-bottom: 1vh;
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
      justify-content: end;
      margin-bottom: 5vh;

      p{
        font-weight: bold;
        font-size: 4vh;
        margin-bottom: 0.2vh;
        margin-top: 5vh;
      }

      div{
        width: 80%;
        height: 82%;
        overflow: auto;
        background-color: #FFF;
      }
    }

    #div4 {

      grid-area: div4;
      padding-left: 3vw;
      margin: auto;
      p{



      
      }
    
    
    }
`;