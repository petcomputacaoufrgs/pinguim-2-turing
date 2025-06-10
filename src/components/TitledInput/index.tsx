import React, { ChangeEvent } from 'react';
import {InputDiv, Input, InputDescription} from "./styled.ts"

interface InputProps{
    title:string; // título exibido ao lado do input
    name:string; // nome do input para identificá-lo
    value:string; // valor do input
    height: string; // altura da div que contém o input. O input tem 2/3 da altura da div
    onChange: (e: ChangeEvent<HTMLInputElement>) => void; // função que será chamada quando o input for alterado
}

const TitledInput:React.FC<InputProps>=({title, name, value, height, onChange})=>{


    return(
        <InputDiv $height={height}>
            <InputDescription>{title}</InputDescription>
            <Input name={name} type='text' value={value} onChange={onChange}/>
        </InputDiv>
    )
}

export default TitledInput;




