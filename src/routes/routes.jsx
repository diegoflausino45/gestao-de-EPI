import { BrowserRouter, Routes, Route } from "react-router-dom"
import Styles from "./styles.module.css"


import Home from "../containers/Home"
import NotFound from "../containers/NotFound"
import Header from "../components/Header"
import SideBar from "../components/SideBar"

function AppRouter() {
    return (
        
        <BrowserRouter>
       <SideBar/>
        <div className={Styles.contenteside}>
            <Header/>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<NotFound/>} />
            </Routes>
        </div>
        
            
        </BrowserRouter>
    )
}

export default AppRouter