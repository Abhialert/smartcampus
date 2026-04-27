import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Users, MessageSquareWarning, Megaphone, ArrowUpRight, MapPin, AlertTriangle, BookOpen, UserCheck, Calendar, ClipboardList, BarChart3, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { complaints, announcements, crowdData, registeredStudents, assignments, attendanceRecords, teachers } = useApp();

  const pendingComplaints = complaints.filter(c => c.status === 'pending');
  const totalPeople = crowdData.reduce((sum, z) => sum + z.crowd, 0);
  const crowdedZones = crowdData.filter(z => z.status === 'crowded');
  const raggingComplaints = complaints.filter(c => c.category === 'ragging' && c.status === 'pending');

  const getHour = () => { const h = new Date().getHours(); if (h < 12) return 'Good Morning'; if (h < 17) return 'Good Afternoon'; return 'Good Evening'; };

  const summaryCards = [
    { label: 'Registered Students', value: registeredStudents.length, sub: `${new Set(registeredStudents.map(s => s.dept)).size} departments`, icon: Users, bgColor: 'bg-blue-50', textColor: 'text-blue-500', link: '/admin/students' },
    { label: 'Complaints', value: complaints.length, sub: `${pendingComplaints.length} pending`, icon: MessageSquareWarning, bgColor: 'bg-orange-50', textColor: 'text-orange-500', link: '/admin/complaints' },
    { label: 'Announcements', value: announcements.length, sub: 'Active notices', icon: Megaphone, bgColor: 'bg-emerald-50', textColor: 'text-emerald-500', link: '/admin/announcements' },
    { label: 'Assignments', value: assignments.length, sub: `${assignments.filter(a => new Date(a.dueDate) > new Date()).length} active`, icon: BookOpen, bgColor: 'bg-red-50', textColor: 'text-red-500', link: '/admin/assignments' },
    { label: 'Campus Crowd', value: totalPeople, sub: `${crowdedZones.length} crowded zones`, icon: BarChart3, bgColor: 'bg-cyan-50', textColor: 'text-cyan-500', link: '/admin/analytics' },
    { label: 'Teachers', value: teachers.length, sub: 'Faculty members', icon: Shield, bgColor: 'bg-purple-50', textColor: 'text-purple-500', link: '/admin/teachers' },
  ];

  const quickLinks = [
    { label: 'Student Data', desc: 'Upload & manage students', icon: Users, link: '/admin/students', color: 'bg-blue-50 border-blue-100 hover:bg-blue-100/50', iconBg: 'bg-blue-100', iconColor: 'text-blue-500' },
    { label: 'Mark Attendance', desc: 'Take class attendance', icon: UserCheck, link: '/admin/attendance', color: 'bg-green-50 border-green-100 hover:bg-green-100/50', iconBg: 'bg-green-100', iconColor: 'text-green-500' },
    { label: 'Timetable', desc: 'Upload PDF / Excel', icon: Calendar, link: '/admin/timetable', color: 'bg-amber-50 border-amber-100 hover:bg-amber-100/50', iconBg: 'bg-amber-100', iconColor: 'text-amber-500' },
    { label: 'Announcements', desc: 'Post campus notices', icon: Megaphone, link: '/admin/announcements', color: 'bg-red-50 border-red-100 hover:bg-red-100/50', iconBg: 'bg-red-100', iconColor: 'text-red-500' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">
          {getHour()}, <span className="text-red-500">{user?.name?.split(' ')[0] || 'Admin'}</span> 🛡️
        </h1>
        <p className="text-gray-500 text-base mt-2">Campus administration overview • <span className="capitalize font-semibold">{user?.adminRole || 'Admin'}</span></p>
      </div>

      {/* Ragging Alert */}
      {raggingComplaints.length > 0 && (
        <div className="bg-red-50 rounded-2xl p-6 border border-red-200 flex items-center gap-5 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center shrink-0"><AlertTriangle className="w-7 h-7 text-red-500" /></div>
          <div className="flex-1">
            <p className="text-lg font-bold text-red-700">⚠️ {raggingComplaints.length} Ragging Report(s) — Immediate Action Required</p>
            <p className="text-sm text-red-500 mt-1">These require your urgent attention under anti-ragging regulations.</p>
          </div>
          <Link to="/admin/complaints" className="btn-primary shrink-0">Review Now</Link>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
        {summaryCards.map((card) => (
          <Link key={card.label} to={card.link}
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all group active:scale-[0.98] card-hover">
            <div className="flex items-center justify-between mb-5">
              <div className={`w-12 h-12 rounded-2xl ${card.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}><card.icon className={`w-6 h-6 ${card.textColor}`} /></div>
              <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-red-400 transition-all" />
            </div>
            <p className="text-3xl font-black text-gray-900">{card.value}</p>
            <p className="text-sm font-bold text-gray-700 mt-1">{card.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-red-400" />Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {quickLinks.map((q) => (
            <Link key={q.label} to={q.link} className={`flex items-center gap-4 p-5 rounded-2xl border transition-all group active:scale-[0.98] ${q.color}`}>
              <div className={`w-12 h-12 rounded-xl ${q.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}><q.icon className={`w-6 h-6 ${q.iconColor}`} /></div>
              <div>
                <p className="text-base font-bold text-gray-800">{q.label}</p>
                <p className="text-sm text-gray-500">{q.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><MessageSquareWarning className="w-5 h-5 text-amber-500" /></div>
              <h2 className="text-base font-bold text-gray-800">Recent Complaints</h2>
            </div>
            <Link to="/admin/complaints" className="px-4 py-2.5 rounded-xl bg-gray-50 text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all">View All →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {complaints.slice(0,4).map(c => (
              <div key={c.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-gray-800 truncate">{c.title}</p>
                    <p className="text-sm text-gray-400 mt-1">{c.date} • {c.submittedName}</p>
                  </div>
                  <span className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-bold ${c.status==='pending'?'bg-amber-100 text-amber-600':c.status==='in-progress'?'bg-blue-100 text-blue-600':'bg-green-100 text-green-600'}`}>{c.status}</span>
                </div>
              </div>
            ))}
            {complaints.length === 0 && <div className="p-10 text-center text-gray-400 text-base">No complaints yet</div>}
          </div>
        </div>

        {/* Live Campus */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <h2 className="text-base font-bold text-gray-800">Live Campus Feed</h2>
            </div>
            <Link to="/admin/analytics" className="px-4 py-2.5 rounded-xl bg-gray-50 text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all">Analytics →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {crowdData.slice(0,6).map(zone => (
              <div key={zone.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-400" /><span className="text-base text-gray-700 font-medium">{zone.name}</span></div>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((zone.crowd/50)*100,100)}%`, backgroundColor: zone.status==='crowded'?'#ef4444':zone.status==='moderate'?'#f59e0b':'#22c55e' }} />
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-8 text-right">{zone.crowd}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
