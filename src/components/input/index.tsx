import React, { useEffect, useState } from 'react';
import {Div, Input, Text} from "./styled.ts"

interface i_input{
    title:string
}

const Inputs:React.FC<i_input>=({title})=>{
    return(
        <Div>
            <Text>{title}</Text>
            <Input type='text'/>
        </Div>
    )
}

export default Inputs;