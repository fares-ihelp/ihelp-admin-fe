const TONE_MAP = {
  active: 'green', success: 'green', verified: 'green', accepted: 'green', open: 'blue',
  resolved: 'green', completed: 'green', confirmed: 'green',
  pending: 'amber', processing: 'amber', submitted: 'amber', in_progress: 'amber', claimed: 'amber', arrived: 'amber',
  blocked: 'red', failed: 'red', declined: 'red', deleted: 'red', cancelled: 'red', expired: 'red', closed: 'gray',
  inactive: 'gray', offline: 'gray'
};

export default function StatusPill({ value }) {
  if (value === null || value === undefined || value === '') return <span className="text-faint">—</span>;
  const key = String(value).toLowerCase();
  const tone = TONE_MAP[key] || 'gray';
  return (
    <span className={`pill pill-${tone}`}>
      <span className="pill-dot" />
      {String(value).replace(/_/g, ' ')}
    </span>
  );
}
