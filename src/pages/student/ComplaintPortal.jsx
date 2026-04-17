import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { complaintCategories } from '../../data/campusData';
import {
  MessageSquareWarning,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  X,
  ChevronDown,
} from 'lucide-react';

export default function ComplaintPortal() {
  const { user } = useAuth();
  const { complaints, addComplaint } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [form, setForm] = useState({
    category: '',
    title: '',
    description: '',
    location: '',
  });

  const myComplaints = complaints.filter(
    c => c.submittedBy === user?.roll || c.submittedBy === 'anonymous'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    addComplaint({
      ...form,
      submittedBy: isAnonymous ? 'anonymous' : user?.roll,
      submittedName: isAnonymous ? 'Anonymous' : user?.name,
    });
    setSubmitted(true);
    setTimeout(() => {
      setShowForm(false);
      setSubmitted(false);
      setForm({ category: '', title: '', description: '', location: '' });
      setIsAnonymous(false);
    }, 2000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-3.5 h-3.5 text-warning" />;
      case 'in-progress': return <Loader2 className="w-3.5 h-3.5 text-info animate-spin" />;
      case 'resolved': return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
      default: return null;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning/15 text-warning';
      case 'in-progress': return 'bg-info/15 text-info';
      case 'resolved': return 'bg-success/15 text-success';
      default: return '';
    }
  };

  const getCategoryInfo = (catId) => {
    return complaintCategories.find(c => c.id === catId) || { icon: '📝', label: catId, color: '#8b5cf6' };
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquareWarning className="w-6 h-6 text-accent-light" />
            Complaint Portal
          </h1>
          <p className="text-text-muted text-sm mt-1">Report issues, lost items, or ragging incidents</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-blue-500 hover:from-accent-glow hover:to-blue-600 text-white text-sm font-medium flex items-center gap-2 transition-all"
        >
          <Send className="w-4 h-4" /> File Complaint
        </button>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        {complaintCategories.map((cat) => {
          const count = complaints.filter(c => c.category === cat.id).length;
          return (
            <div key={cat.id} className="glass rounded-xl p-4 text-center">
              <span className="text-2xl">{cat.icon}</span>
              <p className="text-sm font-medium mt-2">{cat.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{count} reported</p>
            </div>
          );
        })}
      </div>

      {/* Complaints List */}
      <div className="glass rounded-xl overflow-hidden animate-fade-in">
        <div className="p-5 border-b border-glass-border">
          <h2 className="font-semibold">All Complaints</h2>
          <p className="text-xs text-text-muted mt-0.5">{complaints.length} total complaints</p>
        </div>
        <div className="divide-y divide-glass-border">
          {complaints.map((complaint) => {
            const catInfo = getCategoryInfo(complaint.category);
            return (
              <div key={complaint.id} className="p-5 hover:bg-surface-light/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <span className="text-xl mt-0.5">{catInfo.icon}</span>
                    <div>
                      <h3 className="text-sm font-medium">{complaint.title}</h3>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">{complaint.description}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-[10px] text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {complaint.date}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: catInfo.color + '20', color: catInfo.color }}>
                          {catInfo.label}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          📍 {complaint.location}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          by {complaint.submittedName}
                        </span>
                      </div>
                      {complaint.remarks && (
                        <div className="mt-2 p-2 rounded-lg bg-surface/50 text-xs text-text-secondary">
                          <span className="font-medium">Admin:</span> {complaint.remarks}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${getStatusStyle(complaint.status)}`}>
                    {getStatusIcon(complaint.status)}
                    {complaint.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* File Complaint Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-strong rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {submitted ? (
              <div className="p-12 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-bold">Complaint Submitted!</h3>
                <p className="text-text-muted text-sm mt-2">Your complaint has been registered. We'll look into it soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-glass-border flex items-center justify-between">
                  <h2 className="text-lg font-semibold">File a Complaint</h2>
                  <button type="button" onClick={() => setShowForm(false)} className="p-1 hover:bg-surface-light rounded-lg transition-colors">
                    <X className="w-5 h-5 text-text-muted" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Category */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-2 block">Category *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {complaintCategories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setForm({ ...form, category: cat.id })}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2 ${
                            form.category === cat.id
                              ? 'border-accent/50 bg-accent/10'
                              : 'border-glass-border hover:border-glass-border hover:bg-surface-light/30'
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span className="text-sm">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1.5 block">Title *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Brief title of the issue"
                      className="w-full bg-surface/50 text-sm text-text-primary px-4 py-3 rounded-xl border border-glass-border focus:outline-none focus:border-accent/50 transition-all placeholder:text-text-muted"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1.5 block">Description *</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe the issue in detail..."
                      rows={4}
                      className="w-full bg-surface/50 text-sm text-text-primary px-4 py-3 rounded-xl border border-glass-border focus:outline-none focus:border-accent/50 transition-all placeholder:text-text-muted resize-none"
                      required
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1.5 block">Location</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g., CS Block - Room CS-201"
                      className="w-full bg-surface/50 text-sm text-text-primary px-4 py-3 rounded-xl border border-glass-border focus:outline-none focus:border-accent/50 transition-all placeholder:text-text-muted"
                    />
                  </div>

                  {/* Anonymous toggle */}
                  {form.category === 'ragging' && (
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-danger/5 border border-danger/20 cursor-pointer animate-fade-in">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="w-4 h-4 rounded accent-danger"
                      />
                      <div>
                        <p className="text-sm font-medium text-danger">Submit Anonymously</p>
                        <p className="text-[10px] text-text-muted">Your identity will not be revealed</p>
                      </div>
                    </label>
                  )}
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
                    disabled={!form.category || !form.title || !form.description}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-accent to-blue-500 text-white text-sm font-medium disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Submit
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
