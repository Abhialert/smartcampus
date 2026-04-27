import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { UserCheck, CheckCircle2, Calendar, Users, Search } from 'lucide-react';
import { departments, years } from '../../data/campusData';

export default function AdminAttendance() {
  const { user } = useAuth();
  const { registeredStudents, addAttendanceRecord, attendanceRecords } = useApp();
  const [step, setStep] = useState('select'); // 'select', 'mark', 'done'
  const [filters, setFilters] = useState({ dept: '', year: '', subject: '', date: new Date().toISOString().split('T')[0] });
  const [attendance, setAttendance] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = registeredStudents.filter(s => {
    if (filters.dept && s.dept !== filters.dept) return false;
    if (filters.year && String(s.year) !== String(filters.year)) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return s.name?.toLowerCase().includes(term) || s.roll?.toLowerCase().includes(term);
    }
    return true;
  }).sort((a, b) => (a.roll || '').localeCompare(b.roll || ''));

  const startMarking = () => {
    if (!filters.subject || !filters.date) { alert('Please select subject and date'); return; }
    const initial = {};
    filteredStudents.forEach(s => { initial[s.roll] = true; }); // default present
    setAttendance(initial);
    setStep('mark');
  };

  const submitAttendance = async () => {
    const records = Object.entries(attendance).map(([roll, present]) => ({ roll, present }));
    await addAttendanceRecord({
      date: filters.date,
      subject: filters.subject,
      dept: filters.dept || 'All',
      year: filters.year || 'All',
      records,
      markedBy: user?.name || 'Teacher',
    });
    setStep('done');
    setTimeout(() => { setStep('select'); setAttendance({}); }, 2000);
  };

  const toggleAll = (value) => {
    const updated = {};
    filteredStudents.forEach(s => { updated[s.roll] = value; });
    setAttendance(updated);
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = Object.values(attendance).filter(v => !v).length;

  return (
    <div className="space-y-7 max-w-5xl mx-auto">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-black flex items-center gap-2 text-gray-900"><UserCheck className="w-6 h-6 text-red-500" />Attendance Management</h1>
        <p className="text-gray-500 text-sm mt-1">Mark attendance for your class</p>
      </div>

      {step === 'done' && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-green-600" /></div>
          <h3 className="text-xl font-bold text-gray-800">Attendance Saved!</h3>
          <p className="text-gray-500 text-sm mt-2">{presentCount} present, {absentCount} absent</p>
        </div>
      )}

      {step === 'select' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
          <h3 className="font-bold text-gray-700 flex items-center gap-2"><Calendar className="w-4 h-4 text-red-400" />Select Class Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Department</label>
              <select value={filters.dept} onChange={e => setFilters({...filters, dept: e.target.value})} className="w-full bg-gray-50 text-sm px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300">
                <option value="">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Year</label>
              <select value={filters.year} onChange={e => setFilters({...filters, year: e.target.value})} className="w-full bg-gray-50 text-sm px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300">
                <option value="">All Years</option>
                {years.map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Subject *</label>
              <input type="text" value={filters.subject} onChange={e => setFilters({...filters, subject: e.target.value})} placeholder="e.g. DBMS" className="w-full bg-gray-50 text-sm px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Date *</label>
              <input type="date" value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} className="w-full bg-gray-50 text-sm px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-500"><span className="font-bold text-gray-700">{filteredStudents.length}</span> students found</p>
            <button onClick={startMarking} disabled={!filters.subject || !filters.date || filteredStudents.length === 0}
              className="px-6 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-30 hover:bg-red-600 transition-all active:scale-95 shadow-md flex items-center gap-2">
              <UserCheck className="w-4 h-4" />Start Marking
            </button>
          </div>
        </div>
      )}

      {step === 'mark' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold text-gray-700">{filters.subject} — {filters.date}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{filters.dept || 'All Depts'} • {filters.year ? `Year ${filters.year}` : 'All Years'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">P: {presentCount}</span>
                <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full">A: {absentCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search student..."
                  className="w-full bg-gray-50 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300" />
              </div>
              <button onClick={() => toggleAll(true)} className="px-3 py-2 text-xs font-bold bg-green-50 text-green-600 rounded-xl hover:bg-green-100">All Present</button>
              <button onClick={() => toggleAll(false)} className="px-3 py-2 text-xs font-bold bg-red-50 text-red-500 rounded-xl hover:bg-red-100">All Absent</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50 max-h-[50vh] overflow-y-auto">
              {filteredStudents.map((s, idx) => (
                <div key={s.roll} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-8 font-mono">{idx + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{s.roll}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAttendance(prev => ({ ...prev, [s.roll]: !prev[s.roll] }))}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${attendance[s.roll] ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-100 text-red-500 hover:bg-red-200'}`}>
                    {attendance[s.roll] ? 'Present' : 'Absent'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('select')} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 font-semibold hover:bg-gray-50">Back</button>
            <button onClick={submitAttendance} className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all active:scale-95 shadow-md">
              Save Attendance ({presentCount}P / {absentCount}A)
            </button>
          </div>
        </div>
      )}

      {/* Recent Records */}
      {step === 'select' && attendanceRecords.length > 0 && (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100"><h3 className="font-bold text-gray-700">Recent Attendance Records</h3></div>
          <div className="divide-y divide-gray-50">
            {attendanceRecords.slice(0, 10).map(r => (
              <div key={r.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{r.subject} — {r.date}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.dept} • Year {r.year} • By {r.markedBy}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{r.records?.filter(s=>s.present).length}P</span>
                  <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{r.records?.filter(s=>!s.present).length}A</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
