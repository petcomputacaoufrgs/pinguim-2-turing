import styled from "styled-components";

export const InputDiv = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    
    height: 4.5vh;
`;

export const InputDescription = styled.p`
    color: #343239;
    font-size: max(0.8vw, 10px);
    font-weight: bold;
`;

export const Input = styled.input`
    border: none;
    border-radius: 5px;
    height: 3vh;
    width: 18vw;

    &:focus{
        outline: none;
    }
`;
