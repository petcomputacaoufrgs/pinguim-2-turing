import styled from "styled-components";

export const Div = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    
    height: 4.5vh;
`;

export const Text = styled.p`
    color: #343239;
    font-size: 0.8vw;
`;

export const Input = styled.input`
    border: none;
    border-radius: 5px;
    height: 3vh;
    width: 15vw;

    &:focus{
        outline: none;
    }
`;
