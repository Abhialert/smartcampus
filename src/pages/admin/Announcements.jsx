import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import {
  Megaphone,
  Plus,
  Trash2,
  Clock,
  Send,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

export default function Announcements() {
  const { user } = useAuth();
  const { announcements, addAnnouncement, deleteAnnouncement, markAsSeen } = useApp();

  // Mark all announcements as seen when viewed by admin
  useEffect(() => {
    announcements.forEach(notice => {
      markAsSeen(notice.id);
    });
  }, [announcements, markAsSeen]);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    priority: 'medium',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addAnnouncement({
      ...form,
      author: user?.name || 'Admin',
    });
    setSubmitted(true);
    setTimeout(() => {
      setShowForm(false);
      setSubmitted(false);
      setForm({ title: '', content: '', priority: 'medium' });
    }, 1500);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      deleteAnnouncement(id);
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high': return 'bg-danger/15 text-danger border-danger/20';
      case 'medium': return 'bg-warning/15 text-warning border-warning/20';
      case 'low': return 'bg-info/15 text-info border-info/20';
      default: return '';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-danger" />;
      case 'medium': return <Info className="w-4 h-4 text-warning" />;
      case 'low': return <Info className="w-4 h-4 text-info" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-accent-light" />
            Announcements
          </h1>
          <p className="text-text-muted text-sm mt-1">Create and manage campus-wide notices</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-blue-500 hover:from-accent-glow hover:to-blue-600 text-white text-sm font-medium flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 stagger-children">
        <div className="glass rounded-xl p-4">
          <p className="text-2xl font-bold">{announcements.length}</p>
          <p className="text-xs text-text-muted mt-1">Total Notices</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-2xl font-bold text-danger">{announcements.filter(a => a.priority === 'high').length}</p>
          <p className="text-xs text-text-muted mt-1">High Priority</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-2xl font-bold text-success">{announcements.filter(a => a.priority === 'low').length}</p>
          <p className="text-xs text-text-muted mt-1">Low Priority</p>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4 stagger-children">
        {announcements.map((notice) => (
          <div key={notice.id} className="glass rounded-xl overflow-hidden hover:border-accent/10 transition-all">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 flex-1">
                  {getPriorityIcon(notice.priority)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{notice.title}</h3>
                    <p className="text-text-muted text-xs mt-2 leading-relaxed">{notice.content}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[10px] text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {notice.date}
                      </span>
                      <span className="text-[10px] text-text-muted">by {notice.author}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getPriorityStyle(notice.priority)}`}>
                        {notice.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(notice.id)}
                  className="p-2 rounded-lg hover:bg-danger/10 transition-colors group shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-text-muted group-hover:text-danger transition-colors" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="glass rounded-xl p-12 text-center">
            <Megaphone className="w-12 h-12 text-text-muted/30 mx-auto mb-3" />
            <p className="text-text-muted text-sm">No announcements yet</p>
            <p className="text-text-muted text-xs mt-1">Create your first announcement above</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-strong rounded-2xl w-full max-w-lg">
            {submitted ? (
              <div className="p-12 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-bold">Announcement Published!</h3>
                <p className="text-text-muted text-sm mt-2">Students will see this on their dashboard.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-glass-border flex items-center justify-between">
                  <h2 className="text-lg font-semibold">New Announcement</h2>
                  <button type="button" onClick={() => setShowForm(false)} className="p-1 hover:bg-surface-light rounded-lg transition-colors">
                    <X className="w-5 h-5 text-text-muted" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Title */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1.5 block">Title *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g., 📢 Important: Exam Schedule Update"
                      className="w-full bg-surface/50 text-sm text-text-primary px-4 py-3 rounded-xl border border-glass-border focus:outline-none focus:border-accent/50 transition-all placeholder:text-text-muted"
                      required
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1.5 block">Content *</label>
                    <textarea
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      placeholder="Write your announcement content here..."
                      rows={4}
                      className="w-full bg-surface/50 text-sm text-text-primary px-4 py-3 rounded-xl border border-glass-border focus:outline-none focus:border-accent/50 transition-all placeholder:text-text-muted resize-none"
                      required
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-2 block">Priority</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['low', 'medium', 'high'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setForm({ ...form, priority: p })}
                          className={`p-2.5 rounded-xl border text-xs font-medium capitalize transition-all ${
                            form.priority === p ? getPriorityStyle(p) : 'border-glass-border hover:bg-surface-light/30 text-text-secondary'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-glass-border flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-glass-border hover:bg-surface-light/50 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!form.title || !form.content}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-accent to-blue-500 text-white text-sm font-medium disabled:opacity-30 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Publish
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
