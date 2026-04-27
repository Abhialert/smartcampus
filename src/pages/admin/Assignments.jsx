import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { BookOpen, Plus, Trash2, Send, X, CheckCircle2, Calendar, Users, Upload, FileText, Download } from 'lucide-react';

export default function AdminAssignments() {
  const { user } = useAuth();
  const { assignments, submissions, addAssignment, deleteAssignment } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', subject: '', dueDate: '', rollFrom: '', rollTo: '' });
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Max 10MB'); return; }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setFileData(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addAssignment({ ...form, createdBy: user?.name || 'Admin', fileData, fileName });
    setSubmitted(true);
    setTimeout(() => { setShowForm(false); setSubmitted(false); setForm({ title:'',description:'',subject:'',dueDate:'',rollFrom:'',rollTo:'' }); setFileData(null); setFileName(''); }, 1500);
  };

  const handleDelete = (id) => { if (confirm('Delete this assignment?')) deleteAssignment(id); };

  return (
    <div className="space-y-7 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3 text-gray-900"><BookOpen className="w-6 h-6 text-red-500" />Assignments</h1>
          <p className="text-gray-500 text-sm mt-1">Create assignments with attachments and track submissions</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-6 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-base font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-200">
          <Plus className="w-5 h-5" />New Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children">
        <div className="bg-white rounded-xl p-6 border border-gray-100"><p className="text-3xl font-black text-gray-800">{assignments.length}</p><p className="text-sm font-semibold text-gray-500 mt-1">Total Assignments</p></div>
        <div className="bg-white rounded-xl p-6 border border-gray-100"><p className="text-3xl font-black text-amber-500">{assignments.filter(a => { const d = new Date(a.dueDate); return d > new Date(); }).length}</p><p className="text-sm font-semibold text-gray-500 mt-1">Active</p></div>
        <div className="bg-white rounded-xl p-6 border border-gray-100"><p className="text-3xl font-black text-gray-400">{assignments.filter(a => { const d = new Date(a.dueDate); return d <= new Date(); }).length}</p><p className="text-sm font-semibold text-gray-500 mt-1">Past Due</p></div>
      </div>

      <div className="space-y-6 stagger-children">
        {assignments.map(a => {
          const subs = submissions.filter(s => s.assignmentId === a.id);
          return (
            <div key={a.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {a.subject && <span className="text-xs px-3 py-1 rounded-full font-bold uppercase bg-red-50 text-red-500 border border-red-100">{a.subject}</span>}
                      {a.dueDate && <span className="text-xs text-gray-500 font-semibold flex items-center gap-1.5"><Calendar className="w-4 h-4" />Due: {a.dueDate}</span>}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{a.title}</h3>
                    <p className="text-gray-600 mt-3 leading-relaxed">{a.description}</p>
                    
                    {a.fileName && (
                      <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 w-fit">
                        <FileText className="w-5 h-5 text-red-400" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{a.fileName}</p>
                          <a href={a.fileData} download={a.fileName} className="text-xs text-red-500 hover:underline font-bold mt-0.5 block">Download File</a>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-5 mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500 font-semibold">
                      <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />Rolls: {a.rollFrom} — {a.rollTo}</span>
                      <span>By {a.createdBy}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-4 shrink-0">
                    <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100 w-32">
                      <p className="text-2xl font-black text-gray-800">{subs.length}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase mt-1">Submissions</p>
                    </div>
                    <button onClick={() => handleDelete(a.id)} className="px-4 py-2 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 text-xs font-bold transition-colors flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>

                {subs.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Recent Submissions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {subs.map(sub => (
                        <div key={sub.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{sub.studentName}</p>
                            <p className="text-xs font-mono text-gray-500 mt-0.5">{sub.roll}</p>
                          </div>
                          <a href={sub.fileData} download={`sub_${sub.roll}_${sub.fileName}`} className="p-2 bg-white rounded-lg hover:bg-gray-100 shadow-sm transition-colors border border-gray-200" title="Download Submission">
                            <Download className="w-4 h-4 text-red-500" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {assignments.length === 0 && (
          <div className="bg-white rounded-2xl p-20 text-center border border-gray-100">
            <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-5" />
            <p className="text-gray-500 text-lg font-medium">No assignments created yet</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            {submitted ? (
              <div className="p-12 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-green-600" /></div>
                <h3 className="text-xl font-bold text-gray-800">Assignment Published!</h3>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between"><h2 className="text-xl font-bold text-gray-800">New Assignment</h2><button type="button" onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button></div>
                <div className="p-6 space-y-5">
                  <div><label className="text-sm font-medium text-gray-600 mb-2 block">Title *</label><input type="text" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Assignment title" className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300" required /></div>
                  <div><label className="text-sm font-medium text-gray-600 mb-2 block">Description *</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the assignment..." rows={3} className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300 resize-none" required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-600 mb-2 block">Subject</label><input type="text" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="e.g. DBMS" className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300" /></div>
                    <div><label className="text-sm font-medium text-gray-600 mb-2 block">Due Date</label><input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})} className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-600 mb-2 block">From Roll No *</label><input type="text" value={form.rollFrom} onChange={e=>setForm({...form,rollFrom:e.target.value})} placeholder="e.g. 13000125001" className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300" required /></div>
                    <div><label className="text-sm font-medium text-gray-600 mb-2 block">To Roll No *</label><input type="text" value={form.rollTo} onChange={e=>setForm({...form,rollTo:e.target.value})} placeholder="e.g. 13000125060" className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300" required /></div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Attachment (Optional)</label>
                    {fileData ? (
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3 overflow-hidden"><FileText className="w-5 h-5 text-red-500 shrink-0" /><span className="text-sm font-semibold truncate">{fileName}</span></div>
                        <button type="button" onClick={()=>{setFileData(null);setFileName('');}} className="p-2 hover:bg-gray-200 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-gray-200 hover:border-red-300 cursor-pointer hover:bg-red-50/30 transition-all">
                        <Upload className="w-6 h-6 text-gray-400 mb-2" /><span className="text-sm text-gray-500 font-semibold">Upload file</span>
                        <input type="file" onChange={handleFileChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-base text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={!form.title||!form.description||!form.rollFrom||!form.rollTo} className="flex-1 py-3.5 rounded-xl bg-red-500 text-white text-base font-semibold disabled:opacity-30 hover:bg-red-600 flex items-center justify-center gap-2"><Send className="w-5 h-5" />Publish</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
