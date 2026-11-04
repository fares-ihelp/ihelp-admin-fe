import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation, Users, Briefcase, ShieldAlert, RefreshCw,
  Phone, MapPin, CheckCircle, Clock, Eye, Compass, Layers,
  Star, ShieldCheck, Radio
} from 'lucide-react';
import api from '../api/client';
import Topbar from '../components/Topbar';
import { useToast } from '../context/ToastContext';

// Fix Leaflet default icon paths if needed
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// User Avatar SVG Icon
const USER_SVG = `
<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
  <circle cx="12" cy="7" r="4"/>
</svg>
`;

// Briefcase SVG Icon
const JOB_SVG = `
<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
</svg>
`;

// SOS Alert SVG Icon
const SOS_SVG = `
<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
  <line x1="12" x2="12" y1="9" y2="13"/>
  <line x1="12" x2="12.01" y1="17" y2="17"/>
</svg>
`;

// High-contrast, sharp, anchored custom map markers
function createWorkerIcon(name, isOnline) {
  return L.divIcon({
    className: 'custom-map-pin',
    iconSize: [120, 68],
    iconAnchor: [60, 64],
    popupAnchor: [0, -60],
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
        <!-- Circular Avatar Pin -->
        <div style="
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #059669;
          border: 2.5px solid #ffffff;
          box-shadow: 0 3px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          ${USER_SVG}
          <!-- Online status dot -->
          <span style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 9px;
            height: 9px;
            border-radius: 50%;
            background: ${isOnline ? '#22c55e' : '#94a3b8'};
            border: 1.5px solid #ffffff;
          "></span>
        </div>

        <!-- Pin Needle / Triangle Pointer -->
        <div style="
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid #059669;
          margin-top: -1px;
        "></div>

        <!-- High-contrast Name Card -->
        <div style="
          margin-top: 2px;
          background: #ffffff;
          color: #0f172a;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          border: 1px solid #cbd5e1;
          box-shadow: 0 2px 6px rgba(0,0,0,0.18);
          white-space: nowrap;
          max-width: 115px;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
        ">
          ${name || 'Worker'}
        </div>
      </div>
    `
  });
}

function createJobIcon(title, pay) {
  return L.divIcon({
    className: 'custom-map-pin',
    iconSize: [120, 68],
    iconAnchor: [60, 64],
    popupAnchor: [0, -60],
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
        <!-- Circular Job Pin -->
        <div style="
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #2563eb;
          border: 2.5px solid #ffffff;
          box-shadow: 0 3px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${JOB_SVG}
        </div>

        <!-- Needle -->
        <div style="
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid #2563eb;
          margin-top: -1px;
        "></div>

        <!-- Title & Pay Card -->
        <div style="
          margin-top: 2px;
          background: #ffffff;
          color: #1e3a8a;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          border: 1px solid #bfdbfe;
          box-shadow: 0 2px 6px rgba(0,0,0,0.18);
          white-space: nowrap;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
        ">
          ${title} · <span style="color: #059669;">₹${pay}</span>
        </div>
      </div>
    `
  });
}

