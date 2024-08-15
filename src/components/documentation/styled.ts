import styled from "styled-components";

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    margin-left: 2vw;
    width: 50%;

    textarea{
        width: 100%;
        height: 100%;
        border: none;
        outline: none;
    }

    p{
        font-weight: bold;
        margin: 0;
    }
`;