import styled from "styled-components"

// transient props (prefixo $)

// props com o prefixo $ são filtradas e não chegam no DOM. Assim o React não "vê" a prop, do contrário ele veria a prop e daria um warning dizendo que ela não é conhecida
// porque ela não é uma propriedade padrão de um elemento input

export const StyledInput = styled("input")<{$hasError: boolean}>`
    border: 1px solid ${({ $hasError }) => ($hasError ? 'red' : 'black')};
    background-color: ${({ $hasError }) => ($hasError ? '#ffe6e6' : 'white')};
    color: ${({ $hasError }) => ($hasError ? 'darkred' : 'black')};
    padding: 8px;
    border-radius: 4px;
    font-size: 0.8vw;

    text-align: center; 

    width: 6vw;

    &:focus {
      outline: none;
      border-color: ${({ $hasError }) => ($hasError ? 'darkred' : 'blue')};
    }

    &::placeholder {
      font-size: 0.5vw;
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

