import { useAuth } from '../contexts/AuthContext';
import { Bell, LogOut, Menu, LayoutDashboard, MapPin, MessageSquareWarning, BarChart3, Megaphone, ClipboardList, Sparkles, BookOpen, BookMarked, Calendar, UserCheck, KeyRound, X, Users, Database, Trophy, Briefcase, Target, PartyPopper } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const studentLinks = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/campus', icon: MapPin, label: 'Campus Live' },
  { to: '/student/clubs', icon: Trophy, label: 'Clubs' },
  { to: '/student/events', icon: PartyPopper, label: 'Events' },
  { to: '/student/assignments', icon: BookOpen, label: 'Assignments' },
  { to: '/student/materials', icon: BookMarked, label: 'Materials' },
  { to: '/student/timetable', icon: Calendar, label: 'Timetable' },
  { to: '/student/attendance', icon: UserCheck, label: 'Attendance' },
  { to: '/student/career', icon: Briefcase, label: 'Career Hub' },
  { to: '/student/skills', icon: Target, label: 'Skill Radar' },
  { to: '/student/complaints', icon: MessageSquareWarning, label: 'Complaints' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/students', icon: Database, label: 'Student Data' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/complaints', icon: ClipboardList, label: 'Complaints' },
  { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/admin/assignments', icon: BookOpen, label: 'Assignments' },
  { to: '/admin/materials', icon: BookMarked, label: 'Materials' },
  { to: '/admin/timetable', icon: Calendar, label: 'Timetable' },
  { to: '/admin/attendance', icon: UserCheck, label: 'Attendance' },
  { to: '/admin/teachers', icon: Users, label: 'Teachers' },
];

