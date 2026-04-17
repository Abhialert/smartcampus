import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import {
  Users,
  MessageSquareWarning,
  Megaphone,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { complaints, announcements, crowdData } = useApp();

  const pendingComplaints = complaints.filter(c => c.status === 'pending');
  const inProgressComplaints = complaints.filter(c => c.status === 'in-progress');
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved');
  const totalPeople = crowdData.reduce((sum, z) => sum + z.crowd, 0);
  const crowdedZones = crowdData.filter(z => z.status === 'crowded');
  const raggingComplaints = complaints.filter(c => c.category === 'ragging' && c.status === 'pending');

  const getHour = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const summaryCards = [
    {
      label: 'Total Complaints',
      value: complaints.length,
      sub: `${pendingComplaints.length} pending`,
      icon: MessageSquareWarning,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      link: '/admin/complaints',
    },
    {
      label: 'Campus Crowd',
      value: totalPeople,
      sub: `${crowdedZones.length} crowded zones`,
      icon: Users,
      color: 'from-accent to-blue-500',
      bgColor: 'bg-accent/10',
      link: '/admin/analytics',
    },
    {
      label: 'Announcements',
      value: announcements.length,
      sub: 'Active notices',
      icon: Megaphone,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-500/10',
      link: '/admin/announcements',
    },
    {
      label: 'Resolved',
      value: resolvedComplaints.length,
      sub: `of ${complaints.length} total`,
      icon: CheckCircle2,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      link: '/admin/complaints',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold">
          {getHour()}, <span className="bg-gradient-to-r from-accent-light to-blue-300 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Admin'}</span> 🛡️
        </h1>
        <p className="text-text-muted text-sm mt-1">Campus administration overview</p>
      </div>

      {/* Urgent Alert */}
      {raggingComplaints.length > 0 && (
        <div className="glass rounded-xl p-4 border border-danger/30 bg-danger/5 flex items-center gap-4 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-danger/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-danger" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-danger">Urgent: {raggingComplaints.length} Ragging Report(s) Pending</p>
            <p className="text-xs text-text-muted mt-0.5">Requires immediate attention from administration</p>
          </div>
          <Link
            to="/admin/complaints"
            className="px-4 py-2 rounded-xl bg-danger text-white text-xs font-medium hover:bg-red-600 transition-colors"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {summaryCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="glass rounded-xl p-5 hover:border-accent/20 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                <card.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-accent-light group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-text-muted mt-1">{card.label}</p>
            <p className="text-[10px] text-text-muted mt-0.5">{card.sub}</p>
          </Link>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="glass rounded-xl overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-glass-border flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <MessageSquareWarning className="w-4 h-4 text-warning" />
              Recent Complaints
            </h2>
            <Link to="/admin/complaints" className="text-xs text-accent-light hover:text-accent transition-colors">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-glass-border">
            {complaints.slice(0, 5).map((c) => (
              <div key={c.id} className="p-4 hover:bg-surface-light/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{c.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-text-muted">{c.date}</span>
                      <span className="text-[10px] text-text-muted">• {c.submittedName}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    c.status === 'pending' ? 'bg-warning/15 text-warning' :
                    c.status === 'in-progress' ? 'bg-info/15 text-info' :
                    'bg-success/15 text-success'
                  }`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Campus Status */}
        <div className="glass rounded-xl overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-glass-border flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              Live Campus Status
            </h2>
            <Link to="/admin/analytics" className="text-xs text-accent-light hover:text-accent transition-colors">
              Full Analytics →
            </Link>
          </div>
          <div className="divide-y divide-glass-border">
            {crowdData.slice(0, 6).map((zone) => (
              <div key={zone.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-sm">{zone.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-1.5 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((zone.crowd / 50) * 100, 100)}%`,
                        backgroundColor: zone.status === 'crowded' ? '#ef4444' : zone.status === 'moderate' ? '#f59e0b' : '#22c55e',
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium w-6 text-right">{zone.crowd}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    zone.status === 'crowded' ? 'bg-danger/15 text-danger' :
                    zone.status === 'moderate' ? 'bg-warning/15 text-warning' :
                    'bg-success/15 text-success'
                  }`}>
                    {zone.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
