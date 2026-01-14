import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon } from "lucide-react";
import Styles from "./styles.module.css";

function Breadcrumb({ theme = 'light' }) {
  const location = useLocation();

  const pathnames = location.pathname
    .split("/")
    .filter((x) => x);

  const isHome = pathnames.length === 0;
  
  // Classe condicional para tema 'dark'
  const themeClass = theme === 'dark' ? Styles.darkTheme : '';

  if (isHome) {
    return (
      <div className={`${Styles.breadcrumbContainer} ${themeClass}`}>
        <h1 className={Styles.mainTitle}>Dashboard</h1>
      </div>
    );
  }

  // Pega apenas o último nome para ser o título da página
  const currentPage = pathnames[pathnames.length - 1];

  return (
    <div className={`${Styles.breadcrumbContainer} ${themeClass}`}>
      <Link to="/" className={Styles.homeCircle} title="Voltar para Home">
        <HomeIcon size={20} />
      </Link>
      
      <div className={Styles.divider} />
      
      <h1 className={Styles.pageTitle}>
        {formatLabel(currentPage)}
      </h1>
    </div>
  );
}

function formatLabel(text) {
  if (!text) return "";
  if (!isNaN(text)) return `#${text}`;

  return text
    .replace("-", " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export default Breadcrumb;
