import { useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Megaphone, Clock, Sparkles } from 'lucide-react';

export default function StudentAnnouncements() {
  const { announcements, markAsSeen } = useApp();

  // Mark all as seen when this dedicated page is viewed
  useEffect(() => {
    announcements.forEach(notice => {
      markAsSeen(notice.id);
    });
  }, [announcements, markAsSeen]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-accent-light" />
          </div>
          Campus Announcements
        </h1>
        <p className="text-text-secondary text-sm mt-2 font-medium">Official updates and notices from the administration.</p>
      </div>

      <div className="space-y-6 stagger-children">
        {announcements.length > 0 ? (
          announcements.map((notice) => (
            <div key={notice.id} className="glass-strong rounded-3xl p-8 border-white/5 shadow-xl hover:border-accent/30 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                  notice.priority === 'high' ? 'bg-danger/20 text-danger border border-danger/30' :
                  notice.priority === 'medium' ? 'bg-warning/20 text-warning border border-warning/30' :
                  'bg-info/20 text-info border border-info/30'
                }`}>
                  {notice.priority} Priority
                </span>
                <span className="text-xs text-text-muted font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {notice.date}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-text-primary group-hover:text-accent-light transition-colors">
                {notice.title}
              </h2>
              
              <p className="text-text-secondary mt-4 leading-relaxed font-normal text-base">
                {notice.content}
              </p>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center text-[10px] font-black text-white">
                    {notice.author?.[0] || 'A'}
                  </div>
                  <span className="text-xs font-bold text-text-muted">By {notice.author || 'Administration'}</span>
                </div>
                <div className="flex items-center gap-1 text-accent-light text-[10px] font-black uppercase tracking-tighter invisible group-hover:visible transition-all">
                  <Sparkles className="w-3 h-3" /> Official Campus Notice
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-strong rounded-3xl p-20 text-center">
            <div className="w-20 h-20 rounded-full bg-surface/50 flex items-center justify-center mx-auto mb-6">
              <Megaphone className="w-10 h-10 text-text-muted/30" />
            </div>
            <h3 className="text-xl font-bold">No announcements yet</h3>
            <p className="text-sm text-text-muted mt-2">Check back later for campus updates.</p>
          </div>
        )}
      </div>
    </div>
  );
}
