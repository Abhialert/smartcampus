import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { MapPin, Users, DoorOpen, RefreshCw, Eye, Filter } from 'lucide-react';
import { CAMPUS_CENTER, CAMPUS_ZOOM } from '../../data/campusData';

export default function CampusLive() {
  const { crowdData, vacantRooms, refreshCrowdData } = useApp();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [viewMode, setViewMode] = useState('crowd'); // 'crowd' or 'rooms'
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = () => {
    refreshCrowdData();
    setLastRefresh(new Date());
    // Update markers
    if (mapInstanceRef.current) {
      updateMarkers();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'crowded': return '#ef4444';
      case 'moderate': return '#f59e0b';
      case 'empty': return '#22c55e';
      default: return '#64748b';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'crowded': return 'bg-danger/15 text-danger';
      case 'moderate': return 'bg-warning/15 text-warning';
      case 'empty': return 'bg-success/15 text-success';
      default: return 'bg-surface-light text-text-muted';
    }
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current) return;
    const L = window.L;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    crowdData.forEach(zone => {
      const color = getStatusColor(zone.status);
      const radius = zone.type === 'outdoor' ? 35 : 25;

      // Circle for crowd density
      const circle = L.circleMarker(zone.coords, {
        radius: radius,
        fillColor: color,
        fillOpacity: 0.25,
        color: color,
        weight: 2,
        opacity: 0.6,
      }).addTo(mapInstanceRef.current);

      // Popup
      circle.bindPopup(`
        <div style="min-width: 160px;">
          <h4 style="font-weight: 600; margin-bottom: 4px; font-size: 14px;">${zone.name}</h4>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};"></span>
            <span style="font-size: 12px; text-transform: capitalize;">${zone.status}</span>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">~${zone.crowd} people detected</p>
          ${zone.capacity ? `<p style="font-size: 11px; color: #64748b; margin-top: 2px;">Capacity: ${zone.capacity}</p>` : ''}
        </div>
      `);

      // Center label
      const label = L.divIcon({
        html: `<div style="background:${color};color:white;font-size:10px;font-weight:700;padding:2px 6px;border-radius:8px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${zone.crowd}</div>`,
        className: '',
        iconSize: [30, 18],
        iconAnchor: [15, 9],
      });
      const marker = L.marker(zone.coords, { icon: label }).addTo(mapInstanceRef.current);

      markersRef.current.push(circle, marker);
    });
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      window.L = L;

      const map = L.map(mapRef.current, {
        center: CAMPUS_CENTER,
        zoom: CAMPUS_ZOOM,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
      }).addTo(map);

      mapInstanceRef.current = map;
      updateMarkers();
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    updateMarkers();
  }, [crowdData]);

  const vacantCount = vacantRooms.filter(r => r.isVacant).length;
  const crowdedCount = crowdData.filter(z => z.status === 'crowded').length;
  const totalPeople = crowdData.reduce((sum, z) => sum + z.crowd, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <div className="w-4 h-4 bg-success rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
            Campus Live Monitor
          </h1>
          <p className="text-text-secondary text-base font-bold mt-2">Real-time GPS crowd density & room occupancy</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-accent text-white font-black text-sm hover:bg-accent-glow transition-all shadow-xl active:scale-95"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh Live Data
        </button>
      </div>

      {/* Stats Bar - Larger & Denser */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
        <div className="glass-strong rounded-3xl p-6 flex items-center gap-6 border-white/5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center">
            <Users className="w-8 h-8 text-accent-light" />
          </div>
          <div>
            <p className="text-3xl font-black tracking-tight">{totalPeople}</p>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Total On Campus</p>
          </div>
        </div>
        <div className="glass-strong rounded-3xl p-6 flex items-center gap-6 border-white/5 shadow-2xl text-danger">
          <div className="w-16 h-16 rounded-2xl bg-danger/20 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-danger" />
          </div>
          <div>
            <p className="text-3xl font-black tracking-tight">{crowdedCount}</p>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Crowded Zones</p>
          </div>
        </div>
        <div className="glass-strong rounded-3xl p-6 flex items-center gap-6 border-white/5 shadow-2xl text-success">
          <div className="w-16 h-16 rounded-2xl bg-success/20 flex items-center justify-center">
            <DoorOpen className="w-8 h-8 text-success" />
          </div>
          <div>
            <p className="text-3xl font-black tracking-tight">{vacantCount}</p>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Vacant Hubs</p>
          </div>
        </div>
      </div>

      {/* Map + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Map */}
        <div className="lg:col-span-3 glass-strong rounded-3xl overflow-hidden animate-fade-in border-white/5 shadow-2xl h-[600px] flex flex-col">
          <div className="p-6 border-b border-glass-border flex items-center justify-between bg-white/5">
            <h2 className="text-lg font-black flex items-center gap-3">
              <Eye className="w-5 h-5 text-accent-light" />
              Interactive Campus Heatmap
            </h2>
            <div className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
              <span className="flex items-center gap-2 bg-success/10 px-3 py-1.5 rounded-full border border-success/20"><span className="w-2.5 h-2.5 rounded-full bg-success"></span> Safe</span>
              <span className="flex items-center gap-2 bg-warning/10 px-3 py-1.5 rounded-full border border-warning/20"><span className="w-2.5 h-2.5 rounded-full bg-warning"></span> Moderate</span>
              <span className="flex items-center gap-2 bg-danger/10 px-3 py-1.5 rounded-full border border-danger/20"><span className="w-2.5 h-2.5 rounded-full bg-danger"></span> Peak</span>
            </div>
          </div>
          <div ref={mapRef} className="flex-1 w-full bg-surface" />
          <div className="p-4 border-t border-glass-border text-xs font-bold text-text-muted text-center tracking-wide">
            Techno Main Saltlake • High Precision GPS Detection Active • Updates every 30s
          </div>
        </div>

        {/* Zone List - Tighter Sidebar */}
        <div className="glass-strong rounded-3xl overflow-hidden animate-fade-in border-white/5 shadow-2xl flex flex-col h-[600px]">
          <div className="p-6 border-b border-glass-border bg-white/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-black tracking-widest uppercase">Zone Radar</h2>
              <Filter className="w-5 h-5 text-text-muted" />
            </div>
            {/* Tabs - Larger */}
            <div className="flex gap-2 p-1.5 bg-surface/80 rounded-2xl border border-white/5">
              <button
                onClick={() => setViewMode('crowd')}
                className={`flex-1 text-sm font-black py-3 rounded-xl transition-all ${viewMode === 'crowd' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-muted hover:text-text-primary'}`}
              >
                Crowd
              </button>
              <button
                onClick={() => setViewMode('rooms')}
                className={`flex-1 text-sm font-black py-3 rounded-xl transition-all ${viewMode === 'rooms' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-muted hover:text-text-primary'}`}
              >
                Rooms
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {viewMode === 'crowd' ? (
              <div className="divide-y divide-glass-border">
                {crowdData.sort((a,b) => b.crowd - a.crowd).map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => {
                      setSelectedZone(zone);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo(zone.coords, 20);
                      }
                    }}
                    className={`w-full text-left p-6 hover:bg-white/5 transition-all group ${selectedZone?.id === zone.id ? 'bg-accent/10 border-l-4 border-accent' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-base font-black leading-none">{zone.name}</p>
                        <p className="text-[10px] text-text-muted font-bold uppercase mt-2 tracking-tighter">{zone.type} • {zone.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black leading-none">{zone.crowd}</p>
                      </div>
                    </div>
                    {/* Crowd bar - Thicker */}
                    <div className="h-2.5 bg-surface/50 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min((zone.crowd / 50) * 100, 100)}%`,
                          backgroundColor: getStatusColor(zone.status),
                        }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-glass-border">
                {vacantRooms.map((room, idx) => (
                  <div key={idx} className="p-5 flex items-center justify-between group hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${room.isVacant ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                         <DoorOpen className="w-5 h-5" />
                       </div>
                       <div>
                        <p className="text-base font-black leading-none">{room.room}</p>
                        <p className="text-[10px] text-text-muted font-bold uppercase mt-1">{room.building}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${room.isVacant ? 'bg-success/20 text-success border border-success/30' : 'bg-danger/20 text-danger border border-danger/30'}`}>
                        {room.isVacant ? 'Free' : 'Busy'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
