import React, { ChangeEventHandler, useEffect, useState } from 'react';
import {Container} from "./styled.ts"


interface DocumentationProps{
    value:string;
    onChange: ChangeEventHandler<HTMLTextAreaElement>;
}

export default function Documentation({value, onChange} : DocumentationProps){

    

    return(
        <Container>
            <p>Documentação: </p>
            <textarea value={value} onChange={onChange}/>
        </Container>
    )
}