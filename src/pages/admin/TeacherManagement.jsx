import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Users, Plus, Trash2, X, CheckCircle2, UserPlus, Shield } from 'lucide-react';
import { departments, sections, years } from '../../data/campusData';

export default function TeacherManagement() {
  const { user } = useAuth();
  const { teachers, addTeacher, deleteTeacher } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ 
    id: '', name: '', dept: departments[0], password: 'teacher@123', adminRole: 'Teacher',
    assignedYears: [], assignedSections: [] 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.id || !form.name) return;
    
    // Ensure ID starts with T for teacher logic in Login
    const finalId = form.id.toUpperCase().startsWith('T') ? form.id.toUpperCase() : `T${form.id}`;
    
    addTeacher({ ...form, id: finalId, addedBy: user?.name || 'Admin' });
    setSubmitted(true);
    setTimeout(() => { 
      setShowForm(false); setSubmitted(false); 
      setForm({ id: '', name: '', dept: departments[0], password: 'teacher@123', adminRole: 'Teacher', assignedYears: [], assignedSections: [] }); 
    }, 1500);
  };

  const toggleArrayItem = (arrayName, value) => {
    setForm(prev => {
      const arr = prev[arrayName];
      if (arr.includes(value)) return { ...prev, [arrayName]: arr.filter(i => i !== value) };
      return { ...prev, [arrayName]: [...arr, value] };
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3 text-gray-900">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center"><Users className="w-6 h-6 text-red-500" /></div>
            Teacher Management
          </h1>
          <p className="text-gray-500 text-base mt-2 font-medium">Add teachers and assign them to departments and sections</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-6 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-base font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-200">
          <UserPlus className="w-5 h-5" />Add Teacher
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
        {teachers.map(t => (
          <div key={t.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-700 shadow-inner">
                  {t.name.charAt(0)}
                </div>
                <button onClick={() => { if(confirm('Delete teacher?')) deleteTeacher(t.id); }} className="p-2 hover:bg-red-50 rounded-xl transition-colors">
                  <Trash2 className="w-5 h-5 text-gray-300 hover:text-red-500" />
                </button>
              </div>
              <h3 className="text-xl font-bold text-gray-800">{t.name}</h3>
              <p className="text-sm font-mono text-gray-400 mt-1">{t.id}</p>
              
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase w-16">Dept:</span>
                  <span className="text-sm font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">{t.dept}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase w-16">Role:</span>
                  <span className={`text-sm font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${t.adminRole==='HOD'?'bg-red-50 text-red-600':'bg-blue-50 text-blue-600'}`}>
                    {t.adminRole==='HOD'&&<Shield className="w-3.5 h-3.5" />} {t.adminRole}
                  </span>
                </div>
              </div>

              {(t.assignedYears?.length > 0 || t.assignedSections?.length > 0) && (
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Assignments</p>
                  <div className="flex flex-wrap gap-2">
                    {t.assignedYears?.map(y => <span key={`y${y}`} className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-1 rounded-md font-bold">Year {y}</span>)}
                    {t.assignedSections?.map(s => <span key={`s${s}`} className="text-xs bg-green-50 text-green-600 border border-green-100 px-2 py-1 rounded-md font-bold">Sec {s}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {teachers.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-20 text-center border border-gray-100">
            <Users className="w-16 h-16 text-gray-200 mx-auto mb-5" />
            <h3 className="text-xl font-bold text-gray-700">No teachers added yet</h3>
            <p className="text-base text-gray-400 mt-2">Click the button above to add faculty members.</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {submitted ? (
              <div className="p-14 text-center animate-fade-in"><div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-green-600" /></div><h3 className="text-xl font-bold text-gray-800">Teacher Added!</h3></div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between"><h2 className="text-xl font-bold text-gray-800">Add Teacher</h2><button type="button" onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button></div>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div><label className="text-sm font-medium text-gray-600 mb-2 block">Teacher Name *</label><input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Dr. Rajesh Kumar" className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300" required /></div>
                    <div><label className="text-sm font-medium text-gray-600 mb-2 block">Teacher ID *</label><input type="text" value={form.id} onChange={e=>setForm({...form,id:e.target.value.toUpperCase()})} placeholder="e.g. T042" className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300 font-mono" required /></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Department</label>
                      <select value={form.dept} onChange={e=>setForm({...form,dept:e.target.value})} className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300">
                        {departments.map(d=><option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Role</label>
                      <select value={form.adminRole} onChange={e=>setForm({...form,adminRole:e.target.value})} className="w-full bg-gray-50 text-base px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300">
                        <option value="Teacher">Teacher</option>
                        <option value="HOD">HOD (Head of Dept)</option>
                        <option value="Professor">Professor</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <label className="text-sm font-bold text-gray-700 mb-3 block">Section Assignments (Optional)</label>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Years</p>
                        <div className="flex flex-wrap gap-2">
                          {years.map(y => (
                            <button key={y} type="button" onClick={() => toggleArrayItem('assignedYears', y)}
                              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${form.assignedYears.includes(y) ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                              Year {y}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Sections</p>
                        <div className="flex flex-wrap gap-2">
                          {sections.map(s => (
                            <button key={s} type="button" onClick={() => toggleArrayItem('assignedSections', s)}
                              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${form.assignedSections.includes(s) ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                              Section {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2">
                    <p className="text-xs text-gray-500 flex items-center gap-2"><Shield className="w-4 h-4 text-gray-400" /> Default password for this teacher will be <strong className="font-mono text-gray-700">teacher@123</strong></p>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-base text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={!form.id||!form.name} className="flex-1 py-3.5 rounded-xl bg-red-500 text-white text-base font-semibold disabled:opacity-30 hover:bg-red-600 transition-all active:scale-95">Add Teacher</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
