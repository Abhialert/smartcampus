import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';
import { getChatResponse } from '../data/chatResponses';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { subjectCodes } from '../data/campusData';

export default function ChatBot() {
  const { crowdData, vacantRooms, announcements, assignments, attendanceRecords } = useApp();
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'there';

  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: `Hey ${firstName}! 🎓 I'm your SmartCampus assistant. I know about your classes, attendance, assignments, and campus. Ask me anything!`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Personalized response generator
  const getPersonalizedResponse = (msg) => {
    const lower = msg.toLowerCase();

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
    if (role === 'student' && (lower.includes('assignment') || lower.includes('homework') || lower.includes('due'))) {
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
      if (!subjects) return `I don't have the subject list for ${dept} Year ${year} yet. Check with your department. 📚`;
      let resp = `📚 **Your Subjects (${dept} Year ${year}):**\n`;
      subjects.forEach(s => { resp += `\n• **${s.code}** — ${s.name} (${s.credits} credits)`; });
      return resp;
    }

    // Student-specific: timetable
    if (role === 'student' && (lower.includes('timetable') || lower.includes('schedule') || lower.includes('class time'))) {
      return `📅 Your timetable is in the **Timetable** section. Go to Menu → Timetable to download your class schedule. Your department is **${user?.dept || 'N/A'}**, Year **${user?.year || '?'}**.`;
    }

    // Student-specific: my details
    if (lower.includes('my detail') || lower.includes('my profile') || lower.includes('who am i') || lower.includes('my info')) {
      if (role === 'student') {
        return `👤 **Your Profile:**\n• Name: ${user?.name}\n• Roll: ${user?.roll}\n• Department: ${user?.dept}\n• Year: ${user?.year}${user?.section ? `\n• Section: ${user.section}` : ''}\n\nYou can change your password from the profile menu (top-right).`;
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

  const suggestedQueries = role === 'student'
    ? ["My attendance?", "My assignments?", "My subjects?", "Vacant rooms?", "My profile"]
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
