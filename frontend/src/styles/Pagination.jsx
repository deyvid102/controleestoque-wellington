import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useTheme } from './ThemeContext';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const { isDarkMode } = useTheme();

  // Se houver apenas 1 página ou nenhuma, não renderiza nada
  if (totalPages <= 1) return null;

  // Lógica para gerar os números das páginas (com "...")
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const baseBtnStyle = `flex items-center justify-center min-w-[40px] h-10 px-3 rounded-xl font-bold transition-all duration-200 active:scale-90`;
  
  const activeStyle = `bg-blue-600 text-white shadow-lg shadow-blue-500/30`;
  
  const inactiveStyle = isDarkMode 
    ? `bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700` 
    : `bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 border border-slate-200 shadow-sm`;

  const disabledStyle = `opacity-40 cursor-not-allowed grayscale`;

  return (
    <div className="flex items-center justify-center gap-2 mt-8 mb-4">
      {/* Botão Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${baseBtnStyle} ${inactiveStyle} ${currentPage === 1 ? disabledStyle : ''}`}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Números das Páginas */}
      <div className="flex items-center gap-2">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`dots-${index}`} className={`px-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>
                <MoreHorizontal size={20} />
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`${baseBtnStyle} ${page === currentPage ? activeStyle : inactiveStyle}`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Botão Próximo */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${baseBtnStyle} ${inactiveStyle} ${currentPage === totalPages ? disabledStyle : ''}`}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;