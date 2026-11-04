import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, Briefcase, LifeBuoy, ShieldAlert, Wallet, Clock } from 'lucide-react';
import api from '../api/client';
import Topbar from '../components/Topbar';
import StatusPill from '../components/StatusPill';
import { formatDateTime } from '../utils/format';

const PIE_COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#65a30d'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(({ data }) => setStats(data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="page-body">
        <div className="stat-grid">
          <StatCard icon={Users} label="Total Users" value={stats?.totals.users} loading={loading} />
          <StatCard icon={Briefcase} label="Total Jobs" value={stats?.totals.jobs} loading={loading} />
          <StatCard icon={Wallet} label="Revenue (this month)" value={stats && `₹${Number(stats.totals.revenue_this_month).toLocaleString('en-IN')}`} loading={loading} />
          <StatCard icon={LifeBuoy} label="Open Support Tickets" value={stats?.totals.open_support_tickets} loading={loading} />
          <StatCard icon={ShieldAlert} label="Active SOS Cases" value={stats?.totals.active_sos_cases} loading={loading} accent="red" />
          <StatCard icon={Clock} label="Pending Withdrawals" value={stats?.totals.pending_withdrawals} loading={loading} accent="amber" />
        </div>

        <div className="dash-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">Revenue — last 14 days</div>
                <div className="panel-subtitle">Successful wallet transactions</div>
              </div>
            </div>
            <div style={{ padding: '20px 16px 8px', height: 260 }}>
              {!loading && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.revenue_last_14_days || []}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#16a34a" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e6e4" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} tickFormatter={(d) => d?.slice(5)} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
                    <Area type="monotone" dataKey="amount" stroke="#16a34a" strokeWidth={2} fill="url(#rev)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">Jobs by status</div>
              </div>
            </div>
            <div style={{ padding: '10px 16px', height: 260, display: 'flex', alignItems: 'center' }}>
              {!loading && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.jobs_by_status || []}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {(stats?.jobs_by_status || []).map((entry, i) => (
                        <Cell key={entry.status} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="dash-grid" style={{ marginTop: 16 }}>
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Recent jobs</div></div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Title</th><th>Employer</th><th>Pay</th><th>Status</th><th>Created</th></tr></thead>
                <tbody>
                  {(stats?.recent_jobs || []).map((j) => (
                    <tr key={j.id}>
                      <td>{j.title || j.category}</td>
                      <td>{j.employer_name || '—'}</td>
                      <td>₹{j.pay}</td>
                      <td><StatusPill value={j.status} /></td>
                      <td className="text-faint">{formatDateTime(j.created_at)}</td>
                    </tr>
                  ))}
                  {!loading && (stats?.recent_jobs || []).length === 0 && (
                    <tr><td colSpan={5} className="empty-state">No jobs yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header"><div className="panel-title">Recent users</div></div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Mobile</th><th>Name</th><th>Status</th><th>Joined</th></tr></thead>
                <tbody>
                  {(stats?.recent_users || []).map((u) => (
                    <tr key={u.id}>
                      <td>{u.mobile}</td>
                      <td>{u.name || '—'}</td>
                      <td><StatusPill value={u.status} /></td>
                      <td className="text-faint">{formatDateTime(u.created_at)}</td>
                    </tr>
                  ))}
                  {!loading && (stats?.recent_users || []).length === 0 && (
                    <tr><td colSpan={4} className="empty-state">No users yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ icon: Icon, label, value, loading, accent }) {
  return (
    <div className="stat-card">
      <div className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon size={13} color={accent === 'red' ? 'var(--color-danger)' : accent === 'amber' ? 'var(--color-warning)' : 'var(--color-brand)'} />
        {label}
      </div>
      <div className="value">{loading ? <div className="skeleton-row" style={{ width: 70, height: 22 }} /> : (value ?? 0)}</div>
    </div>
  );
}
