import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView] = useState('login'); // 'login' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      const dest = location.state?.from || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password');
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setResetLink('');
    setBusy(true);

    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      setSuccess('Password reset link has been sent to your email.');
      if (res.data?.data?.reset_link) {
        setResetLink(res.data.data.reset_link);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'This email is not registered as an administrator in the database.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <img src="/logo.png" alt="iHelp Logo" className="login-mark" />

        {view === 'login' ? (
          <>
            <h1>iHelp Admin</h1>
            <p className="sub">Sign in to manage users, jobs, wallets and more.</p>

            <form onSubmit={handleSubmit}>
              {error && <div className="form-error">{error}</div>}

              <div className="field">
                <label>Email</label>
                <input
                  className="input"
                  type="email"
                  autoFocus
                  placeholder="admin@ihelp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ margin: 0 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setView('forgot');
                      setError('');
                      setSuccess('');
                      setForgotEmail(email);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--color-brand)',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '10px 0', marginTop: 8 }}
                disabled={busy}
              >
                {busy ? <span className="spinner" /> : <><LogIn size={15} /> Sign in</>}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1>Forgot Password</h1>
            <p className="sub">Enter your administrator email to receive a password reset link.</p>

            {success ? (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ display: 'inline-flex', padding: 12, borderRadius: '50%', background: '#ecfdf5', color: '#059669', marginBottom: 12 }}>
                  <CheckCircle2 size={32} />
                </div>
                <div style={{ fontSize: 13.5, color: '#059669', fontWeight: 600, marginBottom: 8 }}>
                  {success}
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--color-ink-faint)', margin: '0 0 16px' }}>
                  A secure one-time link has been generated. Use it within 60 minutes to choose a new password.
                </p>

                {resetLink && (
                  <div style={{ margin: '14px 0', padding: 12, background: 'var(--color-surface-soft)', borderRadius: 8, textAlign: 'left' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-ink-faint)', marginBottom: 4 }}>
                      Reset Link:
                    </div>
                    <a
                      href={resetLink}
                      style={{ fontSize: 12, wordBreak: 'break-all', color: 'var(--color-brand)', textDecoration: 'underline' }}
                    >
                      {resetLink}
                    </a>
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
                  onClick={() => {
                    setView('login');
                    setError('');
                    setSuccess('');
                  }}
                >
                  <ArrowLeft size={15} /> Back to Sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                {error && <div className="form-error">{error}</div>}

                <div className="field">
                  <label>Administrator Email</label>
                  <input
                    className="input"
                    type="email"
                    autoFocus
                    placeholder="admin@ihelp.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px 0', marginTop: 8 }}
                  disabled={busy}
                >
                  {busy ? <span className="spinner" /> : <><Mail size={15} /> Send Reset Link</>}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    width: '100%',
                    padding: '12px 0 0',
                    color: 'var(--color-ink-faint)',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <ArrowLeft size={13} /> Back to Sign in
                </button>
              </form>
            )}
          </>
        )}

        <p className="text-faint" style={{ fontSize: 12, marginTop: 24, marginBottom: 0, textAlign: 'center' }}>
          Authorized administrator access only.
        </p>
      </div>
    </div>
  );
}
