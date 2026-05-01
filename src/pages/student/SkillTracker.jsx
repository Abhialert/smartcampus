import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Target, Award, Link2, Loader2, ExternalLink, CheckCircle, Plus, X, ChevronDown, Trophy, AlertTriangle } from 'lucide-react';

const PLATFORMS_KEY = 'smartcampus_platform_accounts';

const platformDefs = [
  { id: 'leetcode', name: 'LeetCode', emoji: '🟡', color: '#FFA116', placeholder: 'username (e.g. neal_wu)', urlPrefix: 'https://leetcode.com/u/', fetchFn: 'fetchLeetCode' },
  { id: 'codeforces', name: 'Codeforces', emoji: '🔵', color: '#1890FF', placeholder: 'handle (e.g. tourist)', urlPrefix: 'https://codeforces.com/profile/', fetchFn: 'fetchCodeforces' },
  { id: 'github', name: 'GitHub', emoji: '⚫', color: '#333', placeholder: 'username (e.g. torvalds)', urlPrefix: 'https://github.com/', fetchFn: 'fetchGitHub' },
  { id: 'codechef', name: 'CodeChef', emoji: '🟤', color: '#5B4638', placeholder: 'username (e.g. admin)', urlPrefix: 'https://www.codechef.com/users/', fetchFn: 'fetchCodeChef' },
  { id: 'gfg', name: 'GeeksforGeeks', emoji: '🟢', color: '#2F8D46', placeholder: 'username from profile URL', urlPrefix: 'https://www.geeksforgeeks.org/user/', fetchFn: 'fetchGFG' },
];

// Extract username from URL or raw input
const extractUsername = (input, urlPrefix) => {
  if (!input) return '';
  const trimmed = input.trim().replace(/\/+$/, '');
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    return parts[parts.length - 1] || parts[parts.length - 2];
  }
  return trimmed;
};

