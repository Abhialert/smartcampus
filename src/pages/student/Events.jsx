import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { campusEvents, eventCategories, campusClubs } from '../../data/clubsData';
import { Calendar, MapPin, Users, Clock, Search, ExternalLink, Filter, Globe, Home } from 'lucide-react';

const RSVP_KEY = 'smartcampus_event_rsvps';

export default function Events() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // all | intra | inter
  const [search, setSearch] = useState('');
  const [rsvps, setRsvps] = useState(() => {
    const saved = localStorage.getItem(RSVP_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(RSVP_KEY, JSON.stringify(rsvps));
  }, [rsvps]);

  const toggleRSVP = (eventId) => {
    setRsvps(prev => prev.includes(eventId) ? prev.filter(e => e !== eventId) : [...prev, eventId]);
  };

  const getClub = (clubId) => campusClubs.find(c => c.id === clubId);

  const sortedEvents = [...campusEvents].sort((a, b) => new Date(a.date) - new Date(b.date));

  const filtered = sortedEvents.filter(e => {
    const matchCat = activeCategory === 'all' || e.category === activeCategory;
    const matchType = typeFilter === 'all' || e.type === typeFilter;
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchType && matchSearch;
  });

  const getDaysUntil = (date) => {
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Past';
    if (days === 0) return 'Today!';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  const getUrgencyColor = (date) => {
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (days <= 2) return 'bg-red-100 text-red-600';
    if (days <= 7) return 'bg-amber-100 text-amber-600';
    return 'bg-green-100 text-green-600';
  };

  const myRSVPEvents = sortedEvents.filter(e => rsvps.includes(e.id));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">
          Campus & National <span className="text-red-500">Events</span> 🎪
        </h1>
        <p className="text-gray-500 text-lg font-medium mt-2">Hackathons, fests, workshops & more — one tap to RSVP</p>
        
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <Globe className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-bold">Real National & International Events Aggregated</p>
            <p className="text-xs text-blue-600 mt-1">This page automatically aggregates authentic hackathons and competitions like SIH, CodeVita, and GSoC. College-specific events will appear here instantly when added by your faculty via the Admin Panel.</p>
          </div>
        </div>
      </div>

      {/* My RSVPs strip */}
      {myRSVPEvents.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl p-5 border border-red-100 animate-fade-in">
          <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-400" /> Your RSVPs ({myRSVPEvents.length})
          </h3>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {myRSVPEvents.map(evt => (
              <div key={evt.id} className="shrink-0 bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm min-w-[200px]">
                <p className="text-sm font-bold text-gray-800 truncate">{evt.title}</p>
                <p className="text-xs text-gray-400 mt-1">{evt.date} • {evt.venue}</p>
                <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-bold ${getUrgencyColor(evt.date)}`}>
                  {getDaysUntil(evt.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-red-300 text-sm font-medium" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTypeFilter('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${typeFilter === 'all' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
            <Filter className="w-3.5 h-3.5" /> All
          </button>
          <button onClick={() => setTypeFilter('intra')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${typeFilter === 'intra' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
            <Home className="w-3.5 h-3.5" /> Intra-College
          </button>
          <button onClick={() => setTypeFilter('inter')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${typeFilter === 'inter' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
            <Globe className="w-3.5 h-3.5" /> Inter-College
          </button>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {eventCategories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-red-50 text-red-600 border-2 border-red-200' : 'bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-gray-100'}`}>
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {filtered.map(evt => {
            const club = getClub(evt.club);
            const isRSVPd = rsvps.includes(evt.id);
            const spotsLeft = evt.maxCapacity - evt.attendees - (isRSVPd ? 1 : 0);
            return (
              <div key={evt.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group card-hover flex flex-col">
                {/* Top ribbon */}
                <div className="flex items-center justify-between px-5 pt-5 pb-0">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${evt.type === 'inter' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {evt.type === 'inter' ? '🌐 Inter-College' : '🏠 Intra-College'}
                  </span>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${getUrgencyColor(evt.date)}`}>
                    {getDaysUntil(evt.date)}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-500 transition-colors mb-2">{evt.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">{evt.description}</p>

                  {/* Meta */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-red-400" />
                      <span>{evt.date} • {evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      <span>{evt.venue}</span>
                    </div>
                    {club && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                        <span>{club.emoji}</span>
                        <span>by {club.shortName}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {evt.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-500 font-bold">{tag}</span>
                    ))}
                  </div>

                  {/* Capacity bar */}
                  <div className="mt-auto">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                      <span>{evt.attendees + (isRSVPd ? 1 : 0)} going</span>
                      <span>{spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(((evt.attendees + (isRSVPd ? 1 : 0)) / evt.maxCapacity) * 100, 100)}%`, backgroundColor: spotsLeft <= 10 ? '#ef4444' : '#22c55e' }} />
                    </div>
                  </div>

                  {/* RSVP Button */}
                  <button onClick={() => toggleRSVP(evt.id)}
                    className={`mt-4 w-full py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${isRSVPd ? 'bg-green-50 text-green-600 border-2 border-green-200' : 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-200'}`}>
                    {isRSVPd ? '✅ RSVP\'d — Going!' : '🎟️ RSVP Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🎭</p>
          <p className="text-lg font-bold text-gray-400">No events match your filters</p>
        </div>
      )}
    </div>
  );
}
