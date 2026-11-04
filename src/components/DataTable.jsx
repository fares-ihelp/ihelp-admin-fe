import { ArrowUp, ArrowDown, Pencil, Trash2, Inbox, ExternalLink, FileText, Image as ImageIcon } from 'lucide-react';
import StatusPill from './StatusPill';
import { formatCell, truncate } from '../utils/format';

const STATUS_KEYS = new Set(['status', 'role']);

// Extract host from VITE_API_BASE_URL (defaults to http://localhost:5000)
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/admin';
const SERVER_HOST = API_BASE.replace(/\/api\/admin\/?$/, '');

function isFileField(col, raw) {
  if (typeof raw !== 'string' || !raw.trim()) return false;
  const isUrlCol = /(_url|photo|avatar|document|proof|image)/i.test(col);
  const hasFilePrefix = raw.startsWith('/uploads/') || raw.startsWith('/public/') || raw.startsWith('http://') || raw.startsWith('https://');
  const hasFileExt = /\.(jpg|jpeg|png|webp|gif|svg|pdf)$/i.test(raw);
  return isUrlCol || (hasFilePrefix && hasFileExt);
}

function resolveFileUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${SERVER_HOST}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function DataTable({ entity, rows, loading, sort, onSort, onEdit, onDelete, renderRowActions }) {
  const columns = entity.listColumns;
  const fieldByKey = (key) => entity.fields.find((f) => f.key === key);

  const handleSort = (col) => {
    if (col === entity.pk) return onSort(col);
    const def = fieldByKey(col);
    if (!def && col !== entity.pk) return;
    onSort(col);
  };

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} onClick={() => handleSort(col)}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {(fieldByKey(col)?.label) || col.replace(/_/g, ' ')}
                  {sort.field === col && (sort.dir === 'ASC' ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                </span>
              </th>
            ))}
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <tr key={`sk-${i}`}>
              {columns.map((c) => <td key={c}><div className="skeleton-row" style={{ width: '70%' }} /></td>)}
              <td />
            </tr>
          ))}

          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1}>
                <div className="empty-state">
                  <div className="icon-wrap"><Inbox size={20} /></div>
                  No records found
                </div>
              </td>
            </tr>
          )}

          {!loading && rows.map((row) => (
            <tr key={row[entity.pk]}>
              {columns.map((col) => {
                const def = fieldByKey(col);
                const isFk = def?.type === 'fk';
                const raw = isFk ? (row[`${col}_label`] ?? row[col]) : row[col];

                if (STATUS_KEYS.has(col) || def?.type === 'enum' || def?.type === 'select') {
                  return <td key={col}><StatusPill value={row[col]} /></td>;
                }
                if (def?.type === 'boolean') {
                  return <td key={col}>{row[col] ? <span className="pill pill-green">Yes</span> : <span className="pill pill-gray">No</span>}</td>;
                }

                // File & Image Thumbnail Rendering
                if (isFileField(col, raw)) {
                  const resolvedUrl = resolveFileUrl(raw);
                  const isPdf = /\.pdf$/i.test(raw);

                  return (
                    <td key={col}>
                      <a
                        href={resolvedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          textDecoration: 'none',
                          color: '#059669',
                          fontSize: 12,
                          fontWeight: 500
                        }}
                        title={`Click to view: ${raw}`}
                      >
                        {isPdf ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca'
                          }}>
                            <FileText size={12} /> View PDF
                          </span>
                        ) : (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <img
                              src={resolvedUrl}
                              alt="Thumbnail"
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 4,
                                objectFit: 'cover',
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#f8fafc'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'inline-flex';
                              }}
                            />
                            <span style={{ display: 'none', alignItems: 'center', gap: 4 }}>
                              <ImageIcon size={13} /> View File
                            </span>
                            <ExternalLink size={11} style={{ opacity: 0.6 }} />
                          </div>
                        )}
                      </a>
                    </td>
                  );
                }

                return <td key={col} title={String(raw ?? '')}>{truncate(formatCell(raw, def), 42)}</td>;
              })}
              <td>
                <div className="row-actions">
                  {renderRowActions && renderRowActions(row)}
                  {entity.canEdit !== false && (
                    <button className="icon-btn" onClick={() => onEdit(row)} title="Edit">
                      <Pencil size={14} />
                    </button>
                  )}
                  {entity.canDelete !== false && (
                    <button className="icon-btn" onClick={() => onDelete(row)} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
