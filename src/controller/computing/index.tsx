import React, { useEffect, useState } from 'react';
import init, { add } from "turing-wasm";
import "../../components/cabecalho"

import './style.css';
import Cabecalho from '../../components/cabecalho';

export function Computing(){
    return(
    <div className="App">
      <Cabecalho/>
      <body className='corpo'>
        
      </body>
    </div>
    );
}
export default Computing;
