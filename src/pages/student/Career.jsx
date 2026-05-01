import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { internships as fallbackInternships, placementResources, prepCategories, skillsByDept } from '../../data/careerData';
import { campusClubs, campusEvents } from '../../data/clubsData';
import { Briefcase, FileText, GraduationCap, Search, ExternalLink, Bookmark, BookmarkCheck, Clock, MapPin, Download, CheckCircle, ArrowRight, Loader2, Wifi, WifiOff } from 'lucide-react';

const BM_KEY = 'smartcampus_internship_bookmarks';
const PP_KEY = 'smartcampus_prep_progress';

// Map departments to Remotive API search categories/tags
// Real Indian job platforms with dept-specific search URLs
const getJobPlatforms = (dept) => {
  const deptTerms = { CSE: 'computer+science', IT: 'information+technology', ECE: 'electronics', EE: 'electrical+engineering', ME: 'mechanical', CE: 'civil' };
  const term = deptTerms[dept] || 'engineering';
  return [
    { id: 'internshala', name: 'Internshala', emoji: '🔵', color: '#00A5EC', desc: 'India\'s #1 internship platform', stats: '200K+ internships', url: `https://internshala.com/internships/${term.replace(/\+/g, '-')}-internship`, tags: ['Internships', 'WFH', 'Stipend'] },
    { id: 'linkedin', name: 'LinkedIn Jobs', emoji: '🔷', color: '#0A66C2', desc: 'Professional network job search', stats: 'Global opportunities', url: `https://www.linkedin.com/jobs/search/?keywords=${term}+intern&location=India&f_E=1`, tags: ['Jobs', 'Networking', 'MNC'] },
    { id: 'unstop', name: 'Unstop', emoji: '🟠', color: '#FF6B35', desc: 'Competitions, hackathons & hiring', stats: '50K+ opportunities', url: `https://unstop.com/internships?oppstatus=recent`, tags: ['Competitions', 'Hackathons', 'Hiring'] },
    { id: 'wellfound', name: 'Wellfound', emoji: '🚀', color: '#000', desc: 'Startup jobs & internships', stats: 'Startup ecosystem', url: `https://wellfound.com/role/intern`, tags: ['Startups', 'Equity', 'Remote'] },
    { id: 'naukri', name: 'Naukri.com', emoji: '🔴', color: '#4A90D9', desc: 'India\'s largest job portal', stats: '500K+ jobs', url: `https://www.naukri.com/${term.replace(/\+/g, '-')}-internship-jobs`, tags: ['Jobs', 'Fresher', 'India'] },
    { id: 'hirect', name: 'Hirect', emoji: '💬', color: '#6C5CE7', desc: 'Chat-based hiring for startups', stats: 'Direct chat with founders', url: 'https://hirect.in/', tags: ['Startups', 'Direct Hire', 'Chat'] },
  ];
};

