import React, { useEffect, useState } from 'react';
import {Button} from "./styled.ts"

interface i_button{
    title:string
}

const Buttons:React.FC<i_button>=({title})=>{
    return(
        <Button>{title}</Button>
    )
}

export default Buttons;