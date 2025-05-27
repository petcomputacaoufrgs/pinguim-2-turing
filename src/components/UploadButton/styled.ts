import styled from "styled-components";

export const Div = styled.div`
    label{
        color: #343239;
        font-weight:bolder;
        font-size: max(0.8vw, 10px);
        background-color: #DD5B6C;
        
        border-radius: 4px;
        width: max(14vw, 60px);
        height: 4.5vh;

        display: flex;
        justify-content: center;
        align-items: center;

        margin-right: 1vw;
        margin-bottom: 1vh;

        transition: background-color 0.2s ease, transform 0.2s ease;

        &:hover {
        background-color: #FF7C89; 
        transform: scale(1.03); 
        cursor: pointer; 
  }
    }
`;