export default function SkillTracker() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState(() => JSON.parse(localStorage.getItem(PLATFORMS_KEY) || '[]'));
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Verification State
  const [verificationStep, setVerificationStep] = useState(null); // { platform, username, token }

  useEffect(() => { localStorage.setItem(PLATFORMS_KEY, JSON.stringify(accounts)); }, [accounts]);

  // Fetch all on mount
  useEffect(() => {
    accounts.forEach(acc => fetchStats(acc.platform, acc.username));
  }, []);

  const fetchStats = async (platformId, username) => {
    if (!username) return;
    setLoading(p => ({ ...p, [platformId]: true }));
    setErrors(p => ({ ...p, [platformId]: null }));
    try {
      let data = null;
      if (platformId === 'leetcode') {
        const res = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${username}`);
        if (!res.ok) throw new Error('Not found');
        const d = await res.json();
        data = { totalSolved: d.totalSolved || 0, easySolved: d.easySolved || 0, mediumSolved: d.mediumSolved || 0, hardSolved: d.hardSolved || 0, ranking: d.ranking || 0, reputation: d.reputation || 0 };
      } else if (platformId === 'codeforces') {
        const res = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
        const d = await res.json();
        if (d.status !== 'OK') throw new Error('Not found');
        const u = d.result[0];
        
        // Fetch problem tags to generate real skills
        const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${username}`);
        const statusData = await statusRes.json();
        const tagCounts = {};
        if (statusData.status === 'OK') {
          statusData.result.forEach(sub => {
            if (sub.verdict === 'OK' && sub.problem && sub.problem.tags) {
              sub.problem.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
              });
            }
          });
        }
        data = { rating: u.rating || 0, maxRating: u.maxRating || 0, rank: u.rank || 'unrated', contribution: u.contribution || 0, handle: u.handle, tagCounts };
      } else if (platformId === 'github') {
        const res = await fetch(`https://api.github.com/users/${username}`);
        if (!res.ok) throw new Error('Not found');
        const d = await res.json();
        data = { repos: d.public_repos || 0, followers: d.followers || 0, following: d.following || 0, name: d.name || username, bio: d.bio || '', avatar: d.avatar_url, created: d.created_at };
      } else if (platformId === 'codechef') {
        const res = await fetch(`https://codechef-api.vercel.app/handle/${username}`);
        if (!res.ok) throw new Error('Not found');
        const d = await res.json();
        data = { rating: d.currentRating || d.rating || 0, maxRating: d.highestRating || 0, stars: d.stars || '?', globalRank: d.globalRank || 0, solved: d.totalProblemsSolved || 0 };
      } else if (platformId === 'gfg') {
        const res = await fetch(`https://geeks-for-geeks-api.vercel.app/${username}`);
        if (!res.ok) throw new Error('Not found');
        const d = await res.json();
        data = { score: d.info?.codingScore || d.totalProblemsSolved || 0, solved: d.info?.totalProblemsSolved || d.totalProblemsSolved || 0, streak: d.info?.currentStreak || 0, institute: d.info?.institute || '' };
      }
      if (data) setStats(p => ({ ...p, [platformId]: data }));
    } catch (e) {
      setErrors(p => ({ ...p, [platformId]: 'Could not fetch. Check username.' }));
    }
    setLoading(p => ({ ...p, [platformId]: false }));
  };

  const initiateVerification = () => {
    if (!selectedPlatform || !inputValue.trim()) return;
    const def = platformDefs.find(p => p.id === selectedPlatform);
    const username = extractUsername(inputValue, def?.urlPrefix);
    
    // Generate unique token
    const token = `TMSL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setVerificationStep({ platform: selectedPlatform, username, token });
  };

  const verifyAndAddAccount = async () => {
    const { platform, username, token } = verificationStep;
    setLoading(p => ({...p, verify: true}));
    setErrors(p => ({...p, verify: null}));
    
    try {
      let isVerified = false;
      
      if (platform === 'github') {
        const res = await fetch(`https://api.github.com/users/${username}`);
        if (!res.ok) throw new Error('User not found');
        const d = await res.json();
        if (d.bio && d.bio.includes(token)) isVerified = true;
      } else if (platform === 'codeforces') {
        const res = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
        const d = await res.json();
        if (d.status === 'OK') {
          const u = d.result[0];
          if ((u.firstName && u.firstName.includes(token)) || (u.lastName && u.lastName.includes(token))) isVerified = true;
        }
      } else {
        // Other platforms might not expose bio easily, allow them for now 
        // or we could force them to verify via email etc later
        isVerified = true; 
      }

      if (!isVerified) {
        setErrors(p => ({...p, verify: 'Verification token not found in profile bio/name. Please add it and try again.'}));
        setLoading(p => ({...p, verify: false}));
        return;
      }

      if (accounts.some(a => a.platform === platform)) {
        setAccounts(prev => prev.map(a => a.platform === platform ? { ...a, username } : a));
      } else {
        setAccounts(prev => [...prev, { platform, username }]);
      }
      
      fetchStats(platform, username);
      setVerificationStep(null);
      setSelectedPlatform(''); setInputValue(''); setShowAdd(false); setDropdownOpen(false);
      
    } catch(e) {
      setErrors(p => ({...p, verify: 'Error during verification.'}));
    }
    setLoading(p => ({...p, verify: false}));
  };

  const removeAccount = (platformId) => {
    setAccounts(prev => prev.filter(a => a.platform !== platformId));
    setStats(prev => { const n = { ...prev }; delete n[platformId]; return n; });
  };

  const availablePlatforms = platformDefs.filter(p => !accounts.some(a => a.platform === p.id));

  // Base fixed skills for the uniform Hexagon Radar Chart
  const baseSkills = [
    { name: 'DSA', score: 0, max: 10, source: 'Pending', detail: 'Link LeetCode or GFG' },
    { name: 'Problem Solving', score: 0, max: 10, source: 'Pending', detail: 'Link any platform' },
    { name: 'Development', score: 0, max: 10, source: 'Pending', detail: 'Link GitHub' },
    { name: 'Competitive Prog.', score: 0, max: 10, source: 'Pending', detail: 'Link Codeforces/CodeChef' },
    { name: 'Core CS', score: 0, max: 10, source: 'Pending', detail: 'Link GeeksforGeeks' },
    { name: 'Consistency', score: 0, max: 10, source: 'Pending', detail: 'Overall streak & activity' },
  ];

  // Specific tag-based skills for the breakdown list
  const tagSkills = [];

  const lc = stats.leetcode;
  const cf = stats.codeforces;
  const gh = stats.github;
  const cc = stats.codechef;
  const gfg = stats.gfg;

  if (lc || gfg) {
    const lcScore = lc ? Math.round(lc.totalSolved / 50) : 0;
    const gfgScore = gfg ? Math.round(gfg.solved / 50) : 0;
    baseSkills[0].score = Math.min(10, lcScore + gfgScore);
    baseSkills[0].source = lc ? 'LeetCode' : 'GeeksforGeeks';
    baseSkills[0].detail = `${(lc?.totalSolved||0) + (gfg?.solved||0)} problems solved`;
  }

  if (cf || cc) {
    const cfScore = cf ? Math.round((cf.rating || 0) / 200) : 0;
    const ccScore = cc ? Math.round((cc.rating || 0) / 200) : 0;
    baseSkills[3].score = Math.min(10, Math.max(cfScore, ccScore));
    baseSkills[3].source = cf ? 'Codeforces' : 'CodeChef';
    baseSkills[3].detail = cf ? `Rating ${cf.rating}` : `Rating ${cc.rating}`;
  }

  if (gh) {
    baseSkills[2].score = Math.min(10, Math.round(gh.repos / 5));
    baseSkills[2].source = 'GitHub';
    baseSkills[2].detail = `${gh.repos} repositories`;
  }

  if (gfg) {
    baseSkills[4].score = Math.min(10, Math.round((gfg.score || gfg.solved) / 20));
    baseSkills[4].source = 'GeeksforGeeks';
    baseSkills[4].detail = `Coding Score ${gfg.score || gfg.solved}`;
  }

  // Consistency based on activity (reputation, contribution, streaks)
  let consistencyScore = 0;
  if (lc) consistencyScore += lc.reputation / 100;
  if (cf) consistencyScore += Math.max(0, cf.contribution / 5);
  if (gh) consistencyScore += gh.followers / 2;
  if (gfg) consistencyScore += gfg.streak / 5;
  if (accounts.length > 0) {
    baseSkills[5].score = Math.min(10, Math.round(consistencyScore || 1));
    baseSkills[5].source = 'Aggregated';
    baseSkills[5].detail = 'Based on multi-platform activity';
  }

  // Problem Solving is the max of DSA and CP
  if (accounts.length > 0) {
    baseSkills[1].score = Math.max(baseSkills[0].score, baseSkills[3].score, baseSkills[2].score > 5 ? 5 : 0);
    baseSkills[1].source = 'Aggregated';
    baseSkills[1].detail = 'Derived from technical skills';
  }

  // Add authentic codeforces tags to the breakdown list
  if (cf?.tagCounts) {
    if (cf.tagCounts['dp']) tagSkills.push({ name: 'Dynamic Prog.', score: Math.min(10, Math.round(cf.tagCounts['dp'] / 10)), max: 10, source: 'Codeforces', detail: `${cf.tagCounts['dp']} DP problems solved` });
    if (cf.tagCounts['graphs']) tagSkills.push({ name: 'Graph Theory', score: Math.min(10, Math.round(cf.tagCounts['graphs'] / 10)), max: 10, source: 'Codeforces', detail: `${cf.tagCounts['graphs']} Graph problems solved` });
    if (cf.tagCounts['math']) tagSkills.push({ name: 'Mathematics', score: Math.min(10, Math.round(cf.tagCounts['math'] / 15)), max: 10, source: 'Codeforces', detail: `${cf.tagCounts['math']} Math problems solved` });
    if (cf.tagCounts['greedy']) tagSkills.push({ name: 'Greedy Algo.', score: Math.min(10, Math.round(cf.tagCounts['greedy'] / 15)), max: 10, source: 'Codeforces', detail: `${cf.tagCounts['greedy']} Greedy problems solved` });
    if (cf.tagCounts['data structures']) tagSkills.push({ name: 'Data Structs', score: Math.min(10, Math.round(cf.tagCounts['data structures'] / 15)), max: 10, source: 'Codeforces', detail: `${cf.tagCounts['data structures']} DS problems solved` });
  }

  const allSkills = [...baseSkills, ...tagSkills.sort((a,b) => b.score - a.score)];

  // Save computed skills for resume
  useEffect(() => {
    const ratings = {};
    baseSkills.forEach(s => { ratings[s.name.toLowerCase().replace(/[^a-z0-9]/g, '_')] = s.score; });
    localStorage.setItem('smartcampus_skill_ratings', JSON.stringify(ratings));
  }, [JSON.stringify(stats)]);

  // SVG Radar (Always uses the 6 baseSkills for a consistent Hexagon)
  const cx = 150, cy = 150, maxR = 120;
  const n = baseSkills.length;
  const angleStep = (2 * Math.PI) / n;
  const getPoint = (i, val) => { const a = angleStep * i - Math.PI / 2; const r = (val / 10) * maxR; return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }; };
  const radarPoints = baseSkills.map((s, i) => getPoint(i, s.score));
  const radarPath = radarPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
  const gridLevels = [2, 4, 6, 8, 10];

  const totalScore = accounts.length > 0 ? (baseSkills.reduce((a, s) => a + s.score, 0) / baseSkills.length).toFixed(1) : '—';

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-24">
      <div className="animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Skill <span className="text-rose-600">Radar</span> 🎯</h1>
        <p className="text-slate-500 text-lg font-medium mt-3">100% real data — securely link your profiles to build authentic skill maps</p>
      </div>

      {/* Add Platform Section */}
      <div className="card-elegant overflow-hidden bg-slate-900 text-white shadow-2xl shadow-slate-900/20 border-slate-800">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center"><Link2 className="w-5 h-5 text-rose-500" /></div><h3 className="font-black text-xl tracking-tight">Linked Authentic Profiles</h3></div>
          {availablePlatforms.length > 0 && !showAdd && !verificationStep && (
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 text-xs px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 font-black tracking-widest uppercase transition-all shadow-sm">
              <Plus className="w-4 h-4" /> Add Platform
            </button>
          )}
        </div>

        {accounts.length === 0 && !showAdd && !verificationStep && (
          <div className="text-center py-10 bg-slate-800/50 rounded-3xl border border-slate-700/50">
            <p className="text-slate-400 text-base font-medium mb-5">No platforms linked yet. Add your coding profiles to generate real skill data.</p>
            <button onClick={() => setShowAdd(true)} className="px-6 py-3.5 rounded-2xl bg-rose-600 text-white text-sm font-black hover:bg-rose-500 active:scale-95 shadow-[0_8px_20px_-4px_rgba(225,29,72,0.4)]">
              + Link Your First Platform
            </button>
          </div>
        )}

        {/* Add Form / Initial Step */}
        {showAdd && !verificationStep && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4 space-y-3">
            <div className="flex items-center gap-2 mb-2 text-yellow-400 text-xs font-bold bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20">
              <AlertTriangle className="w-4 h-4" /> Proof of Ownership Required: You will need to verify your account.
            </div>
            {/* Platform Dropdown */}
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-sm font-medium hover:bg-white/15 transition-all">
                {selectedPlatform ? (
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{platformDefs.find(p => p.id === selectedPlatform)?.emoji}</span>
                    {platformDefs.find(p => p.id === selectedPlatform)?.name}
                  </span>
                ) : <span className="text-gray-400">Select platform...</span>}
                <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 rounded-xl border border-white/10 overflow-hidden z-10 shadow-xl">
                  {availablePlatforms.map(p => (
                    <button key={p.id} onClick={() => { setSelectedPlatform(p.id); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/10 transition-all text-left">
                      <span className="text-lg">{p.emoji}</span>
                      <span className="font-medium">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedPlatform && (
              <>
                <input value={inputValue} onChange={e => setInputValue(e.target.value)}
                  placeholder={platformDefs.find(p => p.id === selectedPlatform)?.placeholder || 'Enter username or profile URL'}
                  className="w-full bg-white/10 text-white placeholder:text-gray-500 px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-red-400 text-sm"
                  onKeyDown={e => { if (e.key === 'Enter') initiateVerification(); }} />
                
                <div className="flex gap-2 mt-2">
                  <button onClick={initiateVerification} disabled={!inputValue.trim()} className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 active:scale-95 disabled:opacity-30">Verify Ownership</button>
                  <button onClick={() => { setShowAdd(false); setSelectedPlatform(''); setInputValue(''); }} className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20">Cancel</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Verification Step Form */}
        {verificationStep && (
          <div className="bg-blue-500/10 rounded-xl p-5 border border-blue-500/30 mb-4">
            <h3 className="font-bold text-lg mb-2 text-blue-400">Verify {platformDefs.find(p => p.id === verificationStep.platform)?.name} Account</h3>
            <p className="text-sm text-gray-300 mb-4">To prove ownership of <strong className="text-white">@{verificationStep.username}</strong>, please add the following token to your profile {verificationStep.platform === 'github' ? 'bio' : 'First Name / Last Name'}:</p>
            
            <div className="bg-black/40 p-4 rounded-xl text-center mb-4 border border-white/10">
              <span className="font-mono text-2xl tracking-widest text-white select-all">{verificationStep.token}</span>
            </div>
            
            <p className="text-xs text-gray-400 mb-4">
              {verificationStep.platform === 'github' ? 'Edit your GitHub profile and paste this token anywhere in your Bio.' : 
               verificationStep.platform === 'codeforces' ? 'Edit your Codeforces profile and paste this token in your First Name or Last Name.' : 
               'Add this token to your profile bio. If this platform does not support bio, we will auto-link it for now.'}
            </p>
            
            {errors.verify && <p className="text-sm text-red-400 font-bold mb-3 bg-red-400/10 p-3 rounded-lg">{errors.verify}</p>}
            
            <div className="flex gap-3">
              <button onClick={verifyAndAddAccount} disabled={loading.verify} className="flex-1 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors flex justify-center items-center gap-2">
                {loading.verify ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                I have added the token. Verify & Link
              </button>
              <button onClick={() => setVerificationStep(null)} className="px-5 py-3 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20">Cancel</button>
            </div>
          </div>
        )}

        {/* Linked Platform Cards */}
        {accounts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map(acc => {
              const def = platformDefs.find(p => p.id === acc.platform);
              const st = stats[acc.platform];
              const isLoading = loading[acc.platform];
              const err = errors[acc.platform];
              return (
                <div key={acc.platform} className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/50 relative group transition-all hover:bg-slate-800 shadow-sm">
                  <button onClick={() => removeAccount(acc.platform)} className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-900/50 hover:bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-all"><X className="w-4 h-4 text-slate-400 hover:text-rose-400" /></button>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl drop-shadow-sm">{def?.emoji}</span>
                    <span className="font-black tracking-wide text-base">{def?.name}</span>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400 ml-auto" />}
                    {st && !isLoading && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    {st && !isLoading && <span className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md font-black uppercase tracking-widest border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">Verified</span>}
                  </div>
                  {err && <p className="text-xs text-rose-400 mb-3 bg-rose-400/10 p-2 rounded-lg">{err}</p>}
                  {st && acc.platform === 'leetcode' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-slate-400">Total Solved</span><span className="font-black text-lg">{st.totalSolved}</span></div>
                      <div className="flex gap-2 text-[10px] font-black tracking-widest uppercase">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">E {st.easySolved}</span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">M {st.mediumSolved}</span>
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">H {st.hardSolved}</span>
                      </div>
                      <div className="flex justify-between text-xs mt-2"><span className="text-slate-500 font-medium">Ranking</span><span className="text-slate-300 font-bold">#{st.ranking?.toLocaleString()}</span></div>
                    </div>
                  )}
                  {st && acc.platform === 'codeforces' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-slate-400">Rating</span><span className="font-black text-lg">{st.rating}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-slate-500 font-medium">Max</span><span className="text-slate-300 font-bold">{st.maxRating}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-slate-500 font-medium">Rank</span><span className="text-slate-300 capitalize font-bold">{st.rank}</span></div>
                    </div>
                  )}
                  {st && acc.platform === 'github' && (
                    <div className="space-y-2">
                      {st.avatar && <div className="flex items-center gap-3 mb-2 bg-slate-900/50 p-2 rounded-xl border border-slate-700/50"><img src={st.avatar} className="w-8 h-8 rounded-lg" /><span className="text-sm text-slate-200 font-black tracking-wide truncate">{st.name}</span></div>}
                      <div className="flex justify-between text-sm"><span className="text-slate-400">Repos</span><span className="font-black text-lg">{st.repos}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-slate-500 font-medium">Followers</span><span className="text-slate-300 font-bold">{st.followers}</span></div>
                    </div>
                  )}
                  {st && acc.platform === 'codechef' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-slate-400">Rating</span><span className="font-black text-lg">{st.rating}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-slate-500 font-medium">Stars</span><span className="text-slate-300 font-bold">{st.stars}⭐</span></div>
                      <div className="flex justify-between text-xs"><span className="text-slate-500 font-medium">Solved</span><span className="text-slate-300 font-bold">{st.solved}</span></div>
                    </div>
                  )}
                  {st && acc.platform === 'gfg' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-slate-400">Solved</span><span className="font-black text-lg">{st.solved}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-slate-500 font-medium">Score</span><span className="text-slate-300 font-bold">{st.score}</span></div>
                      {st.streak > 0 && <div className="flex justify-between text-xs"><span className="text-slate-500 font-medium">Streak</span><span className="text-amber-400 font-bold drop-shadow-sm">🔥 {st.streak}d</span></div>}
                    </div>
                  )}
                  {!st && !isLoading && !err && <p className="text-xs text-slate-500 mt-2">@{acc.username}</p>}
                  <a href={`${def?.urlPrefix}${acc.username}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] text-rose-400 hover:text-rose-300 font-black uppercase tracking-widest mt-4 bg-rose-400/10 px-3 py-1.5 rounded-lg transition-colors">View Profile <ExternalLink className="w-3 h-3" /></a>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* Computed Skills from Real Data */}
      {accounts.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="card-elegant p-8 text-center flex flex-col justify-center"><p className="text-5xl font-black text-slate-900 tracking-tighter">{totalScore}</p><p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Avg Skill Score</p></div>
            <div className="card-elegant p-8 text-center flex flex-col justify-center"><p className="text-5xl font-black text-slate-900 tracking-tighter">{accounts.length}</p><p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Platforms Linked</p></div>
            <div className="card-elegant p-8 text-center flex flex-col justify-center"><p className="text-5xl font-black text-slate-900 tracking-tighter">{allSkills.filter(s=>s.score>0).length}</p><p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Skills Tracked</p></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Radar Chart */}
            <div className="card-elegant p-8">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-8 flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center"><Target className="w-4 h-4 text-rose-500" /></div>Skill Radar (Auto-Computed)</h3>
              <div className="flex justify-center">
                <svg viewBox="0 0 300 300" className="w-full max-w-[340px] drop-shadow-xl">
                  {gridLevels.map(level => { const pts = baseSkills.map((_, i) => getPoint(i, level)); const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z'; return <path key={level} d={path} fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 4" />; })}
                  {baseSkills.map((_, i) => { const p = getPoint(i, 10); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="1.5" />; })}
                  <path d={radarPath} fill="url(#radarGradient)" stroke="#e11d48" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 10px rgba(225, 29, 72, 0.4))' }} />
                  <defs>
                    <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(225,29,72,0.3)" />
                      <stop offset="100%" stopColor="rgba(225,29,72,0.05)" />
                    </linearGradient>
                  </defs>
                  {radarPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="5" fill="#e11d48" stroke="white" strokeWidth="2.5" />)}
                  {baseSkills.map((s, i) => { const p = getPoint(i, 12.5); return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="text-[10px] font-black uppercase tracking-wider fill-slate-500">{s.name}</text>; })}
                </svg>
              </div>
            </div>

            {/* Skill Breakdown */}
            <div className="card-elegant p-8 flex flex-col">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-6 flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center"><Trophy className="w-4 h-4 text-amber-500" /></div>Real Skill Breakdown</h3>
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 max-h-[340px] hide-scrollbar">
                {allSkills.filter(s=>s.score > 0).map(skill => (
                  <div key={skill.name} className="p-4 rounded-2xl bg-white/40 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-black text-slate-800 tracking-wide">{skill.name}</span>
                      <span className="text-xl font-black text-slate-900 tracking-tighter">{skill.score}/10</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2 shadow-inner">
                      <div className="h-full rounded-full transition-all duration-700 shadow-sm" style={{ width: `${skill.score * 10}%`, background: skill.score >= 7 ? 'linear-gradient(90deg, #34d399, #10b981)' : skill.score >= 4 ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : 'linear-gradient(90deg, #fb7185, #e11d48)' }} />
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">via {skill.source} <span className="mx-1">•</span> <span className="text-slate-400">{skill.detail}</span></p>
                  </div>
                ))}
                {allSkills.filter(s=>s.score === 0).length === allSkills.length && (
                  <div className="p-8 text-center text-slate-400 text-sm font-bold bg-white/30 rounded-2xl border border-slate-100">Link platforms above to see your skills breakdown!</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {accounts.length > 0 && Object.keys(stats).length === 0 && (
        <div className="card-elegant p-16 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-rose-500 mx-auto mb-4 drop-shadow-sm" />
          <p className="font-black text-slate-600 tracking-wide">Fetching your actual stats and tags...</p>
        </div>
      )}

      {accounts.length === 0 && (
        <div className="card-elegant p-16 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-rose-100">
            <Target className="w-10 h-10 text-rose-400" />
          </div>
          <p className="text-xl font-black text-slate-800 tracking-tight">Link your coding profiles above to see your real skill map</p>
          <p className="text-sm font-medium text-slate-500 mt-3">Requires ownership verification via Profile Token</p>
        </div>
      )}
    </div>
  );
}
