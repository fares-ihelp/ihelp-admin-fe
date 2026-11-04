import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MetaProvider } from './context/MetaContext';
import { ToastProvider } from './context/ToastContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import LiveTracking from './pages/LiveTracking';
import EntityList from './pages/EntityList';
import NotFound from './pages/NotFound';

function AdminShell() {
  const { isOpen, closeSidebar } = useSidebar();

  return (
    <div className="app-shell">
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      <Sidebar />
      <div className="main-col">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tracking" element={<LiveTracking />} />
          <Route path="/data/:entityKey" element={<EntityList />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

function AuthedApp() {
  const { admin } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={admin ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MetaProvider>
              <SidebarProvider>
                <AdminShell />
              </SidebarProvider>
            </MetaProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AuthedApp />
      </AuthProvider>
    </ToastProvider>
  );
}
