import styled from "styled-components";
import { Link } from "react-router-dom";

export const Button = styled.button`
    color: #343239;
    font-weight:bolder;
    font-size: 1vw;
    background-color: #DD5B6C; 


    font-family: 'Poppins';
    border:none;
    border-radius: 4px;
    width: 15vw;
    height: 4.5vh;

    display: flex;
    justify-content: center;
    align-items: center;

    
    transition: background-color 0.2s ease, transform 0.2s ease;

    &:hover {
    background-color: #C14C5F; 
    transform: scale(1.03); 
    cursor: pointer; 
  }

`;

export const StyledLink = styled(Link)`
  text-decoration: none;
}
`;