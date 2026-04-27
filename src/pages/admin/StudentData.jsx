import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Users, Upload, Search, CheckCircle2, UserPlus, Database, Trash2, Settings } from 'lucide-react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { years } from '../../data/campusData';
import * as XLSX from 'xlsx';

/* ── Column matching ── */
function matchCol(headers, hints, used = new Set()) {
  const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const h of headers) {
    if (used.has(h)) continue;
    const l = norm(h);
    for (const x of hints) { if (l === norm(x)) { used.add(h); return h; } }
  }
  for (const h of headers) {
    if (used.has(h)) continue;
    const l = norm(h);
    for (const x of hints) { 
      const nx = norm(x);
      if (nx.length > 2 && (l.includes(nx) || nx.includes(l))) { used.add(h); return h; } 
    }
  }
  return null;
}
const SID = ['student id', 'studentid', 'id', 'enrollment no', 'registration no', 'reg no', 'reg. no', 'student code'];
const R = ['roll no','rollno','roll number','roll','university roll'];
const N = ['name','student name','full name','first name','student'];
const D = ['department','dept','branch','stream','course name','course','program','trade'];
const Y = ['year','yr','semester','sem'];
const S = ['section','sec','division','batch','group'];
/* ── Known dept code mappings ── */
const KNOWN_DEPT_MAP = {
  '1':'CSE','01':'CSE','cs':'CSE','cse':'CSE','computer science':'CSE','comp sci':'CSE',
  '2':'IT','02':'IT','it':'IT','information technology':'IT',
  '3':'ECE','03':'ECE','ec':'ECE','ece':'ECE','electronics':'ECE',
  '4':'EE','04':'EE','ee':'EE','electrical':'EE',
  '5':'ME','05':'ME','me':'ME','mechanical':'ME',
  '6':'CE','06':'CE','ce':'CE','civil':'CE',
  'cse(ds)':'CSE Data Science','cse ds':'CSE Data Science','cse data science':'CSE Data Science',
  'cse(iot)':'CSE IoT','cse iot':'CSE IoT',
  'cse(aiml)':'CSE AIML','cse aiml':'CSE AIML','aiml':'CSE AIML',
};

function normalizeDept(raw) {
  if (!raw) return '';
  const l = String(raw).trim().toLowerCase();
  
  if (KNOWN_DEPT_MAP[l]) return KNOWN_DEPT_MAP[l];

  // Smart matching for full degree/course names
  if (l.includes('business administration')) {
    if (l.includes('master') || l.includes('mba')) return 'MBA';
    return 'BBA';
  }
  if (l.includes('computer application')) {
    return 'BCA';
  }
  
  if (l.includes('computer science') || l.includes('computer engineering') || l === 'cse') {
    if (l.includes('data science') || l.includes('ds')) return 'CSE Data Science';
    if (l.includes('iot') || l.includes('internet of things')) return 'CSE IoT';
    if (l.includes('aiml') || l.includes('artificial intelligence') || l.includes('machine learning')) return 'CSE AIML';
    return 'CSE';
  }
  
  if (l.includes('information technology') || l.includes('information tech') || l === 'it') return 'IT';
  if (l.includes('electronics') || l.includes('communication') || l === 'ece') return 'ECE';
  if (l.includes('electrical') || l === 'ee') return 'EE';
  if (l.includes('mechanical') || l === 'me') return 'ME';
  if (l.includes('civil') || l === 'ce') return 'CE';

  // Check if already a good name
  const upper = String(raw).trim().toUpperCase();
  if (['CSE','IT','ECE','EE','ME','CE','BCA','BBA','MBA'].includes(upper)) return upper;
  if (upper.startsWith('CSE')) return String(raw).trim(); // CSE Data Science etc
  return String(raw).trim(); // return as-is, user will fix via mapper
}

