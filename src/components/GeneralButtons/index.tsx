import React, { useEffect, useState } from 'react';
import {Button, StyledLink} from "./styled.ts"

import styled from "styled-components";

interface i_button{
    title:string;
    to?: string;
    disabled?: boolean;
    width: string;
    height: string;
}

const GeneralButtons:React.FC<i_button>=({title, to, disabled = false, width, height})=>{
    return(
        
        to ?
        (<StyledLink to={to}>
            <Button width={width} height={height} disabled={disabled}>{title}</Button>
        </StyledLink>)

        : (<Button width={width} height={height} disabled={disabled}>{title}</Button>)
    )
}

export default GeneralButtons;