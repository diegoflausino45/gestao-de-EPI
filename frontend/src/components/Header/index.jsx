import Styles from "./styles.module.css"
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Header() {
    const { user } = useAuth();

    // Pega apenas o primeiro nome
    const primeiroNome = user?.nome ? user.nome.split(' ')[0] : "Usuário";
    
    // Pega a inicial para o avatar
    const inicial = user?.nome ? user.nome.charAt(0) : null;

    return (
        <div className={Styles.header}>
            {/* Espaço vazio para manter o flex-between jogando o user para a direita */}
            <div></div> 
            
            <Link to={'/perfil'} className={Styles.user} title="Ir para meu Perfil">
                <span>{primeiroNome}</span>
                
                {inicial ? (
                    <div className={Styles.avatarCircle}>
                        {inicial}
                    </div>
                ) : (
                    <FaUserCircle />
                )}
            </Link>
        </div>
    )
}

export default Header;