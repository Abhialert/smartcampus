import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Users, DoorOpen, Megaphone, MessageSquareWarning, MapPin, Clock, ArrowRight, ArrowUpRight, Shield, BookOpen, UserCheck, BookMarked, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { subjectCodes } from '../../data/campusData';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { announcements, crowdData, vacantRooms, complaints, assignments, attendanceRecords } = useApp();

  const vacantCount = vacantRooms.filter(r => r.isVacant).length;
  const totalRooms = vacantRooms.length;
  const myComplaints = complaints.filter(c => c.submittedBy === user?.roll);
  const myAssignments = assignments.filter(a => {
    const roll = (user?.roll || '').toLowerCase();
    return roll >= (a.rollFrom || '').toLowerCase() && roll <= (a.rollTo || 'zzz').toLowerCase();
  });
  const pendingAssignments = myAssignments.filter(a => new Date(a.dueDate) > new Date());

  // Calculate attendance
  const myAttendance = attendanceRecords.filter(r => r.records?.some(s => s.roll === user?.roll));
  const totalClasses = myAttendance.length;
  const presentClasses = myAttendance.filter(r => r.records?.find(s => s.roll === user?.roll)?.present).length;
  const attendancePercent = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  // Subject list for current student
  const mySubjects = subjectCodes[user?.dept]?.[user?.year] || [];

  const statusCards = [
    { label: 'Vacant Rooms', value: `${vacantCount}/${totalRooms}`, icon: DoorOpen, bgColor: 'bg-emerald-50', textColor: 'text-emerald-500', link: '/student/campus', desc: 'Available now' },
    { label: 'Assignments', value: pendingAssignments.length, icon: BookOpen, bgColor: 'bg-red-50', textColor: 'text-red-500', link: '/student/assignments', desc: `${myAssignments.length} total` },
    { label: 'Attendance', value: `${attendancePercent}%`, icon: UserCheck, bgColor: 'bg-blue-50', textColor: 'text-blue-500', link: '/student/attendance', desc: `${presentClasses}/${totalClasses} classes` },
    { label: 'My Reports', value: myComplaints.length, icon: MessageSquareWarning, bgColor: 'bg-purple-50', textColor: 'text-purple-500', link: '/student/complaints', desc: 'Track issues' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">
            Hi, <span className="text-red-500">{user?.name?.split(' ')[0] || 'Student'}</span>! 👋
          </h1>
          <p className="text-gray-500 text-lg font-medium mt-2">Welcome to your SmartCampus dashboard.</p>
          <div className="flex items-center gap-4 mt-3">
            <span className="text-sm font-bold bg-red-50 text-red-500 px-3 py-1.5 rounded-lg border border-red-100">{user?.dept || 'N/A'} • Year {user?.year || '?'}{user?.section ? ` • Sec ${user.section}` : ''}</span>
            <span className="text-sm font-mono text-gray-400">{user?.roll}</span>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur px-5 py-3 rounded-2xl flex items-center gap-3 border border-gray-100 shadow-sm">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-bold text-gray-700 tracking-wide uppercase">System Live</span>
        </div>
      </div>

      {/* Attendance Alert */}
      {totalClasses > 0 && attendancePercent < 75 && (
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 flex items-center gap-5 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0"><UserCheck className="w-7 h-7 text-amber-600" /></div>
          <div className="flex-1">
            <p className="text-lg font-bold text-amber-800">⚠️ Attendance Low — {attendancePercent}%</p>
            <p className="text-sm text-amber-600 mt-1">You need 75% minimum attendance. Attend more classes to avoid shortage.</p>
          </div>
          <Link to="/student/attendance" className="btn-primary shrink-0 bg-amber-500 shadow-amber-200 hover:bg-amber-600">View Details</Link>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        {statusCards.map((card) => (
          <Link key={card.label} to={card.link}
            className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer border border-gray-100 relative overflow-hidden active:scale-[0.98] card-hover">
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className={`w-12 h-12 rounded-2xl ${card.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-red-400 transition-all" />
            </div>
            <p className="text-3xl font-black tracking-tight text-gray-900">{card.value}</p>
            <p className="text-base font-bold text-gray-700 mt-1.5">{card.label}</p>
            <p className="text-sm text-gray-400 mt-0.5">{card.desc}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Announcements */}
        <div className="lg:col-span-2 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center"><Megaphone className="w-5 h-5 text-red-500" /></div>
              <div><h2 className="text-lg font-bold text-gray-800">Official Notices</h2><p className="text-sm text-gray-400">Latest updates</p></div>
            </div>
            <Link to="/student/announcements" className="px-4 py-2.5 rounded-xl bg-gray-50 text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all">View All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {announcements.length > 0 ? announcements.slice(0,3).map((notice) => (
              <div key={notice.id} className="p-6 hover:bg-red-50/30 transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`badge ${notice.priority==='high'?'bg-red-100 text-red-500':notice.priority==='medium'?'bg-amber-100 text-amber-600':'bg-cyan-100 text-cyan-600'}`}>{notice.priority}</span>
                  <span className="text-sm text-gray-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{notice.date}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-500 transition-colors">{notice.title}</h3>
                <p className="text-gray-500 mt-2 leading-relaxed line-clamp-2">{notice.content}</p>
              </div>
            )) : <div className="p-12 text-center text-gray-400 text-base">No announcements yet</div>}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Live Monitor */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" /><h3 className="font-bold text-sm text-gray-700 uppercase tracking-wider">Live Monitor</h3></div>
            </div>
            <div className="p-5 space-y-4">
              {crowdData.filter(z => ['canteen','library','stationery'].includes(z.id)).map((zone) => (
                <div key={zone.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-red-400" /><span className="text-sm font-bold text-gray-700">{zone.name}</span></div>
                    <span className="text-lg font-black text-gray-800">{zone.crowd}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((zone.crowd/50)*100,100)}%`, backgroundColor: zone.status==='crowded'?'#ef4444':zone.status==='moderate'?'#f59e0b':'#22c55e' }} />
                  </div>
                </div>
              ))}
              <Link to="/student/campus" className="btn-primary w-full mt-2">
                Campus Map <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-red-400" />Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/student/complaints" className="flex items-center gap-4 p-4 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100/50 transition-all group active:scale-95">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><MessageSquareWarning className="w-5 h-5 text-red-500" /></div>
                <div><p className="text-base font-bold text-gray-800">File Report</p><p className="text-sm text-gray-400">Ragging, Infra, Lost items</p></div>
              </Link>
              <Link to="/student/materials" className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100/50 transition-all group active:scale-95">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center"><BookMarked className="w-5 h-5 text-blue-500" /></div>
                <div><p className="text-base font-bold text-gray-800">Study Materials</p><p className="text-sm text-gray-400">Notes, PYQs, references</p></div>
              </Link>
              <Link to="/student/campus" className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/50 transition-all group active:scale-95">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><DoorOpen className="w-5 h-5 text-emerald-500" /></div>
                <div><p className="text-base font-bold text-gray-800">Find Room</p><p className="text-sm text-gray-400">{vacantCount} rooms available</p></div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Bar */}
      {mySubjects.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-fade-in">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-red-400" />Your Subjects — {user?.dept} Year {user?.year}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {mySubjects.map(s => (
              <div key={s.code} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-red-50 hover:border-red-100 transition-all">
                <p className="text-xs font-bold text-red-500 font-mono">{s.code}</p>
                <p className="text-sm font-semibold text-gray-800 mt-1 line-clamp-1">{s.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.credits} credits</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
