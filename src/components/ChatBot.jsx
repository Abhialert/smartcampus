import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Zap } from 'lucide-react';
import { getChatResponse } from '../data/chatResponses';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { subjectCodes } from '../data/campusData';
import { campusClubs, campusEvents } from '../data/clubsData';
import { internships, skillsByDept } from '../data/careerData';

export default function ChatBot() {
  const { crowdData, vacantRooms, announcements, assignments, attendanceRecords } = useApp();
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'there';

  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: `Hey ${firstName}! 🎓 I'm your SmartCampus assistant. I know about your classes, attendance, assignments, clubs, events, career & skills. Ask me anything!`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Helper data
  const joinedClubs = JSON.parse(localStorage.getItem('smartcampus_joined_clubs') || '[]');
  const eventRsvps = JSON.parse(localStorage.getItem('smartcampus_event_rsvps') || '[]');
  const skillRatings = JSON.parse(localStorage.getItem('smartcampus_skill_ratings') || '{}');

  // Karma auto-calculation
  const getKarma = () => {
    let karma = 0;
    const myAtt = attendanceRecords.filter(r => r.records?.some(s => s.roll === user?.roll));
    const total = myAtt.length;
    const present = myAtt.filter(r => r.records?.find(s => s.roll === user?.roll)?.present).length;
    const attPct = total > 0 ? (present / total) * 100 : 0;
    karma += Math.round(attPct * 0.5); // up to 50
    karma += joinedClubs.length * 10;
    karma += eventRsvps.length * 8;
    karma += Object.keys(skillRatings).length * 3;
    return karma;
  };

  const getPersonalizedResponse = (msg) => {
    const lower = msg.toLowerCase();

    // ===== DAILY BRIEFING =====
    if (lower.includes('briefing') || lower.includes('today') || lower.includes('daily') || lower.includes('morning') || lower.includes('summary')) {
      let resp = `☀️ **Good ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, ${firstName}!**\n\nHere's your daily briefing:\n`;

      // Attendance
      const myAtt = attendanceRecords.filter(r => r.records?.some(s => s.roll === user?.roll));
      const total = myAtt.length;
      const present = myAtt.filter(r => r.records?.find(s => s.roll === user?.roll)?.present).length;
      const pct = total > 0 ? Math.round((present / total) * 100) : 0;
      resp += `\n📊 **Attendance:** ${pct}% (${present}/${total})`;
      if (pct < 75 && total > 0) resp += ` ⚠️ Below 75%!`;

      // Pending assignments
      const myAssign = assignments.filter(a => {
        const r = (user?.roll || '').toLowerCase();
        return r >= (a.rollFrom || '').toLowerCase() && r <= (a.rollTo || 'zzz').toLowerCase();
      });
      const pending = myAssign.filter(a => new Date(a.dueDate) > new Date());
      resp += `\n📝 **Assignments:** ${pending.length} pending`;
      if (pending.length > 0) {
        const urgent = pending.filter(a => Math.ceil((new Date(a.dueDate) - new Date()) / (864e5)) <= 3);
        if (urgent.length > 0) resp += ` (${urgent.length} due in ≤3 days! 🔴)`;
      }

      // Today's events
      const today = new Date().toISOString().split('T')[0];
      const todayEvents = campusEvents.filter(e => e.date === today);
      const upcomingEvents = campusEvents.filter(e => {
        const d = Math.ceil((new Date(e.date) - new Date()) / (864e5));
        return d >= 0 && d <= 7;
      });
      resp += `\n🎪 **Events:** ${todayEvents.length > 0 ? todayEvents.map(e => e.title).join(', ') + ' TODAY!' : upcomingEvents.length + ' this week'}`;

      // Campus status
      const lib = crowdData.find(z => z.id === 'library');
      const can = crowdData.find(z => z.id === 'canteen');
      resp += `\n🏫 **Campus:** Library ${lib?.status || '?'} (${lib?.crowd || 0}), Canteen ${can?.status || '?'} (${can?.crowd || 0})`;

      // Karma
      resp += `\n🏆 **Karma:** ${getKarma()} points`;

      // Announcements
      if (announcements.length > 0) resp += `\n📢 **Latest notice:** "${announcements[0].title}"`;

      return resp;
    }

    // ===== DEADLINES =====
    if (lower.includes('deadline') || lower.includes('due') || lower.includes('pending') || lower.includes('this week')) {
      const myAssign = assignments.filter(a => {
        const r = (user?.roll || '').toLowerCase();
        return r >= (a.rollFrom || '').toLowerCase() && r <= (a.rollTo || 'zzz').toLowerCase();
      });
      const pending = myAssign.filter(a => new Date(a.dueDate) > new Date()).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      if (pending.length === 0) return `🎉 No pending deadlines, ${firstName}! Enjoy your free time.`;
      let resp = `⏰ **Your Deadlines:**\n`;
      pending.slice(0, 5).forEach(a => {
        const days = Math.ceil((new Date(a.dueDate) - new Date()) / (864e5));
        const urgency = days <= 2 ? '🔴' : days <= 5 ? '🟡' : '🟢';
        resp += `\n${urgency} **${a.title}** — ${days} day${days !== 1 ? 's' : ''} left`;
      });
      return resp;
    }

    // ===== ATTENDANCE RISK PREDICTOR =====
    if (lower.includes('risk') || lower.includes('predict') || lower.includes('what if') || lower.includes('miss')) {
      const myAtt = attendanceRecords.filter(r => r.records?.some(s => s.roll === user?.roll));
      const total = myAtt.length;
      const present = myAtt.filter(r => r.records?.find(s => s.roll === user?.roll)?.present).length;
      if (total === 0) return `No attendance data yet, ${firstName}. Check back after your teacher marks attendance.`;
      const pct = Math.round((present / total) * 100);
      let resp = `📊 **Attendance Risk Analysis:**\nCurrent: **${pct}%** (${present}/${total})\n`;
      for (let miss = 1; miss <= 5; miss++) {
        const newPct = Math.round((present / (total + miss)) * 100);
        const flag = newPct < 75 ? ' ❌ SHORTAGE' : ' ✅';
        resp += `\nMiss ${miss} more → **${newPct}%**${flag}`;
      }
      if (pct < 75) resp += `\n\n⚠️ You're already below 75%! Attend every class.`;
      return resp;
    }

    // ===== KARMA =====
    if (lower.includes('karma') || lower.includes('score') || lower.includes('points') || lower.includes('reputation')) {
      const karma = getKarma();
      const level = karma >= 100 ? '🏆 Gold' : karma >= 50 ? '🥈 Silver' : '🥉 Bronze';
      return `🏆 **Campus Karma: ${karma} points** (${level})\n\n• Attendance contribution: ~${Math.round(karma * 0.4)} pts\n• ${joinedClubs.length} clubs joined: +${joinedClubs.length * 10} pts\n• ${eventRsvps.length} events RSVP'd: +${eventRsvps.length * 8} pts\n• ${Object.keys(skillRatings).length} skills rated: +${Object.keys(skillRatings).length * 3} pts\n\n💡 Join more clubs & events to boost your karma!`;
    }

    // ===== CLUBS =====
    if (lower.includes('club') || lower.includes('society') || lower.includes('community')) {
      if (lower.includes('my') || lower.includes('joined')) {
        if (joinedClubs.length === 0) return `You haven't joined any clubs yet! Go to **Clubs** from the menu to discover ${campusClubs.length} clubs. 🏛️`;
        const names = campusClubs.filter(c => joinedClubs.includes(c.id)).map(c => `${c.emoji} ${c.name}`);
        return `⭐ **Your Clubs (${names.length}):**\n\n${names.map(n => `• ${n}`).join('\n')}\n\nCheck the Clubs page for upcoming events from your clubs!`;
      }
      return `🏛️ TMSL has **${campusClubs.length} active clubs** across Tech, Cultural, Sports, Literary & Social categories.\n\nPopular: ${campusClubs.slice(0, 4).map(c => c.emoji + ' ' + c.shortName).join(', ')}\n\nGo to **Menu → Clubs** to browse & join with one tap!`;
    }

    // ===== EVENTS =====
    if (lower.includes('event') || lower.includes('hackathon') || lower.includes('fest') || lower.includes('workshop')) {
      const upcoming = campusEvents.filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
      if (upcoming.length === 0) return `No upcoming events right now. Check back later! 🎪`;
      let resp = `🎪 **Upcoming Events (${upcoming.length}):**\n`;
      upcoming.slice(0, 4).forEach(e => {
        const club = campusClubs.find(c => c.id === e.club);
        const days = Math.ceil((new Date(e.date) - new Date()) / (864e5));
        resp += `\n• **${e.title}** — ${days}d away (${e.type === 'inter' ? '🌐 Inter' : '🏠 Intra'}) by ${club?.shortName || '?'}`;
      });
      resp += `\n\nGo to **Menu → Events** to RSVP! 🎟️`;
      return resp;
    }

    // ===== INTERNSHIPS =====
    if (lower.includes('internship') || lower.includes('job') || lower.includes('placement') || lower.includes('career')) {
      const myInterns = internships.filter(i => i.depts.includes(user?.dept || 'CSE'));
      let resp = `🚀 **${myInterns.length} internships** available for ${user?.dept || 'CSE'}:\n`;
      myInterns.slice(0, 4).forEach(i => {
        resp += `\n• **${i.title}** at ${i.company} — ${i.stipend} (${i.location})`;
      });
      resp += `\n\nGo to **Menu → Career Hub** for full list, auto-resume builder & placement prep!`;
      return resp;
    }

    // ===== SKILLS =====
    if (lower.includes('skill') || lower.includes('progress') || lower.includes('radar')) {
      const skills = skillsByDept[user?.dept || 'CSE'] || [];
      const rated = Object.keys(skillRatings).length;
      if (rated === 0) return `You haven't rated your skills yet! Go to **Menu → Skill Radar** — just slide to rate, zero typing. 🎯`;
      const avg = (Object.values(skillRatings).reduce((a, b) => a + b, 0) / rated).toFixed(1);
      const top = skills.filter(s => (skillRatings[s.id] || 0) >= 7).map(s => s.name);
      let resp = `🎯 **Skill Summary:**\n• ${rated}/${skills.length} skills rated\n• Average: ${avg}/10\n`;
      if (top.length > 0) resp += `\n💪 **Strengths:** ${top.join(', ')}`;
      resp += `\n\nGo to **Skill Radar** to update your ratings!`;
      return resp;
    }

    // ===== RESUME =====
    if (lower.includes('resume') || lower.includes('cv')) {
      return `📝 Your **Smart Resume** is auto-generated from your SmartCampus data:\n• Profile: ${user?.name}, ${user?.dept} Year ${user?.year}\n• ${joinedClubs.length} clubs, ${eventRsvps.length} events, ${Object.keys(skillRatings).length} skills rated\n\nGo to **Career Hub → Smart Resume** to preview & download. Zero typing needed! 🪄`;
    }

    // ===== POLLS (just info) =====
    if (lower.includes('poll') || lower.includes('vote') || lower.includes('opinion')) {
      return `🗳️ **Campus Polls** are on your dashboard! Quick 1-tap votes on canteen, events & more. Check the dashboard to vote. Your voice matters! 🎤`;
    }

    // Student-specific: attendance
    if (role === 'student' && (lower.includes('attendance') || lower.includes('present') || lower.includes('absent'))) {
      const myRecords = attendanceRecords.filter(r => r.records?.some(s => s.roll === user?.roll));
      const total = myRecords.length;
      const present = myRecords.filter(r => r.records?.find(s => s.roll === user?.roll)?.present).length;
      const pct = total > 0 ? Math.round((present / total) * 100) : 0;
      if (total === 0) return `${firstName}, no attendance records found for you yet. Your teacher hasn't marked attendance yet. 📋`;
      return `📊 **Your Attendance:** ${pct}% (${present}/${total} classes)\n\n${pct >= 75 ? '✅ You\'re above the 75% threshold — keep it up!' : '⚠️ Your attendance is below 75%. Please attend more classes to avoid shortage.'}`;
    }

    // Student-specific: assignments
    if (role === 'student' && (lower.includes('assignment') || lower.includes('homework'))) {
      const myAssign = assignments.filter(a => {
        const r = (user?.roll || '').toLowerCase();
        return r >= (a.rollFrom || '').toLowerCase() && r <= (a.rollTo || 'zzz').toLowerCase();
      });
      if (myAssign.length === 0) return `No assignments for you right now, ${firstName}. 🎉 Enjoy!`;
      const pending = myAssign.filter(a => new Date(a.dueDate) > new Date());
      let resp = `📝 **Your Assignments:** ${myAssign.length} total, ${pending.length} pending\n`;
      pending.slice(0, 3).forEach(a => {
        const days = Math.ceil((new Date(a.dueDate) - new Date()) / (1000*60*60*24));
        resp += `\n• **${a.title}** ${a.subject ? `(${a.subject})` : ''} — Due in ${days} day${days !== 1 ? 's' : ''}`;
      });
      return resp;
    }

    // Student-specific: subjects
    if (role === 'student' && (lower.includes('subject') || lower.includes('course') || lower.includes('syllabus'))) {
      const dept = user?.dept || 'CSE';
      const year = user?.year || 1;
      const subjects = subjectCodes[dept]?.[year];
      if (!subjects) return `I don't have the subject list for ${dept} Year ${year} yet. 📚`;
      let resp = `📚 **Your Subjects (${dept} Year ${year}):**\n`;
      subjects.forEach(s => { resp += `\n• **${s.code}** — ${s.name} (${s.credits} credits)`; });
      return resp;
    }

    // Student-specific: timetable
    if (role === 'student' && (lower.includes('timetable') || lower.includes('schedule') || lower.includes('class time'))) {
      return `📅 Your timetable is in the **Timetable** section. Go to Menu → Timetable to see your schedule. Dept: **${user?.dept || 'N/A'}**, Year **${user?.year || '?'}**.`;
    }

    // My details
    if (lower.includes('my detail') || lower.includes('my profile') || lower.includes('who am i') || lower.includes('my info')) {
      if (role === 'student') {
        return `👤 **Your Profile:**\n• Name: ${user?.name}\n• Roll: ${user?.roll}\n• Department: ${user?.dept}\n• Year: ${user?.year}${user?.section ? `\n• Section: ${user.section}` : ''}\n• Karma: ${getKarma()} pts\n• Clubs: ${joinedClubs.length} joined`;
      }
      return `👤 **Your Profile:**\n• Name: ${user?.name}\n• ID: ${user?.id}\n• Department: ${user?.dept}\n• Role: ${user?.adminRole}`;
    }

    // Live data enrichment
    let resp = getChatResponse(msg);
    if (lower.includes('library')) {
      const lib = crowdData.find(z => z.id === 'library');
      if (lib) resp += `\n\n📊 **Live:** Library has ~${lib.crowd} people (${lib.status}).`;
    }
    if (lower.includes('canteen')) {
      const can = crowdData.find(z => z.id === 'canteen');
      if (can) resp += `\n\n📊 **Live:** Canteen has ~${can.crowd} people (${can.status}).`;
    }
    if (lower.includes('vacant') || lower.includes('empty') || lower.includes('free room')) {
      resp += `\n\n📊 **Live:** ${vacantRooms.filter(r => r.isVacant).length} vacant rooms available right now.`;
    }
    if (lower.includes('notice') || lower.includes('announcement')) {
      if (announcements.length > 0) {
        resp += `\n\n📢 **Latest:** "${announcements[0].title}" — ${announcements[0].date}`;
      }
    }

    return resp;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { id: messages.length + 1, type: 'user', text: input.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput(''); setIsTyping(true);

    setTimeout(() => {
      const resp = getPersonalizedResponse(userMsg.text);
      setMessages(prev => [...prev, { id: messages.length + 2, type: 'bot', text: resp, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setIsTyping(false);
    }, 700);
  };

  const handleBriefing = () => {
    setInput('');
    setIsTyping(true);
    const userMsg = { id: messages.length + 1, type: 'user', text: '📋 My daily briefing', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setTimeout(() => {
      const resp = getPersonalizedResponse('daily briefing');
      setMessages(prev => [...prev, { id: messages.length + 2, type: 'bot', text: resp, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setIsTyping(false);
    }, 900);
  };

  const suggestedQueries = role === 'student'
    ? ["☀️ Daily briefing", "⏰ Deadlines", "📊 Attendance risk", "🎪 Events", "🏆 My karma", "🚀 Internships"]
    : ["Campus crowd?", "Vacant rooms?", "Library busy?", "Help"];

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all animate-pulse-glow group z-50" id="chatbot-toggle">
        <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-72' : 'w-[22rem] sm:w-[26rem]'}`}>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-500 to-red-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></div>
            <div><h3 className="text-base font-bold text-white">SmartCampus AI</h3><div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" /><span className="text-xs text-red-100">Online • Hi {firstName}!</span></div></div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 rounded-lg hover:bg-white/10"><Minimize2 className="w-5 h-5 text-white/80" /></button>
            <button onClick={() => { setIsOpen(false); setIsMinimized(false); }} className="p-2 rounded-lg hover:bg-white/10"><X className="w-5 h-5 text-white/80" /></button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Daily briefing button */}
            {role === 'student' && messages.length <= 3 && (
              <button onClick={handleBriefing}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-50 to-red-50 border-b border-gray-100 hover:from-amber-100 hover:to-red-100 transition-all text-left">
                <Zap className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-800">⚡ Get Daily Briefing</p>
                  <p className="text-[10px] text-gray-400">Attendance, deadlines, events & campus — one tap</p>
                </div>
              </button>
            )}

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  {msg.type === 'bot' && <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-1"><Bot className="w-4 h-4 text-red-500" /></div>}
                  <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.type === 'user' ? 'bg-red-500 text-white rounded-br-md' : 'bg-white text-gray-800 rounded-bl-md border border-gray-100 shadow-sm'}`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <p className={`text-[10px] mt-1.5 ${msg.type === 'user' ? 'text-red-200' : 'text-gray-400'}`}>{msg.time}</p>
                  </div>
                  {msg.type === 'user' && <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-1"><User className="w-4 h-4 text-gray-500" /></div>}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2 items-start animate-fade-in">
                  <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-red-500" /></div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md border border-gray-100 shadow-sm">
                    <div className="flex gap-1.5"><span className="w-2 h-2 bg-gray-400 rounded-full" style={{animation:'typing 1.4s infinite 0s'}} /><span className="w-2 h-2 bg-gray-400 rounded-full" style={{animation:'typing 1.4s infinite 0.2s'}} /><span className="w-2 h-2 bg-gray-400 rounded-full" style={{animation:'typing 1.4s infinite 0.4s'}} /></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 3 && (
              <div className="px-4 py-2.5 border-t border-gray-100 flex gap-2 overflow-x-auto hide-scrollbar">
                {suggestedQueries.map(q => (
                  <button key={q} onClick={() => setInput(q)} className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors font-semibold">{q}</button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSend();} }}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-gray-50 text-base px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300 placeholder:text-gray-400" />
                <button onClick={handleSend} disabled={!input.trim()}
                  className="w-11 h-11 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-30 flex items-center justify-center transition-all active:scale-95">
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
