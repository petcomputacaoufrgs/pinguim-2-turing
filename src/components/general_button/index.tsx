import React, { useEffect, useState } from 'react';
import {Button, StyledLink} from "./styled.ts"

import styled from "styled-components";

interface i_button{
    title:string
    to?: string
    disabled?: boolean;
}

const Buttons:React.FC<i_button>=({title, to, disabled = false})=>{
    return(
        
        to ?
        (<StyledLink to={to}>
            <Button disabled={disabled}>{title}</Button>
        </StyledLink>)

        : (<Button disabled={disabled}>{title}</Button>)
    )
}

export default Buttons;