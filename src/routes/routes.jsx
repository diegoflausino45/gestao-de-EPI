import { BrowserRouter, Routes, Route } from "react-router-dom"


import Home from "../containers/Home"
import NotFound from "../containers/NotFound"
import Header from "../components/Header"
import SideBar from "../components/SideBar"

function AppRouter() {
    return (
        
        <BrowserRouter>
        <Header/>
        <SideBar/>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<NotFound/>} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter