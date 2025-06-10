import styled from "styled-components";


export const DivButtons = styled.div`
      grid-area: div1_buttons;
      display: flex;
      width: 100%;
      justify-content: space-between;

      height: max(12%, 29px); /* O tamanho na tela cheia é 4.5vh. Como o tamanho inicial da div maior que contém os botões e os inputs é 37vh, temos 12% de 37vh, que é 4.44vh.
                              /* O tamanho mínimo é 29px, pois o tamanho mínimo da div maior que contém os botões e os inputs é 240px. Mantendo a proporção de 12%, 12% de 240px = 28.8px, arredondado para 29px */

      gap: 10px;
`;

export const DivInputs = styled.div`
      grid-area: div1_part2;
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      height: max(88%, 211px); /* O tamanho na tela cheia é 32.5vh. Como o tamanho inicial da div maior que contém os botões e os inputs é 37vh, temos 88% de 37vh, que é 32.56vh.
                              /* O tamanho mínimo é 211px, pois o tamanho mínimo da div maior que contém os botões e os inputs é 240px. Mantendo a proporção de 88%, 88% de 240px = 211.2px, arredondado para 211px */

      width: 100%;

      #div1_part2_inputs{
          width: 100%;
        }
`;



