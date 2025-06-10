import styled from "styled-components"


export const ErrorText = styled.p`
    color: #DD5B6C;
    font-size: max(0.8vw, 10px);
    width: 25%;
    text-align: center;
    font-weight: bold;

    @media (max-width: 768px) {
        width: 33%;
    }

    @media (max-width: 680px) {
        font-size: 8px;
    }
`

export const ErrorsContainer = styled.div`
    background-color: transparent;;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
`