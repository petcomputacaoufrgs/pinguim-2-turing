import React, { useEffect, useState } from 'react';
import {Button, StyledLink} from "./styled.ts"

import styled from "styled-components";

interface i_button{
    title:string;
    to?: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    width: string;
    height: string;
}

const GeneralButtons:React.FC<i_button>=({title, to, onClick, disabled = false, width, height})=>{
    return(
        
        to ?
        (<StyledLink to={to}>
            <Button onClick={onClick} width={width} height={height} disabled={disabled}>{title}</Button>
        </StyledLink>)

        : (<Button onClick={onClick} width={width} height={height} disabled={disabled}>{title}</Button>)
    )
}

export default GeneralButtons;