import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { complaintCategories } from '../../data/campusData';
import { ClipboardList, Clock, CheckCircle2, Loader2, X } from 'lucide-react';

export default function ComplaintManagement() {
  const { complaints, updateComplaintStatus } = useApp();
  const [filter, setFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);
  const counts = { all: complaints.length, pending: complaints.filter(c=>c.status==='pending').length, 'in-progress': complaints.filter(c=>c.status==='in-progress').length, resolved: complaints.filter(c=>c.status==='resolved').length };
  const getCatInfo = (id) => complaintCategories.find(c => c.id === id) || { icon:'📝', label:id, color:'#8b5cf6' };

  const handleUpdate = () => {
    if (selectedComplaint && newStatus) {
      updateComplaintStatus(selectedComplaint.id, newStatus, remarks);
      setSelectedComplaint(null); setRemarks(''); setNewStatus('');
      setShowSuccess(true); setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const filterBtns = [
    { key:'all', label:'All', icon: ClipboardList },
    { key:'pending', label:'Pending', icon: Clock },
    { key:'in-progress', label:'In Progress', icon: Loader2 },
    { key:'resolved', label:'Resolved', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-7 max-w-6xl mx-auto">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-black flex items-center gap-2 text-gray-900"><ClipboardList className="w-6 h-6 text-red-500" />Complaint Management</h1>
        <p className="text-gray-500 text-sm mt-1">Review and manage student complaints</p>
      </div>

      {showSuccess && <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-xl text-green-600 animate-fade-in w-fit"><CheckCircle2 className="w-4 h-4" /><span className="text-xs font-bold">Updated!</span></div>}

      <div className="flex gap-2 flex-wrap animate-fade-in">
        {filterBtns.map(btn => (
          <button key={btn.key} onClick={() => setFilter(btn.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${filter===btn.key?'bg-red-50 text-red-600 border border-red-100':'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
            <btn.icon className={`w-4 h-4 ${btn.key==='in-progress'&&filter===btn.key?'animate-spin':''}`} />
            {btn.label}<span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full">{counts[btn.key]}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 text-xs text-gray-400"><th className="text-left p-4 font-medium">Complaint</th><th className="text-left p-4 font-medium">Category</th><th className="text-left p-4 font-medium">By</th><th className="text-left p-4 font-medium">Date</th><th className="text-left p-4 font-medium">Status</th><th className="text-left p-4 font-medium">Action</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(c => {
                const cat = getCatInfo(c.category);
                return (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4"><p className="text-sm font-semibold text-gray-800">{c.title}</p><p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{c.description}</p>{c.location && <p className="text-[10px] text-gray-400 mt-0.5">📍 {c.location}</p>}</td>
                    <td className="p-4"><span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: cat.color+'15', color: cat.color }}>{cat.icon} {cat.label}</span></td>
                    <td className="p-4"><p className="text-sm text-gray-700">{c.submittedName}</p>{c.category==='ragging'&&c.submittedBy==='anonymous'&&<span className="text-[9px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full">Anon</span>}</td>
                    <td className="p-4 text-sm text-gray-500">{c.date}</td>
                    <td className="p-4"><span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 w-fit ${c.status==='pending'?'bg-amber-50 text-amber-600':c.status==='in-progress'?'bg-blue-50 text-blue-600':'bg-green-50 text-green-600'}`}>
                      {c.status==='pending'&&<Clock className="w-3 h-3" />}{c.status==='in-progress'&&<Loader2 className="w-3 h-3 animate-spin" />}{c.status==='resolved'&&<CheckCircle2 className="w-3 h-3" />}{c.status}</span></td>
                    <td className="p-4"><button onClick={() => { setSelectedComplaint(c); setNewStatus(c.status); setRemarks(c.remarks||''); }} className="text-xs text-red-500 hover:underline font-bold px-3 py-1.5 rounded-lg hover:bg-red-50">Manage</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-12 text-center"><CheckCircle2 className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-400 text-sm">No complaints</p></div>}
      </div>

      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between"><h2 className="text-lg font-bold text-gray-800">Manage Complaint</h2><button onClick={() => setSelectedComplaint(null)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="p-6 space-y-5">
              <div className="bg-gray-50 rounded-xl p-4"><h3 className="font-semibold text-sm text-gray-800">{selectedComplaint.title}</h3><p className="text-xs text-gray-500 mt-1">{selectedComplaint.description}</p><p className="text-[10px] text-gray-400 mt-2">{selectedComplaint.date} • by {selectedComplaint.submittedName}</p></div>
              <div><label className="text-xs font-medium text-gray-500 mb-2 block">Update Status</label>
                <div className="grid grid-cols-3 gap-2">{['pending','in-progress','resolved'].map(s => (
                  <button key={s} onClick={() => setNewStatus(s)} className={`p-2.5 rounded-xl border text-xs font-semibold capitalize transition-all ${newStatus===s?(s==='pending'?'border-amber-300 bg-amber-50 text-amber-600':s==='in-progress'?'border-blue-300 bg-blue-50 text-blue-600':'border-green-300 bg-green-50 text-green-600'):'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{s}</button>
                ))}</div>
              </div>
              <div><label className="text-xs font-medium text-gray-500 mb-1.5 block">Admin Remarks</label><textarea value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Add remarks..." rows={3} className="w-full bg-gray-50 text-sm px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300 resize-none" /></div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setSelectedComplaint(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600">Cancel</button>
              <button onClick={handleUpdate} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
