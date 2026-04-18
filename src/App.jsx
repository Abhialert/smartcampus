import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import StudentDashboard from './pages/student/StudentDashboard';
import CampusLive from './pages/student/CampusLive';
import ComplaintPortal from './pages/student/ComplaintPortal';
import AdminDashboard from './pages/admin/AdminDashboard';
import CampusAnalytics from './pages/admin/CampusAnalytics';
import ComplaintManagement from './pages/admin/ComplaintManagement';
import Announcements from './pages/admin/Announcements';
import ChatBot from './components/ChatBot';
import Navbar from './components/Navbar';

function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to={`/${role}`} replace />;
  return children;
}

function AppLayout({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return children;

  return (
    <div className="flex h-screen overflow-hidden flex-col bg-primary">
      <Navbar />
      <div className="flex-1 overflow-hidden relative">
        <main className="h-full overflow-y-auto p-4 md:p-6 pb-24">
          {children}
        </main>
      </div>
      <ChatBot />
    </div>
  );
}

export default function App() {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        isAuthenticated 
          ? <Navigate to={`/${role}`} replace /> 
          : <Navigate to="/login" replace />
      } />

      {/* Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute allowedRole="student">
          <AppLayout><StudentDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/student/campus" element={
        <ProtectedRoute allowedRole="student">
          <AppLayout><CampusLive /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/student/complaints" element={
        <ProtectedRoute allowedRole="student">
          <AppLayout><ComplaintPortal /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRole="admin">
          <AppLayout><AdminDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/analytics" element={
        <ProtectedRoute allowedRole="admin">
          <AppLayout><CampusAnalytics /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/complaints" element={
        <ProtectedRoute allowedRole="admin">
          <AppLayout><ComplaintManagement /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/announcements" element={
        <ProtectedRoute allowedRole="admin">
          <AppLayout><Announcements /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
