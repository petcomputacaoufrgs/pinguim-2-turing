import React from "react";
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Home from "./controller/home/"
import Computing from "./controller/computing/"
export default function Routess(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path = "/" element={<Home/>}/>
                <Route path = "/computing" element={<Computing/>}/>
            </Routes>
        </BrowserRouter> 
     )
 }