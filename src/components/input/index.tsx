import React, { ChangeEvent, useEffect, useState } from 'react';
import {Div, Input, Text} from "./styled.ts"

interface i_input{
    title:string;
    name:string;
    value:string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Inputs:React.FC<i_input>=({title, name, value, onChange})=>{

    return(
        <Div>
            <Text>{title}</Text>
            <Input name={name} type='text' value={value} onChange={onChange}/>
        </Div>
    )
}

export default Inputs;