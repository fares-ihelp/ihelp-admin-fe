import { useState, useRef, useEffect } from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

export default function Topbar({ title, crumb }) {
  const { admin, logout } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const initials = (admin?.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={toggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className="topbar-title">
          {crumb && <span className="crumb">{crumb} / </span>}
          <span>{title}</span>
        </div>
      </div>

      <div className="topbar-right">
        <div ref={ref} style={{ position: 'relative' }}>
          <div className="admin-chip" onClick={() => setOpen((o) => !o)}>
            <span className="admin-avatar">{initials}</span>
            <span className="admin-name">{admin?.name}</span>
          </div>
          {open && (
            <div className="panel" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', minWidth: 200, zIndex: 40 }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{admin?.name}</div>
                <div className="text-faint" style={{ fontSize: 12 }}>{admin?.email}</div>
                <span className="pill pill-green" style={{ marginTop: 6 }}>{admin?.role?.replace('_', ' ')}</span>
              </div>
              <div style={{ padding: 6 }}>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => { setOpen(false); logout(); }}>
                  <LogOut size={15} /> Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
