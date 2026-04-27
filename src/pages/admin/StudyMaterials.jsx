import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { BookMarked, Plus, Trash2, X, CheckCircle2, Upload, FileText, Image, Download, BookOpen } from 'lucide-react';
import { departments, years, sections } from '../../data/campusData';

export default function AdminStudyMaterials() {
  const { user } = useAuth();
  const { studyMaterials, addStudyMaterial, deleteStudyMaterial } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', subject: '', dept: '', year: '', type: 'notes' });
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { alert('Max file size: 15MB'); return; }

    setFileName(file.name);
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    setFileType(isImage ? 'image' : isPdf ? 'pdf' : 'other');

    const reader = new FileReader();
    reader.onload = (ev) => setFileData(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addStudyMaterial({ ...form, fileData, fileName, fileType, uploadedBy: user?.name || 'Teacher' });
    setSubmitted(true);
    setTimeout(() => { setShowForm(false); setSubmitted(false); setForm({title:'',description:'',subject:'',dept:'',year:'',type:'notes'}); setFileData(null); setFileName(''); setFileType(''); }, 1500);
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return '📄';
      case 'image': return '🖼️';
      default: return '📁';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3 text-gray-900">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center"><BookMarked className="w-6 h-6 text-red-500" /></div>
            Study Materials
          </h1>
          <p className="text-gray-500 mt-2">Upload notes, PYQs, and references for students</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-6 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-200 text-base">
          <Plus className="w-5 h-5" />Upload Material
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
        {studyMaterials.map(m => (
          <div key={m.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3">
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase border ${m.type==='pyq'?'bg-amber-50 text-amber-600 border-amber-100':m.type==='reference'?'bg-blue-50 text-blue-600 border-blue-100':'bg-green-50 text-green-600 border-green-100'}`}>
                  {m.type === 'pyq' ? 'Previous Year Qs' : m.type === 'reference' ? 'Reference Book' : 'Class Notes'}
                </span>
                <button onClick={() => { if(confirm('Delete this material?')) deleteStudyMaterial(m.id); }} className="p-2 hover:bg-red-50 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4 text-gray-300 hover:text-red-500" />
                </button>
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">{m.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{m.description}</p>
              
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-gray-400">
                {m.subject && <span className="bg-gray-50 px-2 py-1 rounded-md">{m.subject}</span>}
                {m.dept && <span className="bg-gray-50 px-2 py-1 rounded-md">{m.dept} {m.year && `Y${m.year}`}</span>}
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 max-w-[70%]">
                  <span className="text-2xl">{getFileIcon(m.fileType)}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-700 truncate">{m.fileName}</p>
                    <p className="text-[10px] text-gray-400">By {m.uploadedBy}</p>
                  </div>
                </div>
                {m.fileData && (
                  <a href={m.fileData} download={m.fileName} className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors" title="Download">
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
        {studyMaterials.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-16 text-center border border-gray-100">
            <BookOpen className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700">No materials uploaded</h3>
            <p className="text-gray-400 mt-2">Share notes and previous year questions with students.</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {submitted ? (
              <div className="p-14 text-center animate-fade-in"><div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-green-600" /></div><h3 className="text-xl font-bold text-gray-800">Uploaded Successfully!</h3></div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between"><h2 className="text-xl font-bold text-gray-800">Upload Study Material</h2><button type="button" onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button></div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Title *</label>
                    <input type="text" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. DBMS Unit 1 Notes" className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Description</label>
                    <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Brief description of the material..." rows={2} className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300 resize-none" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Material Type</label>
                      <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300">
                        <option value="notes">Class Notes</option>
                        <option value="pyq">Previous Year Questions</option>
                        <option value="reference">Reference Material</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Subject</label>
                      <input type="text" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="e.g. CS-301" className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Department</label>
                      <select value={form.dept} onChange={e=>setForm({...form,dept:e.target.value})} className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300">
                        <option value="">All Departments</option>{departments.map(d=><option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Year</label>
                      <select value={form.year} onChange={e=>setForm({...form,year:e.target.value})} className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300">
                        <option value="">All Years</option>{years.map(y=><option key={y} value={y}>Year {y}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">File (PDF, Doc, Image) *</label>
                    {fileData ? (
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="text-3xl">{getFileIcon(fileType)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{fileName}</p>
                        </div>
                        <button type="button" onClick={() => { setFileData(null); setFileName(''); setFileType(''); }} className="p-2 hover:bg-gray-200 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-gray-200 hover:border-red-300 cursor-pointer hover:bg-red-50/30 transition-all">
                        <Upload className="w-8 h-8 text-gray-300 mb-2" />
                        <span className="text-sm text-gray-500 font-semibold">Click to upload file</span>
                        <span className="text-xs text-gray-400 mt-1">PDF, Word, or Image (max 15MB)</span>
                        <input type="file" onChange={handleFileChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-base text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={!form.title||!fileData} className="flex-1 py-3.5 rounded-xl bg-red-500 text-white text-base font-semibold disabled:opacity-30 hover:bg-red-600 transition-all active:scale-95">Upload</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
