import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { BookOpen, Calendar, Clock, CheckCircle2, AlertCircle, Upload, X, Send, FileText, Download } from 'lucide-react';

export default function StudentAssignments() {
  const { user } = useAuth();
  const { assignments, submissions, addSubmission } = useApp();
  
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Filter assignments based on roll number range
  const myAssignments = assignments.filter(a => {
    if (!user?.roll) return false;
    const r = user.roll.toLowerCase();
    return r >= a.rollFrom.toLowerCase() && r <= a.rollTo.toLowerCase();
  });

  const getStatus = (assignmentId, dueDate) => {
    const isSubmitted = submissions.some(s => s.assignmentId === assignmentId && s.roll === user?.roll);
    if (isSubmitted) return { label: 'Submitted', color: 'bg-green-50 text-green-600 border-green-100', icon: CheckCircle2 };
    
    const isPastDue = new Date(dueDate) < new Date();
    if (isPastDue) return { label: 'Missing', color: 'bg-red-50 text-red-500 border-red-100', icon: AlertCircle };
    
    const isDueSoon = new Date(dueDate) - new Date() < 3 * 24 * 60 * 60 * 1000; // < 3 days
    if (isDueSoon) return { label: 'Due Soon', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Clock };
    
    return { label: 'Pending', color: 'bg-blue-50 text-blue-500 border-blue-100', icon: Clock };
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Max file size: 10MB'); return; }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setFileData(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAssignment || !fileData) return;
    addSubmission({
      assignmentId: selectedAssignment.id,
      roll: user.roll,
      studentName: user.name,
      fileData,
      fileName
    });
    setSubmitted(true);
    setTimeout(() => { setSelectedAssignment(null); setSubmitted(false); setFileData(null); setFileName(''); }, 1500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-black flex items-center gap-3 text-gray-900">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center"><BookOpen className="w-6 h-6 text-red-500" /></div>
          My Assignments
        </h1>
        <p className="text-gray-500 text-base mt-2 font-medium">View, download, and submit your class assignments.</p>
      </div>

      <div className="space-y-6 stagger-children">
        {myAssignments.length > 0 ? myAssignments.map(a => {
          const status = getStatus(a.id, a.dueDate);
          const hasSubmitted = status.label === 'Submitted';
          const mySub = submissions.find(s => s.assignmentId === a.id && s.roll === user?.roll);

          return (
            <div key={a.id} className={`bg-white rounded-2xl overflow-hidden border transition-all shadow-sm hover:shadow-lg ${status.label==='Missing'?'border-red-200':status.label==='Due Soon'?'border-amber-200':'border-gray-100'}`}>
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase flex items-center gap-1.5 border ${status.color}`}>
                        <status.icon className="w-3.5 h-3.5" />{status.label}
                      </span>
                      {a.subject && <span className="text-xs px-3 py-1 rounded-full font-bold uppercase bg-gray-100 text-gray-600">{a.subject}</span>}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">{a.title}</h2>
                    <p className="text-gray-600 mt-3 leading-relaxed">{a.description}</p>
                    
                    {a.fileName && (
                      <div className="mt-5 flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 w-fit">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-red-500" /></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{a.fileName}</p>
                          <a href={a.fileData} download={a.fileName} className="text-xs text-red-500 hover:underline font-bold mt-0.5 block">Download Question</a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="shrink-0 flex flex-col items-start md:items-end gap-5 border-t md:border-t-0 pt-5 md:pt-0 border-gray-100 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-50 px-4 py-2.5 rounded-xl w-full md:w-auto justify-center">
                      <Calendar className="w-4 h-4 text-red-500" /> Due: {a.dueDate || 'No Date'}
                    </div>
                    
                    {!hasSubmitted && status.label !== 'Missing' && (
                      <button onClick={() => setSelectedAssignment(a)} className="w-full md:w-auto px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md">
                        <Upload className="w-4 h-4" /> Submit Work
                      </button>
                    )}
                    
                    {hasSubmitted && mySub && (
                      <div className="w-full md:w-auto text-right">
                        <div className="bg-green-50 border border-green-100 p-3 rounded-xl flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <div className="text-left">
                            <p className="text-xs font-bold text-green-700">Submitted</p>
                            <a href={mySub.fileData} download={`my_${mySub.fileName}`} className="text-[10px] text-green-600 hover:underline font-semibold">{mySub.fileName}</a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="bg-white rounded-2xl p-20 text-center border border-gray-100">
            <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-5" />
            <h3 className="text-xl font-bold text-gray-700">No Assignments</h3>
            <p className="text-base text-gray-400 mt-2">You don't have any assignments currently.</p>
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            {submitted ? (
              <div className="p-14 text-center animate-fade-in"><div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-green-600" /></div><h3 className="text-xl font-bold text-gray-800">Submitted Successfully!</h3></div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between"><h2 className="text-xl font-bold text-gray-800">Submit Assignment</h2><button type="button" onClick={() => setSelectedAssignment(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button></div>
                <div className="p-6 space-y-5">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-sm font-bold text-gray-800">{selectedAssignment.title}</p>
                    <p className="text-xs text-gray-500 mt-1">Due: {selectedAssignment.dueDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Upload Answer File *</label>
                    {fileData ? (
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <FileText className="w-8 h-8 text-red-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{fileName}</p>
                          <p className="text-xs text-gray-400 uppercase">Ready to submit</p>
                        </div>
                        <button type="button" onClick={() => { setFileData(null); setFileName(''); }} className="p-2 hover:bg-gray-200 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-gray-200 hover:border-red-300 cursor-pointer hover:bg-red-50/30 transition-all">
                        <Upload className="w-10 h-10 text-gray-300 mb-3" />
                        <span className="text-base text-gray-500 font-semibold">Select file to upload</span>
                        <span className="text-xs text-gray-400 mt-1">PDF, Word, Images (max 10MB)</span>
                        <input type="file" onChange={handleFileChange} className="hidden" required />
                      </label>
                    )}
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button type="button" onClick={() => setSelectedAssignment(null)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-base text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={!fileData} className="flex-1 py-3.5 rounded-xl bg-red-500 text-white text-base font-semibold disabled:opacity-30 hover:bg-red-600 flex items-center justify-center gap-2 transition-all active:scale-95"><Send className="w-5 h-5" />Submit</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
