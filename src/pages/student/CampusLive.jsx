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
  const [viewMode, setViewMode] = useState('crowd');

  const handleRefresh = () => {
    refreshCrowdData();
    if (mapInstanceRef.current) updateMarkers();
  };

  const getStatusColor = (status) => {
    switch (status) { case 'crowded': return '#ef4444'; case 'moderate': return '#f59e0b'; case 'empty': return '#22c55e'; default: return '#64748b'; }
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    crowdData.forEach(zone => {
      const color = getStatusColor(zone.status);
      const circle = L.circleMarker(zone.coords, { radius: zone.type === 'outdoor' ? 35 : 25, fillColor: color, fillOpacity: 0.25, color, weight: 2, opacity: 0.6 }).addTo(mapInstanceRef.current);
      circle.bindPopup(`<div style="min-width:160px;"><h4 style="font-weight:700;margin-bottom:4px;font-size:14px;color:#1a1a2e;">${zone.name}</h4><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};"></span><span style="font-size:12px;text-transform:capitalize;color:#475569;">${zone.status}</span></div><p style="font-size:12px;color:#94a3b8;">~${zone.crowd} people</p></div>`);
      const label = L.divIcon({ html: `<div style="background:${color};color:white;font-size:10px;font-weight:700;padding:2px 6px;border-radius:8px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2);">${zone.crowd}</div>`, className: '', iconSize: [30, 18], iconAnchor: [15, 9] });
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
      const map = L.map(mapRef.current, { center: CAMPUS_CENTER, zoom: CAMPUS_ZOOM, zoomControl: true, attributionControl: false });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 20 }).addTo(map);
      mapInstanceRef.current = map;
      updateMarkers();
    };
    initMap();
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  useEffect(() => { updateMarkers(); }, [crowdData]);

  const vacantCount = vacantRooms.filter(r => r.isVacant).length;
  const crowdedCount = crowdData.filter(z => z.status === 'crowded').length;
  const totalPeople = crowdData.reduce((sum, z) => sum + z.crowd, 0);

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 animate-fade-in">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3 text-gray-900">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />Campus Live
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-2">Real-time crowd density & room occupancy</p>
        </div>
        <button onClick={handleRefresh} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all shadow-md active:scale-95">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children">
        <div className="bg-white rounded-2xl p-6 flex items-center gap-5 border border-gray-100 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center"><Users className="w-7 h-7 text-blue-500" /></div>
          <div><p className="text-3xl font-black text-gray-900">{totalPeople}</p><p className="text-xs text-gray-400 font-bold uppercase mt-1">Total On Campus</p></div>
        </div>
        <div className="bg-white rounded-2xl p-6 flex items-center gap-5 border border-gray-100 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center"><MapPin className="w-7 h-7 text-red-500" /></div>
          <div><p className="text-3xl font-black text-gray-900">{crowdedCount}</p><p className="text-xs text-gray-400 font-bold uppercase mt-1">Crowded Zones</p></div>
        </div>
        <div className="bg-white rounded-2xl p-6 flex items-center gap-5 border border-gray-100 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center"><DoorOpen className="w-7 h-7 text-emerald-500" /></div>
          <div><p className="text-3xl font-black text-gray-900">{vacantCount}</p><p className="text-xs text-gray-400 font-bold uppercase mt-1">Vacant Rooms</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-[550px] flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-700 flex items-center gap-2"><Eye className="w-4 h-4 text-red-400" />Heatmap — Techno Main Saltlake</h2>
            <div className="hidden md:flex items-center gap-3 text-[10px] font-bold uppercase">
              <span className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-full border border-green-100"><span className="w-2 h-2 rounded-full bg-green-500"></span>Safe</span>
              <span className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Moderate</span>
              <span className="flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-full border border-red-100"><span className="w-2 h-2 rounded-full bg-red-500"></span>Peak</span>
            </div>
          </div>
          <div ref={mapRef} className="flex-1 w-full bg-gray-50" />
          <div className="p-3 border-t border-gray-100 text-xs font-bold text-gray-400 text-center">Techno Main Saltlake • GPS Active • 30s refresh</div>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-[550px]">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Zone Radar</h2>
            <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl">
              <button onClick={() => setViewMode('crowd')} className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${viewMode==='crowd'?'bg-red-500 text-white shadow':'text-gray-500 hover:text-gray-700'}`}>Crowd</button>
              <button onClick={() => setViewMode('rooms')} className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${viewMode==='rooms'?'bg-red-500 text-white shadow':'text-gray-500 hover:text-gray-700'}`}>Rooms</button>
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {viewMode === 'crowd' ? (
              <div className="divide-y divide-gray-50">
                {[...crowdData].sort((a,b)=>b.crowd-a.crowd).map(zone => (
                  <button key={zone.id} onClick={() => { setSelectedZone(zone); if(mapInstanceRef.current) mapInstanceRef.current.flyTo(zone.coords, 19); }}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-all ${selectedZone?.id===zone.id?'bg-red-50 border-l-3 border-red-500':''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-gray-800 leading-none">{zone.name}</p>
                      <p className="text-lg font-black text-gray-800">{zone.crowd}</p>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((zone.crowd/50)*100,100)}%`, backgroundColor: getStatusColor(zone.status) }} />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {vacantRooms.map((room, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${room.isVacant?'bg-green-50 text-green-500':'bg-red-50 text-red-500'}`}><DoorOpen className="w-4 h-4" /></div>
                      <div><p className="text-sm font-bold text-gray-800">{room.room}</p><p className="text-[10px] text-gray-400">{room.building}</p></div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${room.isVacant?'bg-green-50 text-green-600 border border-green-100':'bg-red-50 text-red-500 border border-red-100'}`}>{room.isVacant?'Free':'Busy'}</span>
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
