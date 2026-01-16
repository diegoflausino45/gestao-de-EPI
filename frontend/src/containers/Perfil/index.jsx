import { useAuth } from "../../context/AuthContext";
import styles from "./styles.module.css";

// Sub-componentes
import IdentityCard from "./components/IdentityCard";
import ProfileForm from "./components/ProfileForm";
import StatsColumn from "./components/StatsColumn";

function Perfil() {
  const { user, updateUser } = useAuth();

  return (
    <div className={styles.container}>
      <header className={styles.header} style={{marginBottom: 32}}>
        <h1>Meu Perfil</h1>
      </header>

      <div className={styles.profileGrid}>
        <IdentityCard user={user} />
        <ProfileForm user={user} updateUser={updateUser} />
        <StatsColumn />
      </div>
    </div>
  )
}

export default Perfil;
