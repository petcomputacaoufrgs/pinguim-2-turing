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
    font-size: 0.8vw;
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
