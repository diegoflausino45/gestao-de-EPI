import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function Pagination({ 
  totalItems = 0, 
  itemsPerPage = 10, 
  onPageChange = () => {},
  maxPagesVisible = 5 
}) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Calcula o range de páginas a exibir
  const getPageRange = () => {
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesVisible - 1);
    
    // Ajusta start se estamos perto do final
    if (endPage - startPage + 1 < maxPagesVisible) {
      startPage = Math.max(1, endPage - maxPagesVisible + 1);
    }
    
    return { startPage, endPage };
  };

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      onPageChange(newPage);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      onPageChange(newPage);
    }
  };

  const { startPage, endPage } = getPageRange();
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  if (totalPages <= 1) return null;

  return (
    <div className={styles.paginationContainer}>
      <button
        className={`${styles.btn} ${styles.navBtn}`}
        onClick={handlePrevious}
        disabled={currentPage === 1}
        title="Página anterior"
      >
        <FaChevronLeft />
      </button>

      {startPage > 1 && (
        <>
          <button
            className={styles.btn}
            onClick={() => handlePageClick(1)}
            title="Primeira página"
          >
            1
          </button>
          {startPage > 2 && <span className={styles.ellipsis}>...</span>}
        </>
      )}

      {pages.map(page => (
        <button
          key={page}
          className={`${styles.btn} ${currentPage === page ? styles.active : ""}`}
          onClick={() => handlePageClick(page)}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className={styles.ellipsis}>...</span>}
          <button
            className={styles.btn}
            onClick={() => handlePageClick(totalPages)}
            title="Última página"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        className={`${styles.btn} ${styles.navBtn}`}
        onClick={handleNext}
        disabled={currentPage === totalPages}
        title="Próxima página"
      >
        <FaChevronRight />
      </button>

      <div className={styles.info}>
        Página {currentPage} de {totalPages}
      </div>
    </div>
  );
}

export default Pagination;
