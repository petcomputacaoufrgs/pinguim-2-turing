import React, { useEffect, useState } from 'react';
import {Button, StyledLink} from "./styled.ts"

import styled from "styled-components";

interface i_button{
    title:string
    to?: string
}

const Buttons:React.FC<i_button>=({title, to})=>{
    return(
        
        to ?
        (<StyledLink to={to}>
            <Button>{title}</Button>
        </StyledLink>)

        : (<Button>{title}</Button>)
    )
}

export default Buttons;