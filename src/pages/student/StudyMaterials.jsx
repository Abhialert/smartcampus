import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { BookMarked, Download, FileText, Search, BookOpen, Clock } from 'lucide-react';

export default function StudentStudyMaterials() {
  const { user } = useAuth();
  const { studyMaterials } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Filter materials based on student's department/year
  const myMaterials = studyMaterials.filter(m => {
    // Check access restrictions
    const matchesDept = !m.dept || m.dept === user?.dept;
    const matchesYear = !m.year || String(m.year) === String(user?.year);
    if (!matchesDept || !matchesYear) return false;

    // Apply search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchesSearch = m.title.toLowerCase().includes(q) || m.subject?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // Apply type filter
    if (filterType !== 'all' && m.type !== filterType) return false;

    return true;
  });

  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return '📄';
      case 'image': return '🖼️';
      default: return '📁';
    }
  };

  const getBadgeStyle = (type) => {
    switch(type) {
      case 'pyq': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'reference': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-green-50 text-green-600 border-green-100';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-black flex items-center gap-3 text-gray-900">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center"><BookMarked className="w-6 h-6 text-red-500" /></div>
          Study Materials
        </h1>
        <p className="text-gray-500 text-base mt-2 font-medium">Access notes, PYQs, and references for your classes.</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 stagger-children">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search by title, subject, or description..."
            className="w-full bg-gray-50 text-base pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-300" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          {['all', 'notes', 'pyq', 'reference'].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`shrink-0 px-5 py-3.5 rounded-xl text-sm font-bold capitalize transition-all ${filterType===t?'bg-red-500 text-white shadow-md':'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
              {t === 'pyq' ? 'PYQs' : t === 'all' ? 'All Materials' : t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
        {myMaterials.map(m => (
          <div key={m.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-start justify-between mb-3">
                <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase border ${getBadgeStyle(m.type)}`}>
                  {m.type === 'pyq' ? 'Previous Year Qs' : m.type === 'reference' ? 'Reference Book' : 'Class Notes'}
                </span>
                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(m.uploadedAt).toLocaleDateString()}</span>
              </div>
              <h3 className="font-bold text-gray-800 text-xl mb-2 group-hover:text-red-500 transition-colors">{m.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">{m.description}</p>
              
              {m.subject && (
                <div className="mt-4">
                  <span className="text-xs font-bold uppercase text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md">{m.subject}</span>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl drop-shadow-sm">{getFileIcon(m.fileType)}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-700 truncate">{m.fileName}</p>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mt-0.5">By {m.uploadedBy}</p>
                </div>
              </div>
              
              {m.fileData && (
                <a href={m.fileData} download={m.fileName} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold transition-colors border border-red-100">
                  <Download className="w-4 h-4" /> Download
                </a>
              )}
            </div>
          </div>
        ))}
        {myMaterials.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-20 text-center border border-gray-100">
            <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-5" />
            <h3 className="text-xl font-bold text-gray-700">No materials found</h3>
            <p className="text-base text-gray-400 mt-2">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
