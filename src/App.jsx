import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAnnouncements from './pages/student/Announcements';
import CampusLive from './pages/student/CampusLive';
import ComplaintPortal from './pages/student/ComplaintPortal';
import StudentAssignments from './pages/student/Assignments';
import StudentTimetable from './pages/student/Timetable';
import StudentAttendance from './pages/student/Attendance';
import StudentStudyMaterials from './pages/student/StudyMaterials';
import StudentClubs from './pages/student/Clubs';
import StudentEvents from './pages/student/Events';
import StudentCareer from './pages/student/Career';
import StudentSkillTracker from './pages/student/SkillTracker';
import AdminDashboard from './pages/admin/AdminDashboard';
import CampusAnalytics from './pages/admin/CampusAnalytics';
import ComplaintManagement from './pages/admin/ComplaintManagement';
import Announcements from './pages/admin/Announcements';
import AdminAssignments from './pages/admin/Assignments';
import AdminTimetable from './pages/admin/Timetable';
import AdminAttendance from './pages/admin/Attendance';
import AdminStudyMaterials from './pages/admin/StudyMaterials';
import TeacherManagement from './pages/admin/TeacherManagement';
import StudentData from './pages/admin/StudentData';
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
    <div className="flex h-screen overflow-hidden flex-col bg-gradient-to-br from-white via-gray-50/50 to-red-50/20">
      <Navbar />
      <div className="flex-1 overflow-y-auto flex flex-col relative">
        <main className="flex-1 p-5 md:p-8 shrink-0">
          {children}
        </main>
        
        {/* Global Footer */}
        <footer className="bg-red-700 text-white py-10 px-6 shrink-0 border-t-4 border-red-800 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-xl mb-1 tracking-wide">Techno Main Salt Lake</h3>
              <p className="text-red-200 text-sm font-medium">Empowering minds, shaping the future.</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2 text-red-100 text-sm">
              <span className="flex items-center gap-2"><span className="text-base">📍</span> EM-4, Sector V, Salt Lake, Kolkata - 700091</span>
              <span className="flex items-center gap-2"><span className="text-base">📞</span> +91 33 2357 5683</span>
              <span className="mt-3 text-xs text-red-300 font-medium">© {new Date().getFullYear()} All Rights Reserved.</span>
            </div>
          </div>
        </footer>
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
      <Route path="/" element={isAuthenticated ? <Navigate to={`/${role}`} replace /> : <Navigate to="/login" replace />} />

      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute allowedRole="student"><AppLayout><StudentDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/student/announcements" element={<ProtectedRoute allowedRole="student"><AppLayout><StudentAnnouncements /></AppLayout></ProtectedRoute>} />
      <Route path="/student/campus" element={<ProtectedRoute allowedRole="student"><AppLayout><CampusLive /></AppLayout></ProtectedRoute>} />
      <Route path="/student/complaints" element={<ProtectedRoute allowedRole="student"><AppLayout><ComplaintPortal /></AppLayout></ProtectedRoute>} />
      <Route path="/student/assignments" element={<ProtectedRoute allowedRole="student"><AppLayout><StudentAssignments /></AppLayout></ProtectedRoute>} />
      <Route path="/student/timetable" element={<ProtectedRoute allowedRole="student"><AppLayout><StudentTimetable /></AppLayout></ProtectedRoute>} />
      <Route path="/student/attendance" element={<ProtectedRoute allowedRole="student"><AppLayout><StudentAttendance /></AppLayout></ProtectedRoute>} />
      <Route path="/student/materials" element={<ProtectedRoute allowedRole="student"><AppLayout><StudentStudyMaterials /></AppLayout></ProtectedRoute>} />
      <Route path="/student/clubs" element={<ProtectedRoute allowedRole="student"><AppLayout><StudentClubs /></AppLayout></ProtectedRoute>} />
      <Route path="/student/events" element={<ProtectedRoute allowedRole="student"><AppLayout><StudentEvents /></AppLayout></ProtectedRoute>} />
      <Route path="/student/career" element={<ProtectedRoute allowedRole="student"><AppLayout><StudentCareer /></AppLayout></ProtectedRoute>} />
      <Route path="/student/skills" element={<ProtectedRoute allowedRole="student"><AppLayout><StudentSkillTracker /></AppLayout></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute allowedRole="admin"><AppLayout><CampusAnalytics /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/complaints" element={<ProtectedRoute allowedRole="admin"><AppLayout><ComplaintManagement /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<ProtectedRoute allowedRole="admin"><AppLayout><Announcements /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/assignments" element={<ProtectedRoute allowedRole="admin"><AppLayout><AdminAssignments /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/timetable" element={<ProtectedRoute allowedRole="admin"><AppLayout><AdminTimetable /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute allowedRole="admin"><AppLayout><AdminAttendance /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/materials" element={<ProtectedRoute allowedRole="admin"><AppLayout><AdminStudyMaterials /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/teachers" element={<ProtectedRoute allowedRole="admin"><AppLayout><TeacherManagement /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute allowedRole="admin"><AppLayout><StudentData /></AppLayout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
