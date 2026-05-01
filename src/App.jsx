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
    <div className="flex h-screen overflow-hidden flex-col bg-slate-50 relative selection:bg-rose-200 selection:text-rose-900">
      {/* Elegant Ambient Background */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-rose-50/80 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-100/50 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-[100px] pointer-events-none" />

      <Navbar />
      <div className="flex-1 overflow-y-auto flex flex-col relative z-10 scroll-smooth">
        <main className="flex-1 p-6 md:p-10 lg:p-12 max-w-[1600px] mx-auto w-full shrink-0 pb-32">
          {children}
        </main>
        
        {/* Elegant Footer */}
        <footer className="bg-slate-900 text-slate-300 py-12 px-8 shrink-0 border-t border-slate-800 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h3 className="font-black text-2xl mb-1 tracking-tight text-white flex items-center gap-2 justify-center md:justify-start">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20">✨</span>
                Smart<span className="text-rose-500">Campus</span>
              </h3>
              <p className="text-slate-400 text-sm font-medium tracking-wide">Empowering minds, shaping the future.</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-3 text-sm font-medium">
              <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default"><span className="text-lg">📍</span> Techno Main Salt Lake, Kolkata</span>
              <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default"><span className="text-lg">📞</span> +91 33 2357 5683</span>
              <span className="mt-4 text-xs text-slate-500 tracking-widest uppercase">© {new Date().getFullYear()} All Rights Reserved.</span>
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