function createSosIcon(refId) {
  return L.divIcon({
    className: 'custom-map-pin',
    iconSize: [120, 68],
    iconAnchor: [60, 64],
    popupAnchor: [0, -60],
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
        <!-- Circular SOS Pulse Pin -->
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #ef4444;
          border: 2.5px solid #ffffff;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.4), 0 3px 10px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse-ring 1.4s infinite;
        ">
          ${SOS_SVG}
        </div>

        <!-- Needle -->
        <div style="
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid #ef4444;
          margin-top: -1px;
        "></div>

        <!-- SOS Warning Card -->
        <div style="
          margin-top: 2px;
          background: #ef4444;
          color: #ffffff;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 800;
          border: 1px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          white-space: nowrap;
          text-align: center;
        ">
          SOS: ${refId || 'EMERGENCY'}
        </div>
      </div>
    `
  });
}

export default function LiveTracking() {
  const { showToast } = useToast();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const isFirstLoadRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ counts: {}, markers: { workers: [], jobs: [], sos: [] } });
  const [filter, setFilter] = useState('all'); // all, workers, jobs, sos
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch Live Tracking Data
  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/tracking/live');
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      if (!silent) showToast(err.response?.data?.error?.message || 'Failed to load tracking data', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh interval (every 12 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchData(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Centered around Chennai by default
      const map = L.map(mapContainerRef.current, {
        center: [12.9800, 80.1800],
        zoom: 12,
        zoomControl: true
      });

      // 100% Free OpenStreetMap standard tiles (Zero API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers on Map when Data or Filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersLayerRef.current;
    if (!map || !group) return;

    group.clearLayers();

    const bounds = [];

    // 1. Worker Markers
    if (filter === 'all' || filter === 'workers') {
      (data.markers?.workers || []).forEach((w) => {
        if (!w.lat || !w.lng) return;
        bounds.push([w.lat, w.lng]);
        const marker = L.marker([w.lat, w.lng], {
          icon: createWorkerIcon(w.name, w.is_online)
        });

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; min-width: 180px; padding: 4px;">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 3px; display: flex; align-items: center; justify-content: space-between;">
              <span>${w.name}</span>
              <span style="font-size: 10px; padding: 2px 6px; border-radius: 10px; background: ${w.is_online ? '#dcfce7' : '#f1f5f9'}; color: ${w.is_online ? '#15803d' : '#64748b'};">
                ${w.is_online ? 'Online' : 'Offline'}
              </span>
            </div>
            <div style="color: #64748b; font-size: 11.5px; margin-bottom: 4px;">Phone: ${w.mobile}</div>
            <div style="color: #64748b; font-size: 11.5px; margin-bottom: 6px;">Location: ${w.address || 'Registered Area'}</div>
            <div style="display: flex; gap: 10px; font-size: 11.5px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
              <span>Rating: <b>${w.avg_rating}</b></span>
              <span>Trust: <b>${w.trust_score}%</b></span>
            </div>
          </div>
        `);

        marker.on('click', () => setSelectedEntity(w));
        group.addLayer(marker);
      });
    }

    // 2. Job Markers
    if (filter === 'all' || filter === 'jobs') {
      (data.markers?.jobs || []).forEach((j) => {
        if (!j.lat || !j.lng) return;
        bounds.push([j.lat, j.lng]);
        const marker = L.marker([j.lat, j.lng], {
          icon: createJobIcon(j.title, j.pay)
        });

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; min-width: 180px; padding: 4px;">
            <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 3px;">
              ${j.title}
            </div>
            <div style="color: #64748b; font-size: 11.5px; margin-bottom: 4px;">Category: <b>${j.category}</b></div>
            <div style="color: #059669; font-weight: 700; font-size: 13px; margin-bottom: 6px;">Payout: ₹${j.pay}</div>
            <div style="font-size: 11px; padding: 2px 6px; border-radius: 4px; display: inline-block; background: #e0f2fe; color: #0284c7;">
              Status: ${j.status.toUpperCase()}
            </div>
          </div>
        `);

        marker.on('click', () => setSelectedEntity(j));
        group.addLayer(marker);
      });
    }

    // 3. SOS Alerts
    if (filter === 'all' || filter === 'sos') {
      (data.markers?.sos || []).forEach((s) => {
        if (!s.lat || !s.lng) return;
        bounds.push([s.lat, s.lng]);
        const marker = L.marker([s.lat, s.lng], {
          icon: createSosIcon(s.ref_id)
        });

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; min-width: 190px; padding: 4px;">
            <div style="font-weight: 800; color: #dc2626; margin-bottom: 3px;">
              ${s.title}
            </div>
            <div style="color: #0f172a; font-weight: 600; font-size: 12px; margin-bottom: 2px;">User: ${s.user_name}</div>
            <div style="color: #64748b; font-size: 11.5px; margin-bottom: 6px;">Contact: <b>${s.mobile}</b></div>
            <div style="font-size: 11px; color: #dc2626; font-weight: 700;">URGENT DISPATCH REQUIRED</div>
          </div>
        `);

        marker.on('click', () => setSelectedEntity(s));
        group.addLayer(marker);
      });
    }

    // Auto-fit to all markers ONLY on initial load to preserve user zoom level
    if (isFirstLoadRef.current && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      isFirstLoadRef.current = false;
    }
  }, [data, filter]);

  // Recenter map to encompass all current active markers
  const recenterMap = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const bounds = [];
    (data.markers?.workers || []).forEach((w) => w.lat && w.lng && bounds.push([w.lat, w.lng]));
    (data.markers?.jobs || []).forEach((j) => j.lat && j.lng && bounds.push([j.lat, j.lng]));
    (data.markers?.sos || []).forEach((s) => s.lat && s.lng && bounds.push([s.lat, s.lng]));
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else {
      map.setView([12.9800, 80.1800], 12);
    }
  };

  // Center Map to a specific entity
  const focusEntity = (entity) => {
    setSelectedEntity(entity);
    if (mapInstanceRef.current && entity.lat && entity.lng) {
      mapInstanceRef.current.flyTo([entity.lat, entity.lng], 16, { duration: 1.2 });
    }
  };

  const allVisibleEntities = [
    ...(filter === 'all' || filter === 'sos' ? data.markers.sos : []),
    ...(filter === 'all' || filter === 'workers' ? data.markers.workers : []),
    ...(filter === 'all' || filter === 'jobs' ? data.markers.jobs : [])
  ];

  return (
    <>
      <Topbar title="Live Map Tracking" />

      <div className="page-body tracking-page-body">
        {/* Top Control Bar */}
        <div className="tracking-top-bar">
          {/* Quick Metrics */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={15} color="#059669" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Active Workers:</span>
              <span style={{ background: '#ecfdf5', color: '#047857', fontWeight: 700, padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>
                {data.counts?.total_workers ?? 0}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Briefcase size={15} color="#2563eb" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Active Jobs:</span>
              <span style={{ background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>
                {data.counts?.active_jobs ?? 0}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldAlert size={15} color="#dc2626" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>SOS Alerts:</span>
              <span style={{
                background: data.counts?.active_sos > 0 ? '#fee2e2' : '#f1f5f9',
                color: data.counts?.active_sos > 0 ? '#b91c1c' : '#64748b',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: 12
              }}>
                {data.counts?.active_sos ?? 0}
              </span>
            </div>
          </div>

          {/* Filter Pills & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, gap: 2 }}>
              <button
                className={`btn-subtle ${filter === 'all' ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 12px',
                  fontSize: 12,
                  borderRadius: 6,
                  border: 'none',
                  background: filter === 'all' ? '#ffffff' : 'transparent',
                  fontWeight: filter === 'all' ? 700 : 500,
                  cursor: 'pointer',
                  color: filter === 'all' ? '#0f172a' : '#64748b',
                  boxShadow: filter === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
                onClick={() => setFilter('all')}
              >
                <Layers size={13} color={filter === 'all' ? '#0f172a' : '#64748b'} />
                All
              </button>
              <button
                className={`btn-subtle ${filter === 'workers' ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 12px',
                  fontSize: 12,
                  borderRadius: 6,
                  border: 'none',
                  background: filter === 'workers' ? '#ffffff' : 'transparent',
                  fontWeight: filter === 'workers' ? 700 : 500,
                  cursor: 'pointer',
                  color: filter === 'workers' ? '#059669' : '#64748b',
                  boxShadow: filter === 'workers' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
                onClick={() => setFilter('workers')}
              >
                <Users size={13} color={filter === 'workers' ? '#059669' : '#64748b'} />
                Workers
              </button>
              <button
                className={`btn-subtle ${filter === 'jobs' ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 12px',
                  fontSize: 12,
                  borderRadius: 6,
                  border: 'none',
                  background: filter === 'jobs' ? '#ffffff' : 'transparent',
                  fontWeight: filter === 'jobs' ? 700 : 500,
                  cursor: 'pointer',
                  color: filter === 'jobs' ? '#2563eb' : '#64748b',
                  boxShadow: filter === 'jobs' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
                onClick={() => setFilter('jobs')}
              >
                <Briefcase size={13} color={filter === 'jobs' ? '#2563eb' : '#64748b'} />
                Jobs
              </button>
              <button
                className={`btn-subtle ${filter === 'sos' ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 12px',
                  fontSize: 12,
                  borderRadius: 6,
                  border: 'none',
                  background: filter === 'sos' ? '#ffffff' : 'transparent',
                  fontWeight: filter === 'sos' ? 700 : 500,
                  cursor: 'pointer',
                  color: filter === 'sos' ? '#dc2626' : '#64748b',
                  boxShadow: filter === 'sos' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
                onClick={() => setFilter('sos')}
              >
                <ShieldAlert size={13} color={filter === 'sos' ? '#dc2626' : '#64748b'} />
                SOS Alerts
              </button>
            </div>

            <button
              className="btn-subtle"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 12, borderRadius: 8 }}
              onClick={recenterMap}
              title="Fit map to all markers"
            >
              <Compass size={13} />
              Re-center
            </button>

            <button
              className="btn-subtle"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 12, borderRadius: 8 }}
              onClick={() => fetchData()}
              disabled={loading}
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
              {loading ? 'Updating...' : 'Refresh'}
            </button>

            <button
              className="btn-subtle"
              style={{
                fontSize: 11.5,
                padding: '6px 10px',
                borderRadius: 8,
                background: autoRefresh ? '#ecfdf5' : '#f1f5f9',
                color: autoRefresh ? '#047857' : '#64748b',
                fontWeight: 600
              }}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? '● Live Sync (12s)' : '○ Paused'}
            </button>
          </div>
        </div>

        {/* Map + Side Panel Grid */}
        <div className="tracking-layout">
          {/* Main Leaflet Map */}
          <div className="tracking-map-wrap">
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

            {/* Float Badge */}
            <div style={{
              position: 'absolute',
              bottom: 14,
              left: 14,
              zIndex: 1000,
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(6px)',
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: 11.5,
              fontWeight: 600,
              color: '#334155',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Radio size={12} color="#059669" />
              Real-Time GPS Tracking Active · Chennai Region
            </div>
          </div>

          {/* Right Entity List Panel */}
          <div className="tracking-sidebar-panel">
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                Active Pinpoints ({allVisibleEntities.length})
              </div>
              <span style={{ fontSize: 11, color: '#64748b' }}>Click to zoom</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
              {allVisibleEntities.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8', fontSize: 13 }}>
                  No active locations in this view.
                </div>
              )}

              {allVisibleEntities.map((item, idx) => {
                const isSelected = selectedEntity && selectedEntity.id === item.id && selectedEntity.type === item.type;
                const isSos = item.type === 'sos';
                const isJob = item.type === 'job';
                const isWorker = item.type === 'worker';

                return (
                  <div
                    key={`${item.type}-${item.id}-${idx}`}
                    onClick={() => focusEntity(item)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      marginBottom: 6,
                      cursor: 'pointer',
                      border: isSelected ? '1.5px solid var(--color-brand)' : '1px solid var(--color-border)',
                      background: isSos
                        ? '#fef2f2'
                        : isSelected
                        ? 'rgba(16, 185, 129, 0.08)'
                        : '#ffffff',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 6,
                        background: isSos ? '#fee2e2' : isJob ? '#eff6ff' : '#ecfdf5',
                        color: isSos ? '#dc2626' : isJob ? '#2563eb' : '#059669',
                        textTransform: 'uppercase'
                      }}>
                        {item.type}
                      </span>
                      {item.is_sample && (
                        <span style={{ fontSize: 9.5, color: '#94a3b8' }}>Demo</span>
                      )}
                    </div>

                    <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a', marginBottom: 2 }}>
                      {item.name || item.title || item.ref_id}
                    </div>

                    <div style={{ fontSize: 11.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} />
                      {item.address || `${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}`}
                    </div>

                    {isWorker && (
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, marginTop: 4, color: '#475569', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Phone size={11} color="#64748b" /> {item.mobile}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Star size={11} color="#eab308" fill="#eab308" /> {item.avg_rating}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ShieldCheck size={11} color="#059669" /> {item.trust_score}%
                        </span>
                      </div>
                    )}

                    {isJob && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginTop: 4 }}>
                        <span style={{ color: '#059669', fontWeight: 700 }}>₹{item.pay}</span>
                        <span style={{ color: '#64748b' }}>{item.status}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

