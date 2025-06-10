import styled from "styled-components";

export const Div = styled.div<{$height: string}>`
    label{
        color: #343239;
        font-weight:bolder;
        font-size: max(0.8vw, 10px);
        background-color: #DD5B6C;
        
        border-radius: 4px;
        width: max(14vw, 85px);
        height: ${props => props.$height || '4.5vh'};

        display: flex;
        justify-content: center;
        align-items: center;


        transition: background-color 0.2s ease, transform 0.2s ease;

        &:hover {
        background-color: #FF7C89; 
        transform: scale(1.03); 
        cursor: pointer; 
  }
    }
`;