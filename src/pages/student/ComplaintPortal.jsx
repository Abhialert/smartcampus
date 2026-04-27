import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { complaintCategories } from '../../data/campusData';
import { MessageSquareWarning, Send, CheckCircle2, Clock, Loader2, X } from 'lucide-react';

export default function ComplaintPortal() {
  const { user } = useAuth();
  const { complaints, addComplaint } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [form, setForm] = useState({ category: '', title: '', description: '', location: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    addComplaint({ ...form, submittedBy: isAnonymous ? 'anonymous' : user?.roll, submittedName: isAnonymous ? 'Anonymous' : user?.name });
    setSubmitted(true);
    setTimeout(() => { setShowForm(false); setSubmitted(false); setForm({ category:'',title:'',description:'',location:'' }); setIsAnonymous(false); }, 2000);
  };

  const getStatusIcon = (s) => { switch(s) { case 'pending': return <Clock className="w-3.5 h-3.5 text-amber-500" />; case 'in-progress': return <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />; case 'resolved': return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />; default: return null; } };
  const getStatusStyle = (s) => { switch(s) { case 'pending': return 'bg-amber-50 text-amber-600'; case 'in-progress': return 'bg-blue-50 text-blue-600'; case 'resolved': return 'bg-green-50 text-green-600'; default: return ''; } };
  const getCategoryInfo = (catId) => complaintCategories.find(c => c.id === catId) || { icon: '📝', label: catId, color: '#8b5cf6' };

  return (
    <div className="space-y-7 max-w-5xl mx-auto">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2 text-gray-900"><MessageSquareWarning className="w-6 h-6 text-red-500" />Complaint Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Report issues, lost items, or ragging incidents</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-md"><Send className="w-4 h-4" />File Complaint</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        {complaintCategories.map(cat => {
          const count = complaints.filter(c => c.category === cat.id).length;
          return <div key={cat.id} className="bg-white rounded-xl p-5 text-center border border-gray-100"><span className="text-2xl">{cat.icon}</span><p className="text-sm font-semibold text-gray-700 mt-2">{cat.label}</p><p className="text-xs text-gray-400 mt-0.5">{count} reported</p></div>;
        })}
      </div>

      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-700">All Complaints</h2><p className="text-xs text-gray-400 mt-0.5">{complaints.length} total</p></div>
        <div className="divide-y divide-gray-50">
          {complaints.map(c => {
            const catInfo = getCategoryInfo(c.category);
            return (
              <div key={c.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3"><span className="text-xl mt-0.5">{catInfo.icon}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">{c.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{c.description}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{c.date}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: catInfo.color+'15', color: catInfo.color }}>{catInfo.label}</span>
                        {c.location && <span className="text-[10px] text-gray-400">📍 {c.location}</span>}
                        <span className="text-[10px] text-gray-400">by {c.submittedName}</span>
                      </div>
                      {c.remarks && <div className="mt-2 p-2 rounded-lg bg-gray-50 text-xs text-gray-600"><span className="font-semibold">Admin:</span> {c.remarks}</div>}
                    </div>
                  </div>
                  <span className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 ${getStatusStyle(c.status)}`}>{getStatusIcon(c.status)}{c.status}</span>
                </div>
              </div>
            );
          })}
          {complaints.length === 0 && <div className="p-12 text-center text-gray-400 text-sm">No complaints yet</div>}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {submitted ? (
              <div className="p-12 text-center animate-fade-in"><div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-green-600" /></div><h3 className="text-xl font-bold text-gray-800">Submitted!</h3><p className="text-gray-500 text-sm mt-2">We'll look into it soon.</p></div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between"><h2 className="text-lg font-bold text-gray-800">File a Complaint</h2><button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
                <div className="p-6 space-y-5">
                  <div><label className="text-xs font-medium text-gray-500 mb-2 block">Category *</label>
                    <div className="grid grid-cols-2 gap-2">{complaintCategories.map(cat => (
                      <button key={cat.id} type="button" onClick={() => setForm({...form, category: cat.id})}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2 ${form.category===cat.id?'border-red-300 bg-red-50':'border-gray-200 hover:bg-gray-50'}`}>
                        <span>{cat.icon}</span><span className="text-sm text-gray-700">{cat.label}</span>
                      </button>
                    ))}</div>
                  </div>
                  <div><label className="text-xs font-medium text-gray-500 mb-1.5 block">Title *</label><input type="text" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Brief title" className="w-full bg-gray-50 text-sm px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300" required /></div>
                  <div><label className="text-xs font-medium text-gray-500 mb-1.5 block">Description *</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the issue..." rows={4} className="w-full bg-gray-50 text-sm px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300 resize-none" required /></div>
                  <div><label className="text-xs font-medium text-gray-500 mb-1.5 block">Location</label><input type="text" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="e.g. CS Block Room 201" className="w-full bg-gray-50 text-sm px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300" /></div>
                  {form.category === 'ragging' && (
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 cursor-pointer">
                      <input type="checkbox" checked={isAnonymous} onChange={e=>setIsAnonymous(e.target.checked)} className="w-4 h-4 accent-red-500" />
                      <div><p className="text-sm font-semibold text-red-600">Submit Anonymously</p><p className="text-[10px] text-gray-500">Your identity will not be revealed</p></div>
                    </label>
                  )}
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600">Cancel</button>
                  <button type="submit" disabled={!form.category||!form.title||!form.description} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-30 hover:bg-red-600 flex items-center justify-center gap-2"><Send className="w-4 h-4" />Submit</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
