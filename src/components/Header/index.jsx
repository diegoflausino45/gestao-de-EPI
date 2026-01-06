import Styles from "./styles.module.css"
import { FaUserCircle } from "react-icons/fa";

function Header() {

    return (
        <div className={Styles.header}>
            <h4>Sistema de Gestão de EPI's</h4>
            <div className={Styles.user}>
                <span>Diego Flausino</span>
                <FaUserCircle />
            </div>
        </div>
    )
}

export default Header;