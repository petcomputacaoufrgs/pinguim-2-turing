import React, { useState } from "react";
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Home from "./controller/home/"
import Computing from "./controller/computing/"
import StateDiagram from "./components/StateDiagram/new_index";

import { StateProvider } from "./ContextProvider";


export default function Routess(){






    return(
        <BrowserRouter>

        <StateProvider>
            <Routes>                
                <Route path="/" element={<Home />}/>
                <Route path = "/computing" element={<Computing/>}/>
            </Routes>
        </StateProvider>

        </BrowserRouter> 
     )
 }