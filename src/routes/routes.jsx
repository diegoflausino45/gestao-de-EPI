import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "../containers/Home"
import NotFound from "../containers/NotFound"

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<NotFound/>} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter