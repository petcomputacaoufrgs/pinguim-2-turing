import React, { useEffect, useState } from 'react';
import "./style.css"

interface i_input{
    titulo:string
}

const Inputs:React.FC<i_input>=({titulo})=>{


    return(
        <div id="component_input">
            <text>{titulo}</text>
            <input type='text'/>
        </div>
    )
}
export default Inputs