import styled from "styled-components"


interface InputProps {
    hasError: boolean;
  }
  
export const StyledInput = styled.input<InputProps>`
    border: 1px solid ${({ hasError }) => (hasError ? 'red' : 'black')};
    background-color: ${({ hasError }) => (hasError ? '#ffe6e6' : 'white')};
    color: ${({ hasError }) => (hasError ? 'red' : 'black')};
    padding: 8px;
    border-radius: 4px;
    font-size: 1rem;
  
    &:focus {
      outline: none;
      border-color: ${({ hasError }) => (hasError ? 'darkred' : 'blue')};
    }
  `;
