import { useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Megaphone, Clock, Sparkles } from 'lucide-react';

export default function StudentAnnouncements() {
  const { announcements, markAsSeen } = useApp();

  useEffect(() => {
    announcements.forEach(notice => markAsSeen(notice.id));
  }, [announcements, markAsSeen]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-black flex items-center gap-3 text-gray-900">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center"><Megaphone className="w-6 h-6 text-red-500" /></div>
          Campus Announcements
        </h1>
        <p className="text-gray-500 text-sm mt-2 font-medium">Official updates and notices from the administration.</p>
      </div>

      <div className="space-y-5 stagger-children">
        {announcements.length > 0 ? announcements.map((notice) => (
          <div key={notice.id} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase ${notice.priority==='high'?'bg-red-100 text-red-500 border border-red-200':notice.priority==='medium'?'bg-amber-100 text-amber-600 border border-amber-200':'bg-cyan-100 text-cyan-600 border border-cyan-200'}`}>
                {notice.priority} Priority
              </span>
              <span className="text-xs text-gray-400 font-bold flex items-center gap-1.5"><Clock className="w-4 h-4" />{notice.date}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 group-hover:text-red-500 transition-colors">{notice.title}</h2>
            <p className="text-gray-500 mt-3 leading-relaxed">{notice.content}</p>
            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-[10px] font-bold text-red-500">{notice.author?.[0]||'A'}</div>
                <span className="text-xs font-bold text-gray-400">By {notice.author||'Administration'}</span>
              </div>
              <div className="flex items-center gap-1 text-red-400 text-[10px] font-bold uppercase invisible group-hover:visible"><Sparkles className="w-3 h-3" />Official Notice</div>
            </div>
          </div>
        )) : (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
            <Megaphone className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700">No announcements yet</h3>
            <p className="text-sm text-gray-400 mt-2">Check back later for campus updates.</p>
          </div>
        )}
      </div>
    </div>
  );
}
