import React, { ChangeEventHandler, useEffect, useState } from 'react';
import {Container} from "./styled.ts"


interface i_documentation{
    value:string;
    onChange: ChangeEventHandler<HTMLTextAreaElement>;
}

export default function Documentation({value, onChange} : i_documentation){

    

    return(
        <Container>
            <p>Documentação: </p>
            <textarea value={value} onChange={onChange}/>
        </Container>
    )
}