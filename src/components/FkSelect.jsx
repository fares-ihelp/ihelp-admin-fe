import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import api from '../api/client';

// A searchable dropdown backed by GET /api/admin/lookup/:entity?search=
// Value is stored as the raw id; `initialLabel` seeds the display text when
// editing an existing row (so we don't need a round trip just to show it).
export default function FkSelect({ entityKey, value, initialLabel, onChange, placeholder = 'Search…' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [displayLabel, setDisplayLabel] = useState(initialLabel || '');
  const boxRef = useRef(null);

  useEffect(() => {
    setDisplayLabel(initialLabel || (value ? `#${value}` : ''));
  }, [initialLabel, value]);

  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(() => {
      setLoading(true);
      api.get(`/lookup/${entityKey}`, { params: { search: query, limit: 25 } })
        .then(({ data }) => setOptions(data.data.items))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [query, open, entityKey]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={boxRef}>
      <div
        className="input"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={() => setOpen((o) => !o)}
      >
        <span style={{ color: displayLabel ? 'var(--color-ink)' : 'var(--color-ink-faint)' }}>
          {displayLabel || 'None selected'}
        </span>
        <ChevronDown size={15} style={{ opacity: 0.5 }} />
      </div>

      {open && (
        <div
          className="panel"
          style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 30, maxHeight: 260, overflowY: 'auto' }}
        >
          <div style={{ padding: 8, borderBottom: '1px solid var(--color-border)' }}>
            <div className="search-box" style={{ minWidth: 0 }}>
              <Search size={14} />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} />
            </div>
          </div>
          {value && (
            <div
              onClick={() => { onChange(null, null); setOpen(false); }}
              style={{ padding: '9px 12px', fontSize: 13, cursor: 'pointer', color: 'var(--color-danger)' }}
            >
              Clear selection
            </div>
          )}
          {loading && <div style={{ padding: '9px 12px', fontSize: 13 }} className="text-faint">Loading…</div>}
          {!loading && options.length === 0 && (
            <div style={{ padding: '9px 12px', fontSize: 13 }} className="text-faint">No matches</div>
          )}
          {!loading && options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value, opt.label); setOpen(false); }}
              style={{
                padding: '9px 12px',
                fontSize: 13,
                cursor: 'pointer',
                background: opt.value === value ? 'var(--color-brand-soft)' : 'transparent'
              }}
            >
              {opt.label} <span className="text-faint">#{opt.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
