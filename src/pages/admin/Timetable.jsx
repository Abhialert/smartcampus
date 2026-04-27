import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Calendar, Plus, Trash2, X, CheckCircle2, Upload, FileText, Image, Download } from 'lucide-react';
import { departments, years } from '../../data/campusData';

export default function AdminTimetable() {
  const { timetables, addTimetable, deleteTimetable } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ label: '', dept: '', year: '' });
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Max file size: 10MB'); return; }

    setFileName(file.name);
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    const isExcel = file.name.match(/\.(xlsx?|csv)$/i);
    setFileType(isImage ? 'image' : isPdf ? 'pdf' : isExcel ? 'excel' : 'other');

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFileData(ev.target.result);
      if (isImage) setPreview(ev.target.result);
      else setPreview(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addTimetable({ ...form, imageData: fileData, fileName, fileType });
    setSubmitted(true);
    setTimeout(() => { setShowForm(false); setSubmitted(false); setForm({label:'',dept:'',year:''}); setFileData(null); setFileName(''); setFileType(''); setPreview(null); }, 1500);
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return '📄';
      case 'excel': return '📊';
      case 'image': return '🖼️';
      default: return '📁';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3 text-gray-900">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center"><Calendar className="w-6 h-6 text-red-500" /></div>
            Timetable Management
          </h1>
          <p className="text-gray-500 mt-2">Upload class timetables (PDF, Excel, or Image)</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-6 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-200 text-base">
          <Plus className="w-5 h-5" />Upload Timetable
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
        {timetables.map(tt => (
          <div key={tt.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
            {tt.fileType === 'image' && tt.imageData ? (
              <img src={tt.imageData} alt={tt.label} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gray-50 flex flex-col items-center justify-center gap-3">
                <span className="text-5xl">{getFileIcon(tt.fileType)}</span>
                <span className="text-sm font-semibold text-gray-500">{tt.fileName || 'Uploaded File'}</span>
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-lg truncate">{tt.label}</h3>
                  <p className="text-sm text-gray-400 mt-1">{tt.dept && `${tt.dept}`}{tt.year && ` • Year ${tt.year}`}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(tt.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {tt.imageData && (
                    <a href={tt.imageData} download={tt.fileName || 'timetable'} className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors" title="Download">
                      <Download className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </a>
                  )}
                  <button onClick={() => { if(confirm('Delete this timetable?')) deleteTimetable(tt.id); }} className="p-2.5 rounded-xl hover:bg-red-50 transition-colors">
                    <Trash2 className="w-5 h-5 text-gray-300 hover:text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {timetables.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-16 text-center border border-gray-100">
            <Calendar className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700">No timetables uploaded</h3>
            <p className="text-gray-400 mt-2">Upload timetables as PDF, Excel, or Image files.</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            {submitted ? (
              <div className="p-14 text-center animate-fade-in"><div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-green-600" /></div><h3 className="text-xl font-bold text-gray-800">Timetable Uploaded!</h3></div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between"><h2 className="text-xl font-bold text-gray-800">Upload Timetable</h2><button type="button" onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button></div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Label *</label>
                    <input type="text" value={form.label} onChange={e=>setForm({...form,label:e.target.value})} placeholder="e.g. CSE 1st Year — Semester 2" className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Department</label>
                      <select value={form.dept} onChange={e=>setForm({...form,dept:e.target.value})} className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300">
                        <option value="">All</option>{departments.map(d=><option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Year</label>
                      <select value={form.year} onChange={e=>setForm({...form,year:e.target.value})} className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300">
                        <option value="">All</option>{years.map(y=><option key={y} value={y}>Year {y}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">File (PDF, Excel, or Image) *</label>
                    {fileData ? (
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="text-3xl">{getFileIcon(fileType)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{fileName}</p>
                          <p className="text-xs text-gray-400 uppercase">{fileType} file</p>
                        </div>
                        <button type="button" onClick={() => { setFileData(null); setFileName(''); setFileType(''); setPreview(null); }} className="p-2 hover:bg-gray-200 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed border-gray-200 hover:border-red-300 cursor-pointer hover:bg-red-50/30 transition-all">
                        <Upload className="w-10 h-10 text-gray-300 mb-3" />
                        <span className="text-base text-gray-500 font-semibold">Click to upload file</span>
                        <span className="text-xs text-gray-400 mt-1">PDF, Excel, or Image (max 10MB)</span>
                        <input type="file" accept=".pdf,.xlsx,.xls,.csv,image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-base text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={!form.label||!fileData} className="flex-1 py-3.5 rounded-xl bg-red-500 text-white text-base font-semibold disabled:opacity-30 hover:bg-red-600 transition-all active:scale-95">Upload</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