export default function StudentData() {
  const { registeredStudents } = useApp();
  const [uploading, setUploading] = useState(false);
  const [log, setLog] = useState([]);
  const [search, setSearch] = useState('');
  const [fDept, setFDept] = useState('');
  const [fYear, setFYear] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  // Pre-save staging
  const [staged, setStaged] = useState(null); // merged students before save
  const [deptMap, setDeptMap] = useState({}); // { "53": "CSE", "112": "IT" }

  const addLog = (msg, type='info') => setLog(p => [...p, { msg, type, t: new Date().toLocaleTimeString() }]);

  /* ═══ UPLOAD & PARSE (does NOT save yet) ═══ */
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true); setLog([]); setStaged(null); setDeptMap({});

    const map = new Map();

    for (const file of files) {
      addLog(`📂 ${file.name}`);
      try {
        const wb = XLSX.read(await file.arrayBuffer());
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
        if (!rows.length) { addLog('  Empty — skipped', 'err'); continue; }

        const hdr = Object.keys(rows[0]);
        addLog(`  Columns: ${hdr.join(' | ')}`);

        const used = new Set();
        let dc = matchCol(hdr, D, used);
        let sidc = matchCol(hdr, SID, used);
        let rc = matchCol(hdr, R, used);
        let yc = matchCol(hdr, Y, used);
        let sc = matchCol(hdr, S, used);
        let nc = matchCol(hdr, N, used);

        // Fallback: find numeric col as roll/sid, text col as name
        if (!rc && !sidc && !nc) {
          for (const h of hdr) { const v = String(rows[0][h]).trim(); if (!rc && !sidc && /^\d{5,}$/.test(v)) rc = h; }
          for (const h of hdr) { if (h === rc || h === sidc) continue; const v = String(rows[0][h]).trim(); if (!nc && v && !/^\d+$/.test(v) && v.length > 1) nc = h; }
          if (rc || sidc) addLog(`  Fallback: "${rc||sidc}" → ID, "${nc||'?'}" → name`, 'warn');
        }

        const found = [sidc&&`ID→"${sidc}"`, rc&&`Roll→"${rc}"`, nc&&`Name→"${nc}"`, dc&&`Dept→"${dc}"`, yc&&`Year→"${yc}"`, sc&&`Sec→"${sc}"`].filter(Boolean);
        addLog(`  Mapped: ${found.join(', ') || '⚠ NONE'}`, found.length ? 'ok' : 'err');
        if (!rc && !sidc && !nc) { addLog('  ✗ Skipped — no usable columns', 'err'); continue; }

        for (const row of rows) {
          const sid = sidc ? String(row[sidc]).trim() : '';
          const roll = rc ? String(row[rc]).trim() : '';
          const name = nc ? String(row[nc]).trim() : '';
          const dept = dc ? String(row[dc]).trim() : '';
          const yr = yc ? String(row[yc]).trim() : '';
          const sec = sc ? String(row[sc]).trim() : '';

          const key = (sid || roll || '').toLowerCase();
          if (!key) continue;
          const prev = map.get(key) || {};
          if (sid) prev.sid = prev.sid || sid;
          if (roll) prev.roll = prev.roll || roll;
          if (name) prev.name = prev.name || name;
          if (dept) prev.dept = prev.dept || dept;
          if (yr) prev.year = prev.year || yr;
          if (sec) prev.section = prev.section || sec;
          map.set(key, prev);
        }
        addLog(`  ✓ ${rows.length} rows`, 'ok');
      } catch (err) { addLog(`  ✗ ${err.message}`, 'err'); }
    }

    // Build staged list
    const students = [];
    for (const [, rec] of map) {
      const sid = rec.sid || '';
      const roll = rec.roll || '';
      if (!sid && !roll) continue;
      students.push({
        sid, roll, name: rec.name || `Student ${sid || roll}`,
        rawDept: rec.dept || '', dept: normalizeDept(rec.dept),
        year: parseInt(rec.year) || 1, section: rec.section || '',
      });
    }
    students.sort((a, b) => (a.roll || a.sid || '').localeCompare(b.roll || b.sid || ''));

    // Find unknown dept values (numeric or unrecognized)
    const unknowns = new Set();
    students.forEach(s => {
      if (s.rawDept && /^\d+$/.test(s.rawDept)) unknowns.add(s.rawDept);
      else if (s.rawDept && s.dept === s.rawDept && !['CSE','IT','ECE','EE','ME','CE','BCA','BBA','MBA','General'].includes(s.dept.toUpperCase()) && !s.dept.toUpperCase().startsWith('CSE')) {
        unknowns.add(s.rawDept);
      }
    });

    const initialMap = {};
    unknowns.forEach(u => { initialMap[u] = ''; });

    addLog(`\n🔗 Merged: ${students.length} students`);
    if (unknowns.size > 0) addLog(`⚠ ${unknowns.size} unknown dept code(s) found: ${[...unknowns].join(', ')} — please map them below`, 'warn');
    else addLog('✓ All departments recognized', 'ok');

    setStaged(students);
    setDeptMap(initialMap);
    setUploading(false);
    e.target.value = '';
  };

  /* ═══ SAVE TO FIRESTORE ═══ */
  const handleSave = async () => {
    if (!staged) return;
    setUploading(true);

    // Load existing rolls for dedup
    const existing = new Set();
    try {
      const snap = await getDocs(collection(db, 'students'));
      snap.forEach(d => { 
        const r = d.data().roll; if (r) existing.add(String(r).trim().toLowerCase()); 
        const sid = d.data().sid; if (sid) existing.add(String(sid).trim().toLowerCase());
      });
    } catch (e) { /* proceed */ }

    let added = 0, dupes = 0;
    for (const s of staged) {
      const keyRoll = (s.roll || '').toLowerCase().trim();
      const keySid = (s.sid || '').toLowerCase().trim();
      if ((keyRoll && existing.has(keyRoll)) || (keySid && existing.has(keySid))) { dupes++; continue; }

      // Apply dept mapping
      let finalDept = s.dept;
      if (deptMap[s.rawDept]) finalDept = deptMap[s.rawDept];
      if (!finalDept || /^\d+$/.test(finalDept)) finalDept = 'General';

      try {
        await addDoc(collection(db, 'students'), {
          sid: s.sid, roll: s.roll, name: s.name, dept: finalDept,
          year: s.year, section: s.section, 
          password: (s.sid || s.roll) + '_St',
        });
        if (keyRoll) existing.add(keyRoll);
        if (keySid) existing.add(keySid);
        added++;
      } catch (err) { /* skip */ }
    }

    addLog(`\n✅ ${added} students saved`, 'ok');
    if (dupes) addLog(`⏭️ ${dupes} duplicates skipped`, 'warn');
    setStaged(null); setDeptMap({});
    setUploading(false);
  };

  /* ═══ CLEAR ═══ */
  const clearAll = async () => {
    setConfirmClear(false); setUploading(true); setLog([]);
    addLog('Deleting all...');
    try {
      const snap = await getDocs(collection(db, 'students'));
      for (const d of snap.docs) await deleteDoc(doc(db, 'students', d.id));
      addLog(`✅ Deleted ${snap.docs.length}`, 'ok');
    } catch (err) { addLog(`✗ ${err.message}`, 'err'); }
    setUploading(false);
  };

  const deleteStudent = async (id, name) => {
    if (!window.confirm(`Delete student: ${name}?`)) return;
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (err) { addLog(`✗ Failed to delete ${name}: ${err.message}`, 'err'); }
  };

  /* ═══ DATA ═══ */
  const deptCounts = {};
  registeredStudents.forEach(s => { const d = s.dept || 'N/A'; deptCounts[d] = (deptCounts[d] || 0) + 1; });
  const sortedDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);

  const filtered = registeredStudents.filter(s => {
    if (fDept && s.dept !== fDept) return false;
    if (fYear && String(s.year) !== fYear) return false;
    if (search) { const q = search.toLowerCase(); return s.name?.toLowerCase().includes(q) || s.roll?.toLowerCase().includes(q) || s.sid?.toLowerCase().includes(q); }
    return true;
  }).sort((a, b) => (a.roll || a.sid || '').localeCompare(b.roll || b.sid || ''));

  const DEPT_OPTIONS = ['CSE','CSE Data Science','CSE IoT','CSE AIML','IT','ECE','EE','ME','CE','BCA','BBA','MBA','General'];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="section-title"><div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center"><Database className="w-6 h-6 text-red-500" /></div>Student Data</h1>
          <p className="text-gray-500 mt-2 text-base">Upload → map departments → save with <strong>zero duplicates</strong></p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-6 py-4 rounded-xl border border-gray-200 text-center shadow-sm">
            <p className="text-3xl font-black text-gray-800">{registeredStudents.length}</p>
            <p className="text-xs font-bold text-gray-400 uppercase">Total Students</p>
          </div>
          {registeredStudents.length > 0 && <button onClick={() => setConfirmClear(true)} className="p-3.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 transition-colors"><Trash2 className="w-5 h-5 text-red-400" /></button>}
        </div>
      </div>

      {confirmClear && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div><p className="text-lg font-bold text-red-700">⚠️ Delete all {registeredStudents.length} records?</p><p className="text-sm text-red-500 mt-1">Cannot be undone.</p></div>
          <div className="flex gap-3"><button onClick={() => setConfirmClear(false)} className="btn-secondary px-6">Cancel</button><button onClick={clearAll} className="btn-primary !bg-red-600 px-6">Delete All</button></div>
        </div>
      )}

      {/* Dept Breakdown */}
      {sortedDepts.length > 0 && (
        <div className="animate-fade-in">
          <h2 className="text-base font-bold text-gray-700 mb-4 uppercase tracking-wider">Department Breakdown</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 stagger-children">
            {sortedDepts.map(([dept, count]) => {
              const pct = Math.round((count / registeredStudents.length) * 100);
              return (
                <button key={dept} onClick={() => setFDept(fDept === dept ? '' : dept)}
                  className={`rounded-2xl p-5 border text-left transition-all hover:shadow-md active:scale-[0.97] ${fDept === dept ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-200' : 'bg-white text-gray-800 border-gray-100'}`}>
                  <p className={`text-3xl font-black ${fDept === dept ? 'text-white' : 'text-gray-800'}`}>{count}</p>
                  <p className={`text-base font-bold mt-1 ${fDept === dept ? 'text-red-100' : 'text-gray-700'}`}>{dept}</p>
                  <div className={`w-full h-1.5 rounded-full mt-3 ${fDept === dept ? 'bg-red-400' : 'bg-gray-100'}`}>
                    <div className={`h-full rounded-full ${fDept === dept ? 'bg-white' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className={`text-xs font-bold mt-1.5 ${fDept === dept ? 'text-red-200' : 'text-gray-400'}`}>{pct}%</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">📁 Upload Student Files</h3>
          <p className="text-sm text-gray-500 mt-1">Select all your files at once. We'll merge them, then let you map department codes before saving.</p>
        </div>
        <div className="p-6 space-y-4">
          <label className={`flex flex-col items-center justify-center w-full py-10 rounded-xl border-2 border-dashed cursor-pointer transition-all ${uploading ? 'border-gray-200 bg-gray-50 pointer-events-none' : 'border-red-200 hover:border-red-400 hover:bg-red-50/30'}`}>
            {uploading ? <><div className="w-8 h-8 border-3 border-red-300 border-t-red-500 rounded-full animate-spin mb-3" /><span className="text-base font-bold text-gray-500">Processing...</span></>
              : <><Upload className="w-10 h-10 text-red-400 mb-3" /><span className="text-lg font-bold text-gray-700">Click to select files</span><span className="text-sm text-gray-400 mt-1">Excel / CSV — multiple files OK</span></>}
            <input type="file" accept=".xlsx,.xls,.csv" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>

          {log.length > 0 && (
            <div className="bg-gray-900 rounded-xl p-4 max-h-48 overflow-y-auto font-mono text-sm space-y-0.5">
              {log.map((l, i) => <div key={i} className={l.type==='err'?'text-red-400':l.type==='ok'?'text-green-400':l.type==='warn'?'text-amber-400':'text-gray-300'}><span className="text-gray-600 mr-2">{l.t}</span>{l.msg}</div>)}
            </div>
          )}
        </div>
      </div>

      {/* ══ DEPT MAPPING STEP ══ */}
      {staged && Object.keys(deptMap).length > 0 && (
        <div className="bg-amber-50 rounded-2xl border-2 border-amber-200 p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-6 h-6 text-amber-600" />
            <div><h3 className="text-lg font-bold text-amber-800">Map Department Codes</h3>
              <p className="text-sm text-amber-600">Your files have numeric/unknown department codes. Select what each one means:</p></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(deptMap).map(([code, mapped]) => (
              <div key={code} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-amber-100">
                <span className="text-lg font-black text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg min-w-[3rem] text-center">{code}</span>
                <span className="text-gray-400 font-bold">→</span>
                <select value={mapped} onChange={e => setDeptMap(p => ({ ...p, [code]: e.target.value }))} className="form-input flex-1 !py-2.5">
                  <option value="">— Select Dept —</option>
                  {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ STAGED PREVIEW + SAVE ══ */}
      {staged && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
            <div><h3 className="text-lg font-bold text-gray-800">Preview — {staged.length} students ready</h3>
              <p className="text-sm text-gray-500">Review the data below, then click Save.</p></div>
            <button onClick={handleSave} disabled={uploading} className="btn-primary px-8">
              {uploading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Database className="w-5 h-5" /> Save to Database</>}
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0"><tr className="border-b border-gray-200">
                <th className="text-left p-3 font-bold text-gray-600">SL. No</th>
                <th className="text-left p-3 font-bold text-gray-600">Name</th>
                <th className="text-left p-3 font-bold text-gray-600">Roll No.</th>
                <th className="text-left p-3 font-bold text-gray-600">Student ID</th>
                <th className="text-left p-3 font-bold text-gray-600">Course Name</th>
                <th className="text-left p-3 font-bold text-gray-600">Year</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {staged.slice(0, 30).map((s, i) => {
                  const finalDept = deptMap[s.rawDept] || s.dept || 'General';
                  return (
                    <tr key={i} className="hover:bg-blue-50/30">
                      <td className="p-3 text-gray-400 font-mono">{i+1}</td>
                      <td className="p-3 font-semibold text-gray-800">{s.name}</td>
                      <td className="p-3 font-mono text-gray-500">{s.roll || '-'}</td>
                      <td className="p-3 font-mono text-gray-500">{s.sid || '-'}</td>
                      <td className="p-3">
                        {s.rawDept && s.rawDept !== finalDept
                          ? <><span className="text-xs text-gray-400 line-through mr-1">{s.rawDept}</span><span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">{finalDept}</span></>
                          : <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{finalDept}</span>}
                      </td>
                      <td className="p-3 text-gray-700">{s.year}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {staged.length > 30 && <div className="p-3 text-center text-sm text-gray-400 bg-gray-50">...and {staged.length - 30} more</div>}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Student Name, Roll No., or Student ID..." className="form-input w-full pl-12 py-3.5 text-base md:text-lg" />
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <select value={fDept} onChange={e => setFDept(e.target.value)} className="form-input flex-1 md:flex-none md:w-64"><option value="">All Departments</option>{sortedDepts.map(([d]) => <option key={d} value={d}>{d}</option>)}</select>
          <select value={fYear} onChange={e => setFYear(e.target.value)} className="form-input flex-1 md:flex-none md:w-48"><option value="">All Years</option>{years.map(y => <option key={y} value={String(y)}>Year {y}</option>)}</select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <h3 className="text-lg font-bold text-gray-700">Student Records</h3>
          <span className="text-sm font-bold text-gray-400 bg-white px-4 py-2 rounded-lg border border-gray-100">{filtered.length} of {registeredStudents.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-200 text-sm text-gray-500 bg-gray-50/50">
              <th className="text-left p-4 font-bold w-16">SL. No</th>
              <th className="text-left p-4 font-bold">Name</th>
              <th className="text-left p-4 font-bold">Roll No.</th>
              <th className="text-left p-4 font-bold">Student ID</th>
              <th className="text-left p-4 font-bold">Course Name</th>
              <th className="text-left p-4 font-bold w-24">Year</th>
              <th className="text-right p-4 font-bold w-16"></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.slice(0, 100).map((s, i) => (
                <tr key={s.id || i} className="hover:bg-red-50/30 transition-colors">
                  <td className="p-4 text-sm text-gray-400 font-mono">{i + 1}</td>
                  <td className="p-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-sm font-bold text-red-500 shrink-0">{s.name?.charAt(0)}</div><span className="font-semibold text-gray-800">{s.name}</span></div></td>
                  <td className="p-4 text-sm font-mono text-gray-500">{s.roll || '-'}</td>
                  <td className="p-4 text-sm font-mono text-gray-500">{s.sid || '-'}</td>
                  <td className="p-4"><span className="text-sm font-bold bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">{s.dept}</span></td>
                  <td className="p-4 text-sm font-bold text-gray-700">{s.year}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => deleteStudent(s.id, s.name)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Student">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-20 text-center"><UserPlus className="w-16 h-16 text-gray-200 mx-auto mb-4" /><h3 className="text-xl font-bold text-gray-600">No students found</h3><p className="text-base text-gray-400 mt-2">{registeredStudents.length === 0 ? 'Upload files above.' : 'Adjust filters.'}</p></div>}
        {filtered.length > 100 && <div className="p-4 text-center border-t border-gray-100"><p className="text-sm text-gray-400">Showing 100 of {filtered.length}</p></div>}
      </div>
    </div>
  );
}
