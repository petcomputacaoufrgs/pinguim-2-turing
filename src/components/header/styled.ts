import styled from "styled-components";

export const AppHeader = styled.header`
    background-color: #4D4C52;
    height: 9vh;

    display:flex;
    flex-direction:row;
    align-items:center;
    justify-content: space-between;

    color: #FBF9FB;
    text-overflow: ellipsis;
`;

export const Logo = styled.img`
    max-height: 9vh;
    max-width: 7vw;
    padding-left: 3vw;
`;

export const Title = styled.p`
    color: #FBF9FB;
    font-size: 3vw;
    font-weight:bold;
    padding-right: 13vw;
`;

export const Links = styled.div`
    display:flex;
    flex-direction:row;
    justify-content: space-between;
    padding-right: 3vw;
`;

export const Link = styled.a` 
    color: #FBF9FB;
    font-size: 1.5vw;
    margin: 1vw;
    text-decoration: none;

    &:hover {
        color: #DD5B6C;
    }    
`;

