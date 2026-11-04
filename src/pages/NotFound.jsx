import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-body">
      <div className="panel" style={{ padding: 60, textAlign: 'center' }}>
        <h2 style={{ marginTop: 0 }}>Page not found</h2>
        <p className="text-faint">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 10 }}>Back to dashboard</Link>
      </div>
    </div>
  );
}
