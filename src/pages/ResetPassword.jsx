import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../api/client';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const token = query.get('token') || '';
  const email = query.get('email') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token || !email) {
      setError('Invalid or missing password reset link. Please request a new one.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        token,
        new_password: newPassword
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <img src="/logo.png" alt="iHelp Logo" className="login-mark" />

        {success ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ display: 'inline-flex', padding: 12, borderRadius: '50%', background: '#ecfdf5', color: '#059669', marginBottom: 12 }}>
              <CheckCircle2 size={36} />
            </div>
            <h1 style={{ fontSize: 20, marginBottom: 8 }}>Password Updated</h1>
            <p className="sub" style={{ marginBottom: 20 }}>
              Your administrator password has been updated successfully. You can now sign in with your new password.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('/login')}
            >
              Go to Sign in <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <>
            <h1>Create New Password</h1>
            <p className="sub">
              {email ? `Setting a new password for ${email}` : 'Enter your new administrator password below.'}
            </p>

            {(!token || !email) && (
              <div className="form-error" style={{ marginBottom: 16 }}>
                Invalid or incomplete reset link. Please{' '}
                <Link to="/login" style={{ textDecoration: 'underline', color: 'inherit', fontWeight: 600 }}>
                  request a new link
                </Link>.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {error && <div className="form-error">{error}</div>}

              <div className="field">
                <label>New Password</label>
                <input
                  className="input"
                  type="password"
                  autoFocus
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={!token || !email || busy}
                  required
                />
              </div>

              <div className="field">
                <label>Confirm New Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!token || !email || busy}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '10px 0', marginTop: 8 }}
                disabled={!token || !email || busy}
              >
                {busy ? <span className="spinner" /> : <><KeyRound size={15} /> Update Password</>}
              </button>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Link to="/login" style={{ fontSize: 12.5, color: 'var(--color-ink-faint)', textDecoration: 'none' }}>
                  Back to Sign in
                </Link>
              </div>
            </form>
          </>
        )}

        <p className="text-faint" style={{ fontSize: 12, marginTop: 24, marginBottom: 0, textAlign: 'center' }}>
          Authorized administrator access only.
        </p>
      </div>
    </div>
  );
}

