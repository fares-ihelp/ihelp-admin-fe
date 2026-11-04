import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Navigation,
  Users,
  FileCheck,
  Mic,
  Briefcase,
  Layers,
  CreditCard,
  Wallet,
  Receipt,
  ShieldAlert,
  LifeBuoy,
  GraduationCap,
  HelpCircle,
  Sliders,
  Globe,
  Circle,
  X
} from 'lucide-react';
import { useMeta } from '../context/MetaContext';
import { useSidebar } from '../context/SidebarContext';

// Meaningful icons for each entity instead of dropdown chevrons
const ENTITY_ICONS = {
  users: Users,
  documents: FileCheck,
  interview_sessions: Mic,
  jobs: Briefcase,
  job_categories: Layers,
  withdrawal_requests: CreditCard,
  wallets: Wallet,
  wallet_transactions: Receipt,
  sos_cases: ShieldAlert,
  support_tickets: LifeBuoy,
  training_lessons: GraduationCap,
  faqs: HelpCircle,
  app_config: Sliders,
  languages: Globe
};

export default function Sidebar() {
  const { groups, loaded } = useMeta();
  const { isOpen, closeSidebar } = useSidebar();

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/logo.png" alt="iHelp Logo" className="mark" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="name">iHelp Admin</div>
            <div className="sub">Control Center</div>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={closeSidebar}
            aria-label="Close Navigation"
          >
            <X size={18} />
          </button>
        </div>

        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={16} />
          Dashboard
        </NavLink>

        <NavLink to="/tracking" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Navigation size={16} />
          Live Map Tracking
        </NavLink>

        {!loaded && (
          <div className="sidebar-group">
            <div className="skeleton-row" style={{ margin: '8px 10px', background: 'rgba(255,255,255,0.06)' }} />
            <div className="skeleton-row" style={{ margin: '8px 10px', background: 'rgba(255,255,255,0.06)' }} />
          </div>
        )}

        {groups.map((group) => (
          <div className="sidebar-group" key={group.name}>
            <div className="sidebar-group-label">{group.name}</div>
            {group.entities.map((e) => {
              const ItemIcon = ENTITY_ICONS[e.key] || Circle;
              return (
                <NavLink
                  key={e.key}
                  to={`/data/${e.key}`}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <ItemIcon size={15} />
                  <span>{e.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </aside>
    </>
  );
}
