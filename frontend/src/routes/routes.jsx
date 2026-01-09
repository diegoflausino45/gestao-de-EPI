import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import Styles from "./styles.module.css"

import Home from "../containers/Home"
import Funcionarios from "../containers/Funcionarios"
import EPI from "../containers/EPIs"
import Entregas from "../containers/Entregas"
import Devolucao from "../containers/Devolucao"
import Relatorios from "../containers/Relatorios"
import Usuarios from "../containers/Usuarios"
import Configuracoes from "../containers/Configuracoes"
import CadastroEPI from "../containers/CadastroEPI"
import Login from "../containers/Login"
import NotFound from "../containers/NotFound"
import Setores from "../containers/Setores"
import Perfil from "../containers/Perfil"

import Header from "../components/Header"
import SideBar from "../components/SideBar"
import Breadcrumb from "../components/Breadcrumb"
import ScrollToTop from "../components/ScrollToTop"

import { AuthProvider, useAuth } from "../context/AuthContext"

// Componente de Layout Protegido (Com Sidebar e Header)
function PrivateLayout() {
    const { signed, loading } = useAuth();

    if (loading) {
        return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Carregando...</div>;
    }

    // Se não estiver logado, manda pro login
    if (!signed) {
        return <Navigate to="/login" />;
    }

    return (
        <>
            <Header />
            <div className={Styles.contenteside}>
                <ScrollToTop />
                <SideBar />
                <Breadcrumb />
                <div className={Styles.content}>
                    <Outlet /> {/* Aqui renderiza os filhos (Home, Funcionarios...) */}
                </div>
            </div>
        </>
    );
}

// Componente para rotas públicas (Redireciona para home se já estiver logado)
function PublicRoute({ children }) {
    const { signed, loading } = useAuth();

    if (loading) return null;

    if (signed) {
        return <Navigate to="/" />;
    }

    return children;
}

function AppRouter() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Rotas Públicas */}
                    <Route path="/login" element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } />

                    {/* Rotas Privadas (Protegidas pelo PrivateLayout) */}
                    <Route element={<PrivateLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/funcionarios" element={<Funcionarios />} />
                        <Route path="/epis" element={<EPI />} />
                        <Route path="/entregas" element={<Entregas />} />
                        <Route path="/configuracoes/devolucao" element={<Devolucao />} />
                        <Route path="/relatorios" element={<Relatorios />} />
                        <Route path="/configuracoes/usuarios" element={<Usuarios />} />
                        <Route path="/configuracoes/setores" element={<Setores />} />
                        <Route path="/configuracoes" element={<Configuracoes />} />
                        <Route path="/cadastro-epi" element={<CadastroEPI />} />
                        <Route path="/perfil" element={<Perfil />}/>
                    </Route>

                    {/* Rota 404 fica fora para aparecer em qualquer caso ou pode ter layout próprio */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default AppRouter
