import React, { ChangeEvent } from 'react';
import {InputDiv, Input, InputDescription} from "./styled.ts"

interface InputProps{
    title:string; // título exibido ao lado do input
    name:string; // nome do input para identificá-lo
    value:string; // valor do input
    onChange: (e: ChangeEvent<HTMLInputElement>) => void; // função que será chamada quando o input for alterado
}

const TitledInput:React.FC<InputProps>=({title, name, value, onChange})=>{
    return(
        <InputDiv>
            <InputDescription>{title}</InputDescription>
            <Input name={name} type='text' value={value} onChange={onChange}/>
        </InputDiv>
    )
}

export default TitledInput;




