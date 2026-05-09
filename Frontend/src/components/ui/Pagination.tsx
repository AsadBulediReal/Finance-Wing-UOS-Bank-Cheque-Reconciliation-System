
import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalEntries?: number;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalEntries, 
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [2, 5, 10, 20, 30],
  className 
}: PaginationProps) {
  if (totalPages === 0 && !totalEntries) return null;

  const renderPageButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(renderButton(i));
      }
    } else {
      // Always show first page
      buttons.push(renderButton(1));

      if (currentPage > 3) {
        buttons.push(<span key="dots-1" className="px-2 py-1 text-slate-400"><MoreHorizontal className="h-4 w-4" /></span>);
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i === 1 || i === totalPages) continue;
        buttons.push(renderButton(i));
      }

      if (currentPage < totalPages - 2) {
        buttons.push(<span key="dots-2" className="px-2 py-1 text-slate-400"><MoreHorizontal className="h-4 w-4" /></span>);
      }

      // Always show last page
      buttons.push(renderButton(totalPages));
    }
    
    return buttons;
  };

  const renderButton = (page: number) => (
    <button
      key={page}
      onClick={() => onPageChange(page)}
      className={cn(
        "min-w-[32px] h-8 px-3 py-1 rounded-md text-sm font-medium transition-all",
        currentPage === page 
          ? "bg-slate-900 text-white shadow-sm" 
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      {page}
    </button>
  );

  return (
    <div className={cn("flex items-center justify-between px-2 py-3 gap-4", className)}>
      <div className="flex items-center gap-4">
        {totalEntries && pageSize && (
          <div className="text-sm text-slate-500 hidden sm:block">
            Showing <span className="font-medium text-slate-900">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
            <span className="font-medium text-slate-900">{Math.min(currentPage * pageSize, totalEntries)}</span> of{' '}
            <span className="font-medium text-slate-900">{totalEntries}</span> entries
          </div>
        )}

        {onPageSizeChange && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="hidden lg:inline">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="First Page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden md:inline">Previous</span>
        </button>

        <div className="flex items-center gap-1 mx-2">
          {renderPageButtons()}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <span className="hidden md:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Last Page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
