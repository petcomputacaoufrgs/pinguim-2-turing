import React, { useEffect, useState } from 'react';
import {Div, Input, Text} from "./styled.ts"

interface i_input{
    titulo:string
}

const Inputs:React.FC<i_input>=({titulo})=>{
    return(
        <Div>
            <Text>{titulo}</Text>
            <Input type='text'/>
        </Div>
    )
}

export default Inputs