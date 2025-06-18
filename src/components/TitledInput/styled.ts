import styled from "styled-components";

export const InputDiv = styled.div<{$height: string}>`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 5px;
    height: ${props => props.$height || '4.5vh'};
`;

export const InputDescription = styled.p`
    color: #343239;
    font-size: max(0.8vw, 10px);
    font-weight: bold;

    @media (max-width: 680px) {
        font-size: 8px;
    }
`;

export const Input = styled.input`
    border: none;
    border-radius: 5px;
    height: 66%; /* 2/3 da altura da div */
    width: max(18vw, 120px);

    font-size: max(0.8vw, 14px);
    
    &:focus{
        outline: none;
    }
`;
