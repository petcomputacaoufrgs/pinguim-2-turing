import React from "react";
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Home from "./controller/home/"
import Computing from "./controller/computing/"


import { StateProvider } from "./StateContext";


export default function Routess(){
    return(
        <BrowserRouter>

        <StateProvider>
            <Routes>
                <Route path = "/" element={<Home/>}/>
                <Route path = "/computing" element={<Computing/>}/>
            </Routes>
        </StateProvider>

        </BrowserRouter> 
     )
 }