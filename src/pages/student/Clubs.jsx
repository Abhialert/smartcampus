import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { campusClubs, clubCategories, campusEvents } from '../../data/clubsData';
import { Users, Search, Star, ChevronRight, X, Calendar, MapPin, ExternalLink, Trophy, Clock } from 'lucide-react';

const STORAGE_KEY = 'smartcampus_joined_clubs';

export default function Clubs() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [joinedClubs, setJoinedClubs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedClub, setSelectedClub] = useState(null);
  const [tab, setTab] = useState('discover'); // discover | my

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(joinedClubs));
  }, [joinedClubs]);

  const toggleJoin = (clubId) => {
    setJoinedClubs(prev =>
      prev.includes(clubId) ? prev.filter(c => c !== clubId) : [...prev, clubId]
    );
  };

  const filtered = campusClubs.filter(c => {
    const matchCat = activeCategory === 'all' || c.category === activeCategory;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchTab = tab === 'discover' || joinedClubs.includes(c.id);
    return matchCat && matchSearch && matchTab;
  });

  const clubEvents = (clubId) => campusEvents.filter(e => e.club === clubId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">
          Campus <span className="text-red-500">Clubs</span> 🏛️
        </h1>
        <p className="text-gray-500 text-lg font-medium mt-2">Discover, join & engage with clubs at TMSL</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 items-center">
        <button onClick={() => setTab('discover')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'discover' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          🌟 Discover ({campusClubs.length})
        </button>
        <button onClick={() => setTab('my')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'my' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          ⭐ My Clubs ({joinedClubs.length})
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search clubs or skills..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-red-300 text-sm font-medium" />
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {clubCategories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-red-50 text-red-600 border-2 border-red-200' : 'bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-gray-100'}`}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Club Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {filtered.map(club => {
            const isJoined = joinedClubs.includes(club.id);
            const events = clubEvents(club.id);
            return (
              <div key={club.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group card-hover">
                {/* Club Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                        style={{ backgroundColor: club.color + '15' }}>
                        {club.emoji}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-red-500 transition-colors">{club.name}</h3>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">Since {club.founded} • {club.members + (isJoined ? 1 : 0)} members</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">{club.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {club.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide"
                        style={{ backgroundColor: club.color + '15', color: club.color }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Upcoming events count */}
                  {events.length > 0 && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-4">
                      <Calendar className="w-3.5 h-3.5" />
                      {events.length} upcoming event{events.length > 1 ? 's' : ''}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={() => toggleJoin(club.id)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${isJoined ? 'bg-green-50 text-green-600 border-2 border-green-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200' : 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-200'}`}>
                      {isJoined ? '✅ Joined' : '+ Join Club'}
                    </button>
                    <button onClick={() => setSelectedClub(club)}
                      className="px-4 py-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-bold text-gray-400">{tab === 'my' ? "You haven't joined any clubs yet!" : 'No clubs found'}</p>
          {tab === 'my' && <button onClick={() => setTab('discover')} className="mt-4 px-6 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600">Discover Clubs</button>}
        </div>
      )}

      {/* Club Detail Modal */}
      {selectedClub && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedClub(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: selectedClub.color + '15' }}>
                  {selectedClub.emoji}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedClub.name}</h2>
                  <p className="text-xs text-gray-400">Led by {selectedClub.lead}</p>
                </div>
              </div>
              <button onClick={() => setSelectedClub(null)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-2">About</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{selectedClub.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xl font-black text-gray-900">{selectedClub.members}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Members</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xl font-black text-gray-900">{clubEvents(selectedClub.id).length}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Events</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xl font-black text-gray-900">{selectedClub.founded}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Founded</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-2">Skills You'll Gain</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedClub.tags.map(tag => (
                    <span key={tag} className="text-xs px-3 py-1.5 rounded-lg font-bold" style={{ backgroundColor: selectedClub.color + '15', color: selectedClub.color }}>{tag}</span>
                  ))}
                </div>
              </div>
              {selectedClub.instagramEmbedUrl && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-pink-500" />
                    Live Instagram Feed
                  </h4>
                  <div className="w-full h-[400px] rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center relative">
                    <iframe 
                      src={selectedClub.instagramEmbedUrl} 
                      className="w-full h-full border-none"
                      allowTransparency="true"
                      allow="encrypted-media"
                    />
                  </div>
                </div>
              )}
              <button onClick={() => { toggleJoin(selectedClub.id); }}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${joinedClubs.includes(selectedClub.id) ? 'bg-red-50 text-red-500 border-2 border-red-200' : 'bg-red-500 text-white shadow-lg shadow-red-200'}`}>
                {joinedClubs.includes(selectedClub.id) ? '✅ Leave Club' : '🚀 Join Club'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
