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
    <nav ref={dropdownRef} className="bg-white/70 backdrop-blur-3xl flex items-center justify-between px-6 sm:px-8 lg:px-10 border-b border-slate-200/50 z-40 relative shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)]" style={{ minHeight: '80px' }}>
      <div className="flex items-center gap-4 sm:gap-6">
        {/* PROMINENT MENU BUTTON */}
        <div className="relative">
          <button onClick={() => { setShowNav(!showNav); setShowNotifications(false); setShowProfile(false); }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-300 active:scale-95 border ${showNav ? 'bg-rose-600 text-white border-rose-600 shadow-[0_8px_20px_-4px_rgba(225,29,72,0.3)]' : 'bg-white/80 text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 shadow-sm'}`}
            title="Open Navigation Menu">
            <Menu className="w-5 h-5" />
            <span className="hidden sm:inline tracking-wide">Menu</span>
          </button>
          {showNav && (
            <div className="absolute top-full left-0 mt-4 w-72 bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] animate-fade-in z-50 p-4 border border-slate-100">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 px-4 py-2 font-black border-b border-slate-100/50 mb-3">Navigation</p>
              <div className="space-y-1.5">
                {links.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <NavLink key={link.to} to={link.to} onClick={() => setShowNav(false)}
                      className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-95 ${isActive ? 'bg-rose-50 text-rose-600 border border-rose-100 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'}`}>
                      <link.icon className={`w-5 h-5 ${isActive ? 'text-rose-500' : 'text-slate-400'}`} />
                      {link.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 hidden sm:block">Smart<span className="text-rose-600">Campus</span></h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <span className="hidden lg:inline text-sm font-semibold text-slate-500 tracking-wide">Welcome back, <span className="text-slate-800 font-black">{firstName}</span></span>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => { setShowNotifications(!showNotifications); setShowNav(false); setShowProfile(false); }}
            className={`relative p-3 rounded-2xl transition-all active:scale-95 border ${showNotifications ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-sm' : 'bg-white/80 hover:bg-slate-50 text-slate-500 border-slate-200/80 hover:border-slate-300 shadow-sm'}`}>
            <Bell className="w-5 h-5" />
            {unreadAnnouncements.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 bg-rose-600 text-[10px] font-black rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm animate-pulse">{unreadAnnouncements.length}</span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-4 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] animate-fade-in z-50 border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100/50 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">Notifications</h3>
                {unreadAnnouncements.length > 0 && <button onClick={() => { markAllAsSeen(); setShowNotifications(false); }} className="text-xs font-black text-rose-500 hover:text-rose-600 transition-colors">Clear All</button>}
              </div>
              <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-50">
                {unreadAnnouncements.length > 0 ? unreadAnnouncements.slice(0,5).map(n => (
                  <div key={n.id} onClick={() => { markAsSeen(n.id); setShowNotifications(false); navigate(role==='admin'?'/admin/announcements':'/student/announcements'); }}
                    className="p-5 hover:bg-rose-50/50 cursor-pointer transition-colors group">
                    <p className="text-sm font-bold text-slate-800 truncate group-hover:text-rose-600 transition-colors">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{n.content}</p>
                  </div>
                )) : (
                  <div className="p-12 text-center"><Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" /><p className="text-sm text-slate-400 font-bold">All caught up!</p></div>
                )}
              </div>
              <div className="p-4 border-t border-slate-100/50 bg-slate-50/50">
                <NavLink to={role==='admin'?'/admin/announcements':'/student/announcements'} onClick={() => setShowNotifications(false)}
                  className="block text-center py-3 rounded-2xl text-xs font-black tracking-widest uppercase text-slate-500 hover:text-rose-600 hover:bg-white transition-all shadow-sm border border-transparent hover:border-slate-200/50">View All</NavLink>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button onClick={() => { setShowProfile(!showProfile); setShowNav(false); setShowNotifications(false); }}
            className={`flex items-center gap-3 p-1.5 sm:p-2 rounded-2xl transition-all active:scale-95 border ${showProfile ? 'bg-slate-50 border-slate-200' : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200/80 shadow-sm hover:shadow-sm'}`}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-800 flex items-center justify-center text-sm font-black text-white shadow-md">{firstName[0]}</div>
            <div className="text-left hidden lg:block pr-2">
              <p className="text-sm font-black text-slate-800 leading-none">{firstName}</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{role==='admin'?(user?.adminRole||'Admin'):'Student'}</p>
            </div>
          </button>
          {showProfile && (
            <div className="absolute right-0 top-full mt-4 w-72 bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] animate-fade-in z-50 border border-slate-100 p-4">
              <div className="p-5 border-b border-slate-100/50 mb-3 bg-slate-50/50 rounded-2xl">
                <p className="font-black text-base text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500 mt-1.5 font-mono bg-white inline-block px-2 py-0.5 rounded-md border border-slate-100">{role==='student'?`Roll: ${user?.roll}`:`ID: ${user?.id}`}</p>
                {user?.dept && <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide">Dept: {user.dept}</p>}
              </div>
              <div className="space-y-1.5">
                {role==='student' && (
                  <button onClick={() => { setShowProfile(false); setShowPwModal(true); }}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition-all border border-transparent hover:border-slate-100"><KeyRound className="w-5 h-5 text-slate-400" />Change Password</button>
                )}
                <button onClick={() => { logout(); setShowProfile(false); }}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-100 rounded-2xl transition-all active:scale-95 border border-transparent"><LogOut className="w-5 h-5 text-rose-500" />Sign Out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>

    {/* Password Modal */}
    {showPwModal && (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
          {pwSuccess ? (
            <div className="p-12 text-center"><div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5"><KeyRound className="w-10 h-10 text-emerald-500" /></div><h3 className="text-2xl font-black text-slate-800">Password Changed!</h3></div>
          ) : (
            <>
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-black text-slate-800">Change Password</h2>
                <button onClick={() => setShowPwModal(false)} className="p-2 bg-white rounded-full hover:bg-slate-100 transition-colors border border-slate-200"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              <div className="p-8 space-y-5">
                <input type="password" placeholder="Current password" value={pwForm.current} onChange={e=>setPwForm({...pwForm,current:e.target.value})} className="form-input" />
                <input type="password" placeholder="New password" value={pwForm.newPw} onChange={e=>setPwForm({...pwForm,newPw:e.target.value})} className="form-input" />
                <input type="password" placeholder="Confirm new password" value={pwForm.confirm} onChange={e=>setPwForm({...pwForm,confirm:e.target.value})} className="form-input" />
                {pwError && <p className="text-rose-600 text-sm bg-rose-50 border border-rose-100 p-4 rounded-xl font-medium">{pwError}</p>}
              </div>
              <div className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50/50">
                <button onClick={() => setShowPwModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handlePwChange} disabled={!pwForm.current||!pwForm.newPw||!pwForm.confirm} className="btn-primary flex-1">Update Password</button>
              </div>
            </>
          )}
        </div>
      </div>
    )}
    </>
  );
}
