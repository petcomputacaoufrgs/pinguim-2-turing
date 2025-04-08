import React, { useState } from "react";
import ReactDOM from 'react-dom/client';
import {HashRouter, Route, Routes} from 'react-router-dom';
import Home from "./controller/home/"
import Computing from "./controller/computing/"

import { StateProvider } from "./ContextProvider";


export default function Routess(){

    return(
        <HashRouter>

        <StateProvider>
            <Routes>                
                <Route path="/" element={<Home />}/>
                <Route path = "/computing" element={<Computing/>}/>
            </Routes>
        </StateProvider>

        </HashRouter> 
     )
 }