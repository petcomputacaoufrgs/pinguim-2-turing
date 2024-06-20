import styled from "styled-components";

export const Div = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 1.5vh;
`;


export const Text = styled.text`
    color: #343239;
`;

export const Input = styled.input`
    border: none;
    border-radius: 5px;
    width: 16vw;

    &:focus{
        outline: none;
    }
`;
