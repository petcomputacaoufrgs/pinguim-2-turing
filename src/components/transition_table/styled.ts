import styled from "styled-components"


interface InputProps {
    hasError: boolean;
  }
  
export const StyledInput = styled.input<InputProps>`
    border: 1px solid ${({ hasError }) => (hasError ? 'red' : 'black')};
    background-color: ${({ hasError }) => (hasError ? '#ffe6e6' : 'white')};
    color: ${({ hasError }) => (hasError ? 'darkred' : 'black')};
    padding: 8px;
    border-radius: 4px;
    font-size:calc(10px + 0.2vw);

    text-align: center; 

    width: 8vw;

    &:focus {
      outline: none;
      border-color: ${({ hasError }) => (hasError ? 'darkred' : 'blue')};
    }

    &::placeholder {
      font-size: 0.6vw;
  }
  `;


export const StyledTable = styled.table`
  thead th {
    position: sticky;
    top: 0; 
    background-color: #f4f4f4;

    padding: 10px;
    text-align: center;
  }

  tbody td:first-child, 
  thead th:first-child { 
    position: sticky;
    left: 0; 
    background-color: #f4f4f4; 
    z-index: 1; 
  }

  tbody td {
    padding: 10px;
    text-align: center;
  }



  th,
  td {
    border: 1px solid #ddd; 
    font-weight: bold;
  }

`;

