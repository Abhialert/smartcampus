import { useAuth } from '../contexts/AuthContext';
import { Bell, LogOut, MoreVertical, LayoutDashboard, MapPin, MessageSquareWarning, BarChart3, Megaphone, ClipboardList, Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const studentLinks = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/campus', icon: MapPin, label: 'Campus Live' },
  { to: '/student/complaints', icon: MessageSquareWarning, label: 'Complaints' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/complaints', icon: ClipboardList, label: 'Complaints' },
  { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
];

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const { announcements, seenAnnouncements, markAllAsSeen } = useApp();
  const [showProfile, setShowProfile] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const links = role === 'admin' ? adminLinks : studentLinks;
  const unreadAnnouncements = announcements.filter(a => !seenAnnouncements.includes(a.id));

  return (
    <nav className="glass-strong h-18 flex items-center justify-between px-8 border-b border-white/10 z-40 relative">
      <div className="flex items-center gap-6">
        {/* 3-dot Menu Button */}
        <div className="relative">
          <button 
            onClick={() => { setShowNav(!showNav); setShowNotifications(false); setShowProfile(false); }}
            className={`p-3 rounded-2xl transition-all active:scale-95 ${showNav ? 'bg-accent/30 text-accent-light shadow-lg' : 'hover:bg-surface-light/60 text-text-secondary'}`}
            title="Menu"
          >
            <MoreVertical className="w-7 h-7" />
          </button>

          {showNav && (
            <div className="absolute top-full left-0 mt-3 w-72 glass-strong rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50 p-3 border border-glass-border">
              <p className="text-[11px] uppercase tracking-widest text-text-muted px-4 py-3 font-bold border-b border-glass-border mb-2">Campus Navigation</p>
              <div className="space-y-1.5">
                {links.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setShowNav(false)}
                      className={`flex items-center gap-4 px-5 py-4 rounded-xl text-base font-semibold transition-all group active:scale-95
                        ${isActive
                          ? 'bg-accent/20 text-accent-light border border-accent/30 shadow-inner'
                          : 'text-text-secondary hover:bg-surface-light/60 hover:text-text-primary'
                        }
                      `}
                    >
                      <link.icon className={`w-6 h-6 ${isActive ? 'text-accent-light' : 'group-hover:scale-110 transition-transform'}`} />
                      {link.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center shadow-lg transform rotate-3">
             <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-accent-light to-blue-200 bg-clip-text text-transparent">
            SmartCampus
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Notification bell */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowNav(false); setShowProfile(false); }}
            className={`relative p-3 rounded-2xl transition-all group active:scale-95 ${showNotifications ? 'bg-accent/30 text-accent-light shadow-lg' : 'hover:bg-surface-light/60'}`}
          >
            <Bell className={`w-6 h-6 ${showNotifications ? 'text-accent-light' : 'text-text-secondary'} group-hover:text-accent-light group-hover:rotate-12 transition-all`} />
            {unreadAnnouncements.length > 0 && (
              <span className="absolute top-2 right-2 min-w-5 h-5 px-1 bg-danger text-[10px] font-black rounded-full flex items-center justify-center text-white border-2 border-primary animate-pulse z-10">
                {unreadAnnouncements.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-3 w-80 glass-strong rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50 border border-glass-border">
              <div className="p-4 border-b border-glass-border flex items-center justify-between bg-white/5">
                <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">New Alerts</h3>
                {unreadAnnouncements.length > 0 && (
                  <button 
                    onClick={() => { markAllAsSeen(); setShowNotifications(false); }}
                    className="text-[10px] font-bold text-accent-light hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-glass-border">
                {unreadAnnouncements.length > 0 ? (
                  unreadAnnouncements.map((notice) => (
                    <div 
                      key={notice.id} 
                      onClick={() => {
                        markAsSeen(notice.id);
                        setShowNotifications(false);
                        navigate(role === 'admin' ? '/admin/announcements' : '/student/announcements');
                      }}
                      className="p-4 hover:bg-accent/5 transition-all cursor-pointer group/item"
                    >
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                          notice.priority === 'high' ? 'bg-danger/20 text-danger' : 
                          notice.priority === 'medium' ? 'bg-warning/20 text-warning' : 
                          'bg-info/20 text-info'
                        }`}>
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-text-primary truncate">{notice.title}</p>
                          <p className="text-[10px] text-text-muted mt-1 line-clamp-2 leading-relaxed">
                            {notice.content}
                          </p>
                          <p className="text-[9px] text-text-muted mt-2 flex items-center gap-1 group-hover/item:text-accent-light transition-colors">
                            <Sparkles className="w-2.5 h-2.5" /> Mark as read • {notice.priority} priority
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-surface/50 flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-6 h-6 text-text-muted/30" />
                    </div>
                    <p className="text-xs text-text-muted font-bold">No new notifications</p>
                    <p className="text-[10px] text-text-muted mt-1">You're all caught up!</p>
                  </div>
                )}
              </div>
              <div className="p-3 bg-surface/30 border-t border-glass-border">
                <NavLink 
                  to={role === 'admin' ? '/admin/announcements' : '/student/announcements'} 
                  onClick={() => setShowNotifications(false)}
                  className="block w-full text-center py-2 rounded-xl bg-surface/50 text-[10px] font-black uppercase tracking-tighter text-text-secondary hover:text-text-primary hover:bg-surface transition-all active:scale-95"
                >
                  See All Campus Activity
                </NavLink>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNav(false); setShowNotifications(false); }}
            className="flex items-center gap-4 p-1.5 rounded-2xl hover:bg-surface-light/60 transition-all border border-transparent hover:border-glass-border shadow-sm group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-glow to-blue-600 flex items-center justify-center text-base font-black text-white shadow-lg group-hover:scale-105 transition-transform">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="text-left hidden lg:block pr-2">
              <p className="text-sm font-bold text-text-primary leading-none">{user?.name || 'User'}</p>
              <p className="text-[10px] text-text-muted mt-1 uppercase tracking-tighter font-bold">{role} Portal</p>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-3 w-64 glass-strong rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50 border border-glass-border p-2">
              <div className="p-4 border-b border-glass-border mb-1">
                <p className="font-bold text-sm text-text-primary">{user?.name}</p>
                <p className="text-xs text-text-muted mt-1 font-mono">
                  {role === 'student' ? `Roll: ${user?.roll}` : `ID: ${user?.id}`}
                </p>
              </div>
              <button
                onClick={() => { logout(); setShowProfile(false); }}
                className="w-full flex items-center gap-3 px-4 py-4 text-sm font-bold text-danger hover:bg-danger/15 rounded-xl transition-all active:scale-95 transition-all"
              >
                <LogOut className="w-5 h-5" /> Sign Out from SmartCampus
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}


