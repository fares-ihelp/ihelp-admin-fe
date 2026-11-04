export function formatCell(value, fieldDef) {
  if (value === null || value === undefined || value === '') return '—';
  if (fieldDef?.type === 'boolean') return value ? 'Yes' : 'No';
  if (fieldDef?.type === 'decimal') return Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  if (fieldDef?.type === 'datetime' || fieldDef?.key === 'created_at' || fieldDef?.key === 'updated_at') {
    return formatDateTime(value);
  }
  return String(value);
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function truncate(str, len = 40) {
  if (!str) return str;
  const s = String(str);
  return s.length > len ? `${s.slice(0, len)}…` : s;
}
