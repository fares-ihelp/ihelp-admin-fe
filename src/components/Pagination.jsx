import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, total, limit, onPageChange }) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="pagination">
      <span>{total === 0 ? 'No records' : `Showing ${start}–${end} of ${total}`}</span>
      <div className="pagination-controls">
        <button className="icon-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft size={15} />
        </button>
        <span className="text-mono">{page} / {totalPages}</span>
        <button className="icon-btn" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
