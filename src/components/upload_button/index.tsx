import React, { useEffect, useState } from 'react';
import {Div} from "./styled.ts"

export default function Upload_button(){

    return(
        <Div>
             <input type="file" id="botaoCarregar" hidden/>
             <label htmlFor="botaoCarregar">Carregar</label>
        </Div>
    )
}