export default function Navbar() {
  const { user, role, logout, changePassword } = useAuth();
  const { announcements, seenAnnouncements, markAsSeen, markAllAsSeen } = useApp();
  const [showProfile, setShowProfile] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const links = role === 'admin' ? adminLinks : studentLinks;
  const unreadAnnouncements = announcements.filter(a => !seenAnnouncements.includes(a.id));
  const firstName = user?.name?.split(' ')[0] || 'User';

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNav(false); setShowNotifications(false); setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handlePwChange = async () => {
    setPwError('');
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match'); return; }
    if (pwForm.newPw.length < 4) { setPwError('Min 4 characters'); return; }
    const r = await changePassword(pwForm.current, pwForm.newPw);
    if (r.success) { setPwSuccess(true); setTimeout(() => { setShowPwModal(false); setPwSuccess(false); setPwForm({current:'',newPw:'',confirm:''}); }, 1500); }
    else setPwError(r.error);
  };

  return (
    <>
    <nav ref={dropdownRef} className="bg-white/95 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-gray-200/60 z-40 relative shadow-sm" style={{ minHeight: '64px' }}>
      <div className="flex items-center gap-3 sm:gap-5">
        {/* PROMINENT MENU BUTTON */}
        <div className="relative">
          <button onClick={() => { setShowNav(!showNav); setShowNotifications(false); setShowProfile(false); }}
            className={`flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl font-bold text-sm transition-all active:scale-95 border-2 ${showNav ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-200' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300'}`}
            title="Open Navigation Menu">
            <Menu className="w-5 h-5" />
            <span className="hidden sm:inline">Menu</span>
          </button>
          {showNav && (
            <div className="absolute top-full left-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl animate-fade-in z-50 p-3 border border-gray-100">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 px-3 py-2 font-bold border-b border-gray-100 mb-2">Navigation</p>
              <div className="space-y-1">
                {links.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <NavLink key={link.to} to={link.to} onClick={() => setShowNav(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 ${isActive ? 'bg-red-50 text-red-600 border border-red-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                      <link.icon className={`w-5 h-5 ${isActive ? 'text-red-500' : 'text-gray-400'}`} />
                      {link.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-black tracking-tight text-gray-900 hidden sm:block">Smart<span className="text-red-500">Campus</span></h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <span className="hidden lg:inline text-sm font-semibold text-gray-500">Welcome, <span className="text-red-600 font-bold">{firstName}</span></span>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => { setShowNotifications(!showNotifications); setShowNav(false); setShowProfile(false); }}
            className={`relative p-2.5 sm:p-3 rounded-xl transition-all active:scale-95 ${showNotifications ? 'bg-red-50 text-red-500' : 'hover:bg-gray-100 text-gray-500'}`}>
            <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            {unreadAnnouncements.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1.5 bg-red-500 text-[10px] font-bold rounded-full flex items-center justify-center text-white border-2 border-white animate-pulse">{unreadAnnouncements.length}</span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-2xl animate-fade-in z-50 border border-gray-100">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase text-gray-700">Notifications</h3>
                {unreadAnnouncements.length > 0 && <button onClick={() => { markAllAsSeen(); setShowNotifications(false); }} className="text-xs font-bold text-red-500 hover:underline">Clear</button>}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {unreadAnnouncements.length > 0 ? unreadAnnouncements.slice(0,5).map(n => (
                  <div key={n.id} onClick={() => { markAsSeen(n.id); setShowNotifications(false); navigate(role==='admin'?'/admin/announcements':'/student/announcements'); }}
                    className="p-4 hover:bg-red-50/50 cursor-pointer">
                    <p className="text-sm font-bold text-gray-800 truncate">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.content}</p>
                  </div>
                )) : (
                  <div className="p-10 text-center"><Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-400 font-semibold">All caught up!</p></div>
                )}
              </div>
              <div className="p-3 border-t border-gray-100">
                <NavLink to={role==='admin'?'/admin/announcements':'/student/announcements'} onClick={() => setShowNotifications(false)}
                  className="block text-center py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all">View All</NavLink>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button onClick={() => { setShowProfile(!showProfile); setShowNav(false); setShowNotifications(false); }}
            className="flex items-center gap-2.5 p-1.5 sm:p-2 rounded-xl hover:bg-gray-50 transition-all active:scale-95 border border-transparent hover:border-gray-100">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-sm font-bold text-white shadow-md">{firstName[0]}</div>
            <div className="text-left hidden lg:block pr-1">
              <p className="text-sm font-bold text-gray-800 leading-none">{firstName}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 uppercase font-bold">{role==='admin'?(user?.adminRole||'Admin'):'Student'}</p>
            </div>
          </button>
          {showProfile && (
            <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl animate-fade-in z-50 border border-gray-100 p-3">
              <div className="p-4 border-b border-gray-100 mb-2">
                <p className="font-bold text-base text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-400 mt-1 font-mono">{role==='student'?`Roll: ${user?.roll}`:`ID: ${user?.id}`}</p>
                {user?.dept && <p className="text-xs text-gray-400 mt-0.5">Dept: {user.dept}</p>}
              </div>
              {role==='student' && (
                <button onClick={() => { setShowProfile(false); setShowPwModal(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-all"><KeyRound className="w-5 h-5" />Change Password</button>
              )}
              <button onClick={() => { logout(); setShowProfile(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"><LogOut className="w-5 h-5" />Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </nav>

    {/* Password Modal */}
    {showPwModal && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
          {pwSuccess ? (
            <div className="p-10 text-center"><div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><KeyRound className="w-8 h-8 text-green-600" /></div><h3 className="text-xl font-bold">Password Changed!</h3></div>
          ) : (
            <>
              <div className="p-6 border-b border-gray-100 flex justify-between items-center"><h2 className="text-lg font-bold">Change Password</h2><button onClick={() => setShowPwModal(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
              <div className="p-6 space-y-4">
                <input type="password" placeholder="Current password" value={pwForm.current} onChange={e=>setPwForm({...pwForm,current:e.target.value})} className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300" />
                <input type="password" placeholder="New password" value={pwForm.newPw} onChange={e=>setPwForm({...pwForm,newPw:e.target.value})} className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300" />
                <input type="password" placeholder="Confirm new password" value={pwForm.confirm} onChange={e=>setPwForm({...pwForm,confirm:e.target.value})} className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300" />
                {pwError && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{pwError}</p>}
              </div>
              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button onClick={() => setShowPwModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-base text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handlePwChange} disabled={!pwForm.current||!pwForm.newPw||!pwForm.confirm} className="flex-1 py-3 rounded-xl bg-red-500 text-white text-base font-semibold disabled:opacity-30 hover:bg-red-600">Update</button>
              </div>
            </>
          )}
        </div>
      </div>
    )}
    </>
  );
}
