import styled from "styled-components";
import { Link } from "react-router-dom";

export const Button = styled.button<{disabled : boolean}>`
    color: #343239;
    font-weight:bolder;
    font-size: 16px;
    background-color: #DD5B6C; 


    font-family: 'Poppins';
    border:none;
    border-radius: 4px;
    width: 14vw;
    height: 4.5vh;

    display: flex;
    justify-content: center;
    align-items: center;

    
    transition: background-color 0.2s ease, transform 0.2s ease;

    ${props => props.disabled ?
    `
        background-color: #B0B0B0; 
        color: #7D7D7D;   
        transform: none; 
    ` 
      :

    `&:hover {
        background-color: #FF7C89; 
        transform: scale(1.03); 
        cursor: pointer; 
      } 
    `
    }


`;

export const StyledLink = styled(Link)`
  text-decoration: none;
}
`;