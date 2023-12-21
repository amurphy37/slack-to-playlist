import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./home"

export default function Routing () {
    return (
        <BrowserRouter>
            <Routes>
                <Route exact path="/" element={<Home />} />
            </Routes>
        </BrowserRouter>
    )
}