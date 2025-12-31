import { FiSearch } from "react-icons/fi";
import styles from "./styles.module.css";

function SearchBar() {
  return (
    <div className={styles.searchWrapper}>
      <FiSearch className={styles.icon} />
      <input
      type="text"
      placeholder="Buscar EPI..."
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "16px"
      }}
    />
    </div>
    
  );
}

export default SearchBar;