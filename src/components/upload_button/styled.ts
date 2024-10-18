import styled from "styled-components";

export const Div = styled.div`
    label{
        color: #343239;
        font-weight:bolder;
        font-size: 1vw;
        background-color: #DD5B6C;
        
        border-radius: 4px;
        width: 15vw;
        height: 4.5vh;

        display: flex;
        justify-content: center;
        align-items: center;

        margin-right: 1vw;
        margin-bottom: 1vh;

        transition: background-color 0.2s ease, transform 0.2s ease;

        &:hover {
        background-color: #C14C5F; 
        transform: scale(1.03); 
        cursor: pointer; 
  }
    }
`;