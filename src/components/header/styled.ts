import styled from "styled-components";

export const AppHeader = styled.header`
    background-color: #4D4C52;
    height: max(9vh, 60px);

    display:flex;
    flex-direction:row;
    align-items:center;
    justify-content: space-between;

    color: #FBF9FB;
    text-overflow: ellipsis;

`;

export const Logo = styled.img`
    max-height: max(9vh, 60px);
    max-width: 7vw;
    padding-left: 3vw;
`;

export const Title = styled.p`
    color: #FBF9FB;
    font-size: max(3vw, 10px);
    font-weight:bold;
    padding-right: 13vw;

    @media (max-width: 768px) {
        padding-right: 5px;
        text-align: center;
    }
`;

export const Links = styled.div`
    display:flex;
    flex-direction:row;
    justify-content: space-between;
    padding-right: 3vw;
`;

export const Link = styled.a` 
    color: #FBF9FB;
    font-size: max(1.5vw, 6px);
    margin: 1vw;
    text-decoration: none;

    &:hover {
        color: #DD5B6C;
    }    


    @media (max-width: 768px) {
        text-align: center;
    }

`;

