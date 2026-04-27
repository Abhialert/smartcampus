import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { UserCheck, CheckCircle2, XCircle, Calendar, TrendingUp } from 'lucide-react';

export default function StudentAttendance() {
  const { user } = useAuth();
  const { attendanceRecords } = useApp();

  const myRecords = attendanceRecords.filter(r => r.records?.some(s => s.roll === user?.roll));
  const totalClasses = myRecords.length;
  const presentClasses = myRecords.filter(r => r.records?.find(s => s.roll === user?.roll)?.present).length;
  const absentClasses = totalClasses - presentClasses;
  const percent = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  // Subject-wise breakdown
  const subjectMap = {};
  myRecords.forEach(r => {
    const subj = r.subject || 'General';
    if (!subjectMap[subj]) subjectMap[subj] = { total: 0, present: 0 };
    subjectMap[subj].total++;
    if (r.records?.find(s => s.roll === user?.roll)?.present) subjectMap[subj].present++;
  });

  const getColor = (pct) => pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-amber-500' : 'text-red-500';
  const getBg = (pct) => pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-black flex items-center gap-3 text-gray-900">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center"><UserCheck className="w-6 h-6 text-red-500" /></div>
          My Attendance
        </h1>
        <p className="text-gray-500 text-sm mt-2 font-medium">Track your overall and subject-wise attendance.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 stagger-children">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
          <p className={`text-4xl font-black ${getColor(percent)}`}>{percent}%</p>
          <p className="text-xs text-gray-400 mt-1 font-bold uppercase">Overall</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
          <p className="text-4xl font-black text-gray-800">{totalClasses}</p>
          <p className="text-xs text-gray-400 mt-1 font-bold uppercase">Total Classes</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
          <p className="text-4xl font-black text-green-600">{presentClasses}</p>
          <p className="text-xs text-gray-400 mt-1 font-bold uppercase">Present</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
          <p className="text-4xl font-black text-red-500">{absentClasses}</p>
          <p className="text-xs text-gray-400 mt-1 font-bold uppercase">Absent</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-700 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-red-400" />Overall Progress</h3>
          <span className={`text-2xl font-black ${getColor(percent)}`}>{percent}%</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${getBg(percent)}`} style={{ width: `${percent}%` }} />
        </div>
        {percent < 75 && <p className="text-xs text-red-500 mt-2 font-semibold">⚠️ Below 75% minimum attendance requirement</p>}
      </div>

      {/* Subject Breakdown */}
      {Object.keys(subjectMap).length > 0 && (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100"><h3 className="font-bold text-gray-700">Subject-wise Breakdown</h3></div>
          <div className="divide-y divide-gray-50">
            {Object.entries(subjectMap).map(([subj, data]) => {
              const pct = Math.round((data.present / data.total) * 100);
              return (
                <div key={subj} className="p-5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800">{subj}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{data.present}/{data.total} classes attended</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${getBg(pct)}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`text-sm font-black ${getColor(pct)} w-12 text-right`}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Records */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100"><h3 className="font-bold text-gray-700">Recent Classes</h3></div>
        <div className="divide-y divide-gray-50">
          {myRecords.length > 0 ? myRecords.slice(0, 15).map((r) => {
            const myRecord = r.records?.find(s => s.roll === user?.roll);
            return (
              <div key={r.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {myRecord?.present ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-400" />}
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{r.subject || 'Class'}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{r.date}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${myRecord?.present ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                  {myRecord?.present ? 'Present' : 'Absent'}
                </span>
              </div>
            );
          }) : (
            <div className="p-12 text-center"><UserCheck className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-400 text-sm">No attendance records yet</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
