import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Users, DoorOpen, Megaphone, MessageSquareWarning, MapPin, Clock, ArrowRight, ArrowUpRight, Shield, BookOpen, UserCheck, BookMarked, Calendar, Trophy, AlertTriangle, Zap, PartyPopper, Target, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { subjectCodes } from '../../data/campusData';
import { campusEvents, campusClubs } from '../../data/clubsData';
import { defaultPolls } from '../../data/careerData';
import { skillsByDept } from '../../data/careerData';

const POLL_VOTES_KEY = 'smartcampus_poll_votes';

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

  // Attendance
  const myAttendance = attendanceRecords.filter(r => r.records?.some(s => s.roll === user?.roll));
  const totalClasses = myAttendance.length;
  const presentClasses = myAttendance.filter(r => r.records?.find(s => s.roll === user?.roll)?.present).length;
  const attendancePercent = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  const mySubjects = subjectCodes[user?.dept]?.[user?.year] || [];

  // Karma auto-calculation
  const joinedClubs = JSON.parse(localStorage.getItem('smartcampus_joined_clubs') || '[]');
  const eventRsvps = JSON.parse(localStorage.getItem('smartcampus_event_rsvps') || '[]');
  const skillRatings = JSON.parse(localStorage.getItem('smartcampus_skill_ratings') || '{}');
  let karma = 0;
  karma += Math.round(attendancePercent * 0.5);
  karma += joinedClubs.length * 10;
  karma += eventRsvps.length * 8;
  karma += Object.keys(skillRatings).length * 3;
  const karmaLevel = karma >= 100 ? '🏆 Gold' : karma >= 50 ? '🥈 Silver' : '🥉 Bronze';

  // Upcoming events (next 7 days)
  const upcomingEvents = campusEvents.filter(e => {
    const d = Math.ceil((new Date(e.date) - new Date()) / (864e5));
    return d >= 0 && d <= 14;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Deadline countdowns
  const deadlines = pendingAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 4);

  // Attendance risk predictor
  const riskPredictions = [];
  if (totalClasses > 0) {
    for (let miss = 1; miss <= 3; miss++) {
      riskPredictions.push({ miss, pct: Math.round((presentClasses / (totalClasses + miss)) * 100) });
    }
  }

  // Polls
  const [pollVotes, setPollVotes] = useState(() => JSON.parse(localStorage.getItem(POLL_VOTES_KEY) || '{}'));
  const [polls, setPolls] = useState(defaultPolls);

  const votePoll = (pollId, optionIdx) => {
    if (pollVotes[pollId] !== undefined) return;
    const newVotes = { ...pollVotes, [pollId]: optionIdx };
    setPollVotes(newVotes);
    localStorage.setItem(POLL_VOTES_KEY, JSON.stringify(newVotes));
    setPolls(prev => prev.map(p => {
      if (p.id !== pollId) return p;
      const newV = [...p.votes];
      newV[optionIdx] += 1;
      return { ...p, votes: newV };
    }));
  };

  const statusCards = [
    { label: 'Vacant Rooms', value: `${vacantCount}/${totalRooms}`, icon: DoorOpen, bgColor: 'bg-emerald-50', textColor: 'text-emerald-500', link: '/student/campus', desc: 'Available now' },
    { label: 'Assignments', value: pendingAssignments.length, icon: BookOpen, bgColor: 'bg-red-50', textColor: 'text-red-500', link: '/student/assignments', desc: `${myAssignments.length} total` },
    { label: 'Attendance', value: `${attendancePercent}%`, icon: UserCheck, bgColor: 'bg-blue-50', textColor: 'text-blue-500', link: '/student/attendance', desc: `${presentClasses}/${totalClasses} classes` },
    { label: 'Campus Karma', value: karma, icon: Trophy, bgColor: 'bg-amber-50', textColor: 'text-amber-500', link: '/student/clubs', desc: karmaLevel },
  ];

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Hi, <span className="text-rose-600">{user?.name?.split(' ')[0] || 'Student'}</span>! 👋
          </h1>
          <p className="text-slate-500 text-lg font-medium mt-3">Welcome to your SmartCampus dashboard.</p>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-sm font-bold bg-rose-50 text-rose-600 px-4 py-2 rounded-xl border border-rose-100">{user?.dept || 'N/A'} • Year {user?.year || '?'}{user?.section ? ` • Sec ${user.section}` : ''}</span>
            <span className="text-sm font-mono text-slate-400 bg-white/50 px-3 py-1.5 rounded-xl border border-slate-200/50 backdrop-blur-sm">{user?.roll}</span>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-2xl px-6 py-4 rounded-3xl flex items-center gap-3 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <span className="text-sm font-black text-slate-700 tracking-widest uppercase">System Live</span>
        </div>
      </div>

      {/* Attendance Alert */}
      {totalClasses > 0 && attendancePercent < 75 && (
        <div className="bg-amber-50/80 backdrop-blur-xl rounded-3xl p-8 border border-amber-200/50 flex flex-col md:flex-row items-center gap-6 animate-fade-in shadow-[0_8px_30px_rgba(245,158,11,0.1)]">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0"><UserCheck className="w-8 h-8 text-amber-600" /></div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-xl font-black text-amber-900 tracking-tight">⚠️ Attendance Low — {attendancePercent}%</p>
            <p className="text-sm font-medium text-amber-700 mt-1">You need 75% minimum. Attend more classes to avoid shortage.</p>
          </div>
          <Link to="/student/attendance" className="btn-primary shrink-0 bg-amber-500 shadow-amber-200 hover:bg-amber-600 w-full md:w-auto">View Details</Link>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 stagger-children">
        {statusCards.map((card) => (
          <Link key={card.label} to={card.link}
            className="card-elegant p-6 sm:p-8 group cursor-pointer active:scale-[0.98]">
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className={`w-14 h-14 rounded-2xl ${card.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <card.icon className={`w-7 h-7 ${card.textColor}`} />
              </div>
              <ArrowUpRight className="w-6 h-6 text-slate-300 group-hover:text-rose-500 transition-colors" />
            </div>
            <p className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900">{card.value}</p>
            <p className="text-base font-bold text-slate-700 mt-2">{card.label}</p>
            <p className="text-sm font-medium text-slate-400 mt-1">{card.desc}</p>
          </Link>
        ))}
      </div>

      {/* Deadline Countdown + Attendance Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deadline Countdown */}
        <div className="card-elegant overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100/50 flex items-center justify-between bg-white/40">
            <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center"><Zap className="w-4 h-4 text-rose-500" /></div><h3 className="font-black text-xs text-slate-700 uppercase tracking-widest">Deadline Countdown</h3></div>
            <Link to="/student/assignments" className="text-xs font-black tracking-widest uppercase text-rose-500 hover:text-rose-600 transition-colors">View All</Link>
          </div>
          <div className="p-6 sm:p-8 space-y-4 flex-1 bg-white/20">
            {deadlines.length > 0 ? deadlines.map(a => {
              const days = Math.ceil((new Date(a.dueDate) - new Date()) / (864e5));
              const urgency = days <= 2 ? 'border-red-200 bg-red-50' : days <= 5 ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50';
              const urgText = days <= 2 ? 'text-red-600' : days <= 5 ? 'text-amber-600' : 'text-green-600';
              return (
                <div key={a.id} className={`p-4 rounded-xl border-2 ${urgency} transition-all`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{a.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{a.subject || 'General'}</p>
                    </div>
                    <div className={`text-right ${urgText}`}>
                      <p className="text-2xl font-black">{days}</p>
                      <p className="text-[10px] font-bold uppercase">day{days !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 text-gray-400"><p className="text-3xl mb-2">🎉</p><p className="font-bold">No deadlines!</p></div>
            )}
          </div>
        </div>

        {/* Attendance Risk Predictor */}
        <div className="card-elegant overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100/50 flex items-center gap-3 bg-white/40">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-amber-500" /></div>
            <h3 className="font-black text-xs text-slate-700 uppercase tracking-widest">Attendance Risk Predictor</h3>
          </div>
          <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center bg-white/20">
            {totalClasses > 0 ? (
              <>
                {/* Current gauge */}
                <div className="flex items-center justify-center mb-5">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke={attendancePercent >= 75 ? '#22c55e' : '#ef4444'} strokeWidth="10"
                        strokeDasharray={`${attendancePercent * 3.14} ${314 - attendancePercent * 3.14}`} strokeLinecap="round" className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-2xl font-black text-gray-900">{attendancePercent}%</p>
                      <p className="text-[10px] text-gray-400 font-bold">Current</p>
                    </div>
                  </div>
                </div>
                {/* Predictions */}
                <div className="space-y-2">
                  {riskPredictions.map(r => (
                    <div key={r.miss} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 font-bold w-24">Miss {r.miss} more →</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${r.pct}%`, backgroundColor: r.pct >= 75 ? '#22c55e' : '#ef4444' }} />
                      </div>
                      <span className={`text-sm font-black w-12 text-right ${r.pct >= 75 ? 'text-green-600' : 'text-red-500'}`}>{r.pct}%</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-gray-400 text-center mt-2">75% minimum required to avoid shortage</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400"><BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-200" /><p className="font-bold text-sm">No attendance data yet</p></div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Announcements */}
        <div className="lg:col-span-2 card-elegant overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-100/50 flex items-center justify-between bg-white/40">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center"><Megaphone className="w-6 h-6 text-rose-500" /></div>
              <div><h2 className="text-xl font-black text-slate-800 tracking-tight">Official Notices</h2><p className="text-sm font-medium text-slate-400">Latest updates from administration</p></div>
            </div>
            <Link to="/student/announcements" className="px-5 py-3 rounded-2xl bg-white shadow-sm border border-slate-100 text-xs font-black tracking-widest uppercase text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-all">View All</Link>
          </div>
          <div className="divide-y divide-slate-100/50 bg-white/20">
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
        <div className="space-y-8">
          {/* Upcoming Events */}
          <div className="card-elegant overflow-hidden">
            <div className="p-6 border-b border-slate-100/50 flex items-center justify-between bg-white/40">
              <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center"><PartyPopper className="w-4 h-4 text-indigo-500" /></div><h3 className="font-black text-xs text-slate-700 uppercase tracking-widest">Upcoming Events</h3></div>
              <Link to="/student/events" className="text-xs font-black tracking-widest uppercase text-indigo-500 hover:text-indigo-600 transition-colors">All</Link>
            </div>
            <div className="p-6 space-y-3 bg-white/20">
              {upcomingEvents.length > 0 ? upcomingEvents.slice(0, 3).map(evt => {
                const club = campusClubs.find(c => c.id === evt.club);
                const days = Math.ceil((new Date(evt.date) - new Date()) / (864e5));
                return (
                  <Link to="/student/events" key={evt.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-red-50 hover:border-red-100 transition-all">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: (club?.color || '#ef4444') + '15' }}>{club?.emoji || '🎪'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{evt.title}</p>
                      <p className="text-[10px] text-gray-400">{evt.date} • {days === 0 ? 'Today!' : `${days}d away`}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${evt.type === 'inter' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                      {evt.type === 'inter' ? '🌐' : '🏠'}
                    </span>
                  </Link>
                );
              }) : <p className="text-center py-6 text-gray-400 text-sm font-bold">No upcoming events</p>}
            </div>
          </div>

          {/* Live Monitor */}
          <div className="card-elegant overflow-hidden">
            <div className="p-6 border-b border-slate-100/50 flex items-center justify-between bg-white/40">
              <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" /></div><h3 className="font-black text-xs text-slate-700 uppercase tracking-widest">Live Monitor</h3></div>
            </div>
            <div className="p-6 space-y-6 bg-white/20">
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
              <Link to="/student/campus" className="btn-primary w-full mt-2">Campus Map <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </div>
      </div>

      {/* Campus Polls */}
      <div className="card-elegant overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100/50 flex items-center gap-4 bg-white/40">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl shadow-sm">🗳️</div>
          <h3 className="font-black text-sm text-slate-800 uppercase tracking-widest">Campus Polls — Vote Now!</h3>
        </div>
        {(() => {
          const activeUnvotedPolls = polls.filter(p => p.active && pollVotes[p.id] === undefined);
          if (activeUnvotedPolls.length === 0) {
            return (
              <div className="p-10 text-center">
                <span className="text-4xl mb-3 block">✅</span>
                <p className="text-base font-bold text-gray-800">All caught up!</p>
                <p className="text-xs text-gray-400 mt-1">You've answered all active campus polls. Check back later.</p>
              </div>
            );
          }
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              {activeUnvotedPolls.map(poll => (
                <div key={poll.id} className="p-5 animate-fade-in">
                  <p className="text-sm font-bold text-gray-800 mb-3">{poll.question}</p>
                  <div className="space-y-2">
                    {poll.options.map((opt, idx) => (
                      <button key={idx} onClick={() => votePoll(poll.id, idx)}
                        className="w-full text-left p-3 rounded-xl text-sm font-semibold transition-all relative overflow-hidden border-2 border-gray-100 bg-gray-50 hover:border-red-300 hover:bg-red-50 active:scale-95 group">
                        <span className="text-gray-700 group-hover:text-red-600 transition-colors">{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Quick Actions */}
      <div className="card-elegant p-6 sm:p-8">
        <h3 className="font-black text-xs text-slate-700 uppercase tracking-widest mb-6 flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center"><Shield className="w-4 h-4 text-slate-500" /></div>Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <Link to="/student/complaints" className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100/50 transition-all active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><MessageSquareWarning className="w-5 h-5 text-red-500" /></div>
            <div><p className="text-sm font-bold text-gray-800">File Report</p><p className="text-[10px] text-gray-400">Ragging / Infra</p></div>
          </Link>
          <Link to="/student/materials" className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100/50 transition-all active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center"><BookMarked className="w-5 h-5 text-blue-500" /></div>
            <div><p className="text-sm font-bold text-gray-800">Materials</p><p className="text-[10px] text-gray-400">Notes & PYQs</p></div>
          </Link>
          <Link to="/student/career" className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 border border-purple-100 hover:bg-purple-100/50 transition-all active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center"><Target className="w-5 h-5 text-purple-500" /></div>
            <div><p className="text-sm font-bold text-gray-800">Career Hub</p><p className="text-[10px] text-gray-400">Jobs & Resume</p></div>
          </Link>
          <Link to="/student/campus" className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/50 transition-all active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><DoorOpen className="w-5 h-5 text-emerald-500" /></div>
            <div><p className="text-sm font-bold text-gray-800">Find Room</p><p className="text-[10px] text-gray-400">{vacantCount} available</p></div>
          </Link>
        </div>
      </div>

      {/* Subjects Bar */}
      {mySubjects.length > 0 && (
        <div className="card-elegant p-6 sm:p-8 animate-fade-in">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3 tracking-tight"><div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center"><Calendar className="w-5 h-5 text-rose-500" /></div>Your Subjects — {user?.dept} Year {user?.year}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
