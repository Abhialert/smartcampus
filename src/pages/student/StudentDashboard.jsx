import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import {
  Users,
  DoorOpen,
  Megaphone,
  MessageSquareWarning,
  MapPin,
  Clock,
  ArrowUpRight,
  ArrowRight,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { announcements, crowdData, vacantRooms, complaints, markAsSeen } = useApp();

  // Mark all announcements as seen when dashboard is loaded
  useEffect(() => {
    announcements.forEach(notice => {
      markAsSeen(notice.id);
    });
  }, [announcements, markAsSeen]);

  const vacantCount = vacantRooms.filter(r => r.isVacant).length;
  const totalRooms = vacantRooms.length;
  const crowdedZones = crowdData.filter(z => z.status === 'crowded').length;
  const myComplaints = complaints.filter(c => c.submittedBy === user?.roll);

  const statusCards = [
    {
      label: 'Vacant Rooms',
      value: `${vacantCount}/${totalRooms}`,
      icon: DoorOpen,
      color: 'from-emerald-400 to-green-500',
      bgColor: 'bg-emerald-500/20',
      link: '/student/campus',
      desc: 'Available for self-study'
    },
    {
      label: 'Crowded Zones',
      value: crowdedZones,
      icon: Users,
      color: 'from-orange-400 to-red-500',
      bgColor: 'bg-orange-500/20',
      link: '/student/campus',
      desc: 'Active GPS detection'
    },
    {
      label: 'Announcements',
      value: announcements.length,
      icon: Megaphone,
      color: 'from-accent-light to-blue-500',
      bgColor: 'bg-accent/20',
      link: '#notices',
      desc: 'Recent college updates'
    },
    {
      label: 'My Complaints',
      value: myComplaints.length,
      icon: MessageSquareWarning,
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-500/20',
      link: '/student/complaints',
      desc: 'Track your reports'
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Welcome Header */}
      <div className="animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Hi, <span className="text-accent-light underline decoration-accent/30">{user?.name?.split(' ')[0] || 'Student'}</span>! 👋
          </h1>
          <p className="text-text-secondary text-lg font-medium mt-2">Welcome to your SmartCampus command center.</p>
        </div>
        <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-accent/20">
          <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
          <span className="text-sm font-bold text-text-primary tracking-wide uppercase">System Live: Techno Main</span>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
        {statusCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="glass-strong rounded-3xl p-7 hover:border-accent/40 transition-all duration-300 group cursor-pointer border-white/5 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${card.bgColor} blur-3xl -mr-12 -mt-12 transition-all group-hover:scale-150`} />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className={`w-14 h-14 rounded-2xl ${card.bgColor} flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform`}>
                <card.icon className="w-7 h-7 text-white" />
              </div>
              <ArrowUpRight className="w-6 h-6 text-text-muted group-hover:text-accent-light transition-all" />
            </div>
            <p className="text-4xl font-black tracking-tighter relative z-10">{card.value}</p>
            <p className="text-base font-bold text-text-primary mt-2 relative z-10">{card.label}</p>
            <p className="text-xs text-text-muted mt-1 relative z-10">{card.desc}</p>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Announcements */}
        <div className="lg:col-span-2 glass-strong rounded-3xl overflow-hidden animate-fade-in border-white/5 shadow-2xl">
          <div className="p-7 border-b border-glass-border flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-accent-light" />
              </div>
              <div>
                <h2 className="text-xl font-black">Official Notices</h2>
                <p className="text-xs text-text-muted">Stay updated with latest announcements</p>
              </div>
            </div>
            <button className="px-6 py-2.5 rounded-xl bg-surface/50 text-xs font-bold hover:bg-surface transition-all">
              View All
            </button>
          </div>
          <div className="divide-y divide-glass-border">
            {announcements.map((notice) => (
              <div key={notice.id} className="p-7 hover:bg-accent/5 transition-all group">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                        notice.priority === 'high' ? 'bg-danger/20 text-danger border border-danger/30' :
                        notice.priority === 'medium' ? 'bg-warning/20 text-warning border border-warning/30' :
                        'bg-info/20 text-info border border-info/30'
                      }`}>
                        {notice.priority}
                      </span>
                      <span className="text-xs text-text-muted font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {notice.date}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold group-hover:text-accent-light transition-colors">{notice.title}</h3>
                    <p className="text-text-secondary text-sm mt-3 leading-relaxed font-medium">{notice.content}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold">
                         {notice.author[0]}
                      </div>
                      <span className="text-[11px] text-text-muted font-bold tracking-tight">Published by {notice.author}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar Collumn */}
        <div className="space-y-8">
          {/* Live Campus Monitor */}
          <div className="glass-strong rounded-3xl overflow-hidden animate-fade-in border-white/5 shadow-2xl">
            <div className="p-6 border-b border-glass-border flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <h3 className="font-black text-sm tracking-widest uppercase">Live Monitor</h3>
              </div>
              <RefreshCw className="w-4 h-4 text-text-muted animate-spin-slow" />
            </div>
            <div className="p-6 space-y-5">
              {crowdData.filter(z => ['canteen', 'library', 'stationery'].includes(z.id)).map((zone) => (
                <div key={zone.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface/50 border border-white/5 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-accent-light" />
                      </div>
                      <div>
                        <span className="text-sm font-black block leading-none">{zone.name}</span>
                        <span className="text-[10px] text-text-muted font-bold uppercase mt-1 block">{zone.status}</span>
                      </div>
                    </div>
                    <span className="text-xl font-black text-text-primary">{zone.crowd}</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-1000 shadow-lg"
                      style={{
                        width: `${Math.min((zone.crowd / 50) * 100, 100)}%`,
                        backgroundColor: zone.status === 'crowded' ? '#ef4444' : zone.status === 'moderate' ? '#f59e0b' : '#22c55e',
                      }}
                    />
                  </div>
                </div>
              ))}
              <Link
                to="/student/campus"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-accent text-white font-black text-sm hover:bg-accent-glow transition-all shadow-lg active:scale-95"
              >
                Access Detailed Campus Map <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Support - Large Buttons */}
          <div className="glass-strong rounded-3xl p-6 border-white/5 shadow-2xl bg-gradient-to-br from-surface to-primary">
            <h3 className="font-black text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
               <Shield className="w-4 h-4 text-accent-light" />
               Support & Reports
            </h3>
            <div className="space-y-4">
              <Link
                to="/student/complaints"
                className="flex items-center gap-5 p-5 rounded-2xl bg-danger/10 border border-danger/20 hover:bg-danger/20 transition-all group active:scale-95"
              >
                <div className="w-14 h-14 rounded-2xl bg-danger/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <MessageSquareWarning className="w-7 h-7 text-danger" />
                </div>
                <div>
                  <p className="text-lg font-black text-text-primary">File Urgent Report</p>
                  <p className="text-xs font-bold text-text-muted uppercase">Ragging, Infra, Services</p>
                </div>
              </Link>
              
              <Link
                to="/student/campus"
                className="flex items-center gap-5 p-5 rounded-2xl bg-success/10 border border-success/20 hover:bg-success/20 transition-all group active:scale-95"
              >
                <div className="w-14 h-14 rounded-2xl bg-success/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <DoorOpen className="w-7 h-7 text-success" />
                </div>
                <div>
                  <p className="text-lg font-black text-text-primary">Locate Empty Hub</p>
                  <p className="text-xs font-bold text-text-muted uppercase">{vacantCount} rooms ready now</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
