import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Megaphone, Plus, Trash2, Clock, Send, X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function Announcements() {
  const { user } = useAuth();
  const { announcements, addAnnouncement, deleteAnnouncement, markAsSeen } = useApp();

  useEffect(() => { announcements.forEach(n => markAsSeen(n.id)); }, [announcements, markAsSeen]);

  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'medium' });

  const handleSubmit = (e) => {
    e.preventDefault();
    addAnnouncement({ ...form, author: user?.name || 'Admin' });
    setSubmitted(true);
    setTimeout(() => { setShowForm(false); setSubmitted(false); setForm({ title:'',content:'',priority:'medium' }); }, 1500);
  };

  const handleDelete = (id) => { if (confirm('Delete this announcement?')) deleteAnnouncement(id); };
  const getPriorityStyle = (p) => { switch(p) { case 'high': return 'bg-red-50 text-red-500 border-red-100'; case 'medium': return 'bg-amber-50 text-amber-600 border-amber-100'; case 'low': return 'bg-cyan-50 text-cyan-600 border-cyan-100'; default: return ''; } };

  return (
    <div className="space-y-7 max-w-5xl mx-auto">
      <div className="flex items-center justify-between animate-fade-in">
        <div><h1 className="text-2xl font-black flex items-center gap-2 text-gray-900"><Megaphone className="w-6 h-6 text-red-500" />Announcements</h1><p className="text-gray-500 text-sm mt-1">Create and manage campus-wide notices</p></div>
        <button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-md"><Plus className="w-4 h-4" />New</button>
      </div>

      <div className="grid grid-cols-3 gap-4 stagger-children">
        <div className="bg-white rounded-xl p-5 border border-gray-100"><p className="text-2xl font-black text-gray-800">{announcements.length}</p><p className="text-xs text-gray-400 mt-1">Total</p></div>
        <div className="bg-white rounded-xl p-5 border border-gray-100"><p className="text-2xl font-black text-red-500">{announcements.filter(a=>a.priority==='high').length}</p><p className="text-xs text-gray-400 mt-1">High Priority</p></div>
        <div className="bg-white rounded-xl p-5 border border-gray-100"><p className="text-2xl font-black text-cyan-500">{announcements.filter(a=>a.priority==='low').length}</p><p className="text-xs text-gray-400 mt-1">Low Priority</p></div>
      </div>

      <div className="space-y-4 stagger-children">
        {announcements.map(n => (
          <div key={n.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{n.title}</h3>
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed">{n.content}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{n.date}</span>
                    <span className="text-[10px] text-gray-400">by {n.author}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${getPriorityStyle(n.priority)}`}>{n.priority}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(n.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4 text-gray-300 hover:text-red-500" /></button>
              </div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && <div className="bg-white rounded-2xl p-14 text-center border border-gray-100"><Megaphone className="w-12 h-12 text-gray-200 mx-auto mb-3" /><p className="text-gray-500 text-sm">No announcements</p></div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            {submitted ? (
              <div className="p-12 text-center animate-fade-in"><div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-green-600" /></div><h3 className="text-xl font-bold text-gray-800">Published!</h3></div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between"><h2 className="text-lg font-bold text-gray-800">New Announcement</h2><button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
                <div className="p-6 space-y-4">
                  <div><label className="text-xs font-medium text-gray-500 mb-1.5 block">Title *</label><input type="text" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Announcement title" className="w-full bg-gray-50 text-sm px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300" required /></div>
                  <div><label className="text-xs font-medium text-gray-500 mb-1.5 block">Content *</label><textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Write your announcement..." rows={4} className="w-full bg-gray-50 text-sm px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300 resize-none" required /></div>
                  <div><label className="text-xs font-medium text-gray-500 mb-2 block">Priority</label>
                    <div className="grid grid-cols-3 gap-2">{['low','medium','high'].map(p => (
                      <button key={p} type="button" onClick={() => setForm({...form,priority:p})}
                        className={`p-2.5 rounded-xl border text-xs font-semibold capitalize transition-all ${form.priority===p?getPriorityStyle(p):'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{p}</button>
                    ))}</div>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600">Cancel</button>
                  <button type="submit" disabled={!form.title||!form.content} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-30 hover:bg-red-600 flex items-center justify-center gap-2"><Send className="w-4 h-4" />Publish</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