export default function Career() {
  const { user } = useAuth();
  const { attendanceRecords } = useApp();
  const [tab, setTab] = useState('internships');
  const [search, setSearch] = useState('');
  const [bookmarks, setBookmarks] = useState(() => JSON.parse(localStorage.getItem(BM_KEY) || '[]'));
  const [prepProgress, setPrepProgress] = useState(() => JSON.parse(localStorage.getItem(PP_KEY) || '[]'));
  const [prepFilter, setPrepFilter] = useState('all');
  const resumeRef = useRef(null);

  const jobPlatforms = getJobPlatforms(user?.dept || 'CSE');

  useEffect(() => { localStorage.setItem(BM_KEY, JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem(PP_KEY, JSON.stringify(prepProgress)); }, [prepProgress]);

  const toggleBookmark = (id) => setBookmarks(p => p.includes(id) ? p.filter(b => b !== id) : [...p, id]);
  const togglePrepDone = (id) => setPrepProgress(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const joinedClubs = JSON.parse(localStorage.getItem('smartcampus_joined_clubs') || '[]');
  const eventRsvps = JSON.parse(localStorage.getItem('smartcampus_event_rsvps') || '[]');
  const skillRatings = JSON.parse(localStorage.getItem('smartcampus_skill_ratings') || '{}');
  const myClubNames = campusClubs.filter(c => joinedClubs.includes(c.id)).map(c => c.name);
  const myEventNames = campusEvents.filter(e => eventRsvps.includes(e.id)).map(e => e.title);
  const mySkills = skillsByDept[user?.dept || 'CSE'] || [];
  const topSkills = mySkills.filter(s => (skillRatings[s.id] || 0) >= 6).map(s => s.name);

  const myAtt = attendanceRecords.filter(r => r.records?.some(s => s.roll === user?.roll));
  const totalC = myAtt.length;
  const presentC = myAtt.filter(r => r.records?.find(s => s.roll === user?.roll)?.present).length;
  const attPct = totalC > 0 ? Math.round((presentC / totalC) * 100) : 0;
  const filteredPrep = placementResources.filter(r => prepFilter === 'all' || r.category === prepFilter);
  const prepDone = placementResources.filter(r => prepProgress.includes(r.id)).length;
  const prepTotal = placementResources.length;

  const handlePrint = () => {
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Resume - ${user?.name}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;color:#1a1a2e;padding:40px;line-height:1.6;max-width:800px;margin:0 auto}h1{font-size:28px;margin-bottom:4px}h2{font-size:15px;text-transform:uppercase;letter-spacing:2px;color:#dc2626;border-bottom:2px solid #dc2626;padding-bottom:4px;margin:22px 0 10px}.sub{font-size:13px;color:#6b7280}ul{padding-left:20px}li{font-size:13px;margin-bottom:4px}.tags{display:flex;flex-wrap:wrap;gap:6px}.tag{background:#fef2f2;color:#dc2626;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}</style></head><body>${resumeRef.current.innerHTML}</body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">Career <span className="text-red-500">Hub</span> 🚀</h1>
        <p className="text-gray-500 text-lg font-medium mt-2">Internships, auto-resume & placement prep — tailored for {user?.dept || 'you'}</p>
      </div>

      <div className="flex gap-3 bg-gray-50 p-1.5 rounded-2xl">
        {[{id:'internships',label:'Internships',Icon:Briefcase},{id:'resume',label:'Smart Resume',Icon:FileText},{id:'prep',label:'Placement Prep',Icon:GraduationCap}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all flex-1 justify-center ${tab===t.id?'bg-white text-red-600 shadow-md':'text-gray-500 hover:text-gray-700'}`}>
            <t.Icon className="w-4 h-4" /><span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'internships' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">🔍 Job & Internship Aggregator</h3>
              <p className="text-sm text-gray-500">We've pre-built specific search queries on top Indian platforms tailored for <strong>{user?.dept || 'CSE'}</strong> students. No more manual searching!</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {jobPlatforms.map(platform => (
              <a key={platform.id} href={platform.url} target="_blank" rel="noopener noreferrer"
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all card-hover group block relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full opacity-50 z-0" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm" style={{ backgroundColor: platform.color + '15' }}>
                        {platform.emoji}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{platform.name}</h3>
                        <p className="text-xs font-bold text-gray-400">{platform.stats}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{platform.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {platform.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide bg-gray-50 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {tab === 'resume' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl p-6 border border-red-100">
            <h3 className="text-lg font-bold text-gray-800 mb-1">🪄 Auto-Generated Resume</h3>
            <p className="text-sm text-gray-500">Built from your SmartCampus data. <strong>Zero typing.</strong></p>
            <button onClick={handlePrint} className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 active:scale-95 shadow-lg shadow-red-200"><Download className="w-4 h-4"/>Download / Print</button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2"><div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400"/><div className="w-3 h-3 rounded-full bg-amber-400"/><div className="w-3 h-3 rounded-full bg-green-400"/></div><span className="text-xs font-bold text-gray-400 ml-2">Resume Preview</span></div>
            <div ref={resumeRef} className="p-8 sm:p-12" style={{fontFamily:"'Segoe UI',system-ui,sans-serif",color:'#1a1a2e',lineHeight:1.6}}>
              <h1 style={{fontSize:28,fontWeight:800}}>{user?.name||'Student'}</h1>
              <p className="sub" style={{fontSize:13,color:'#6b7280',marginBottom:16}}>{user?.dept} • Year {user?.year} • Techno Main Salt Lake, Kolkata</p>
              <p style={{fontSize:13,color:'#6b7280',marginBottom:4}}>📧 {user?.roll?.toLowerCase()}@tmsl.edu.in &nbsp;|&nbsp; 🔗 linkedin.com/in/{(user?.name||'').toLowerCase().replace(/\s/g,'-')}</p>
              <h2 style={{fontSize:15,textTransform:'uppercase',letterSpacing:2,color:'#dc2626',borderBottom:'2px solid #dc2626',paddingBottom:4,margin:'22px 0 10px'}}>Education</h2>
              <p style={{fontWeight:700,fontSize:14}}>B.Tech in {user?.dept==='CSE'?'Computer Science & Engineering':user?.dept==='IT'?'Information Technology':user?.dept==='ECE'?'Electronics & Communication':user?.dept==='EE'?'Electrical Engineering':user?.dept||'Engineering'}</p>
              <p style={{fontSize:13,color:'#6b7280'}}>Techno Main Salt Lake | Year {user?.year} | MAKAUT{totalC>0?` | Attendance: ${attPct}%`:''}</p>

              {(topSkills.length>0||mySkills.length>0)&&(<><h2 style={{fontSize:15,textTransform:'uppercase',letterSpacing:2,color:'#dc2626',borderBottom:'2px solid #dc2626',paddingBottom:4,margin:'22px 0 10px'}}>Skills</h2>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{(topSkills.length?topSkills:mySkills.slice(0,6).map(s=>s.name)).map(s=><span key={s} style={{background:'#fef2f2',color:'#dc2626',padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:600}}>{s}</span>)}</div></>)}

              {myClubNames.length>0&&(<><h2 style={{fontSize:15,textTransform:'uppercase',letterSpacing:2,color:'#dc2626',borderBottom:'2px solid #dc2626',paddingBottom:4,margin:'22px 0 10px'}}>Clubs & Activities</h2>
              <ul style={{paddingLeft:20}}>{myClubNames.map(c=><li key={c} style={{fontSize:13,marginBottom:4}}>Active Member — <strong>{c}</strong></li>)}</ul></>)}

              {myEventNames.length>0&&(<><h2 style={{fontSize:15,textTransform:'uppercase',letterSpacing:2,color:'#dc2626',borderBottom:'2px solid #dc2626',paddingBottom:4,margin:'22px 0 10px'}}>Events Participated</h2>
              <ul style={{paddingLeft:20}}>{myEventNames.map(e=><li key={e} style={{fontSize:13,marginBottom:4}}>{e}</li>)}</ul></>)}

              {(() => { const p = JSON.parse(localStorage.getItem('smartcampus_platform_usernames') || '{}'); return p.leetcode || p.codeforces || p.github ? (
                <><h2 style={{fontSize:15,textTransform:'uppercase',letterSpacing:2,color:'#dc2626',borderBottom:'2px solid #dc2626',paddingBottom:4,margin:'22px 0 10px'}}>Coding Profiles</h2>
                <ul style={{paddingLeft:20}}>
                  {p.leetcode && <li style={{fontSize:13,marginBottom:4}}>LeetCode: <strong>leetcode.com/u/{p.leetcode}</strong></li>}
                  {p.codeforces && <li style={{fontSize:13,marginBottom:4}}>Codeforces: <strong>codeforces.com/profile/{p.codeforces}</strong></li>}
                  {p.github && <li style={{fontSize:13,marginBottom:4}}>GitHub: <strong>github.com/{p.github}</strong></li>}
                </ul></>
              ) : null; })()}

              <h2 style={{fontSize:15,textTransform:'uppercase',letterSpacing:2,color:'#dc2626',borderBottom:'2px solid #dc2626',paddingBottom:4,margin:'22px 0 10px'}}>Additional</h2>
              <ul style={{paddingLeft:20}}>
                <li style={{fontSize:13,marginBottom:4}}>SmartCampus — active digital campus user</li>
                {prepDone>0&&<li style={{fontSize:13,marginBottom:4}}>Placement Prep — {prepDone}/{prepTotal} modules done</li>}
              </ul>
            </div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <h4 className="text-sm font-bold text-blue-700 mb-2">💡 Make your resume stronger</h4>
            <ul className="space-y-1 text-sm text-blue-600">
              {myClubNames.length===0&&<li>→ <strong>Join clubs</strong> to add activities</li>}
              {myEventNames.length===0&&<li>→ <strong>RSVP to events</strong> to show participation</li>}
              {topSkills.length===0&&<li>→ <strong>Rate skills</strong> in Skill Tracker</li>}
              {!JSON.parse(localStorage.getItem('smartcampus_platform_usernames') || '{}').leetcode&&<li>→ <strong>Link LeetCode/GitHub</strong> in Skill Radar for coding profiles</li>}
              {myClubNames.length>0&&myEventNames.length>0&&topSkills.length>0&&<li>✅ Great job! Resume looking solid.</li>}
            </ul>
          </div>
        </div>
      )}

      {tab === 'prep' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3"><h3 className="text-lg font-bold text-gray-800">Your Progress</h3><span className="text-sm font-bold text-red-500">{Math.round((prepDone/prepTotal)*100)}%</span></div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full transition-all duration-700" style={{width:`${(prepDone/prepTotal)*100}%`}}/></div>
            <p className="text-sm text-gray-400 mt-2">{prepDone}/{prepTotal} topics done</p>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {prepCategories.map(c=><button key={c.id} onClick={()=>setPrepFilter(c.id)} className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${prepFilter===c.id?'bg-red-50 text-red-600 border-2 border-red-200':'bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-gray-100'}`}>{c.emoji} {c.label}</button>)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
            {filteredPrep.map(r=>{
              const done=prepProgress.includes(r.id);
              return(
                <div key={r.id} className={`bg-white rounded-2xl border p-5 transition-all card-hover group ${done?'border-green-200 bg-green-50/30':'border-gray-100'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-xl">{r.icon}</div>
                      <div><h3 className="text-base font-bold text-gray-900">{r.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${r.difficulty==='Easy'?'bg-green-100 text-green-600':r.difficulty==='Medium'?'bg-amber-100 text-amber-600':'bg-red-100 text-red-600'}`}>{r.difficulty}</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3"/>{r.time}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={()=>togglePrepDone(r.id)} className={`p-2 rounded-lg ${done?'text-green-500':'text-gray-300 hover:text-green-400'}`}><CheckCircle className="w-6 h-6"/></button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">{r.topics.map(t=><span key={t} className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-500 font-semibold">{t}</span>)}</div>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600">Start Learning <ArrowRight className="w-3 h-3"/></a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
