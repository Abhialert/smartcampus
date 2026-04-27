import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { BarChart3, Users, MapPin, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { CAMPUS_CENTER, CAMPUS_ZOOM } from '../../data/campusData';

export default function CampusAnalytics() {
  const { crowdData, refreshCrowdData } = useApp();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const totalPeople = crowdData.reduce((sum, z) => sum + z.crowd, 0);
  const avgCrowd = Math.round(totalPeople / crowdData.length);
  const peakZone = crowdData.reduce((max, z) => z.crowd > max.crowd ? z : max, crowdData[0]);
  const quietZone = crowdData.reduce((min, z) => z.crowd < min.crowd ? z : min, crowdData[0]);

  const getStatusColor = (s) => { switch(s) { case 'crowded': return '#ef4444'; case 'moderate': return '#f59e0b'; case 'empty': return '#22c55e'; default: return '#64748b'; } };
  const handleRefresh = () => { refreshCrowdData(); setLastRefresh(new Date()); };

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    crowdData.forEach(zone => {
      const color = getStatusColor(zone.status);
      const intensity = Math.min(zone.crowd / 50, 1);
      const heat = L.circleMarker(zone.coords, { radius: 30 + intensity * 25, fillColor: color, fillOpacity: 0.15 + intensity * 0.2, color, weight: 1, opacity: 0.4 }).addTo(mapInstanceRef.current);
      const inner = L.circleMarker(zone.coords, { radius: 12 + intensity * 10, fillColor: color, fillOpacity: 0.3 + intensity * 0.3, color, weight: 2, opacity: 0.7 }).addTo(mapInstanceRef.current);
      inner.bindPopup(`<div style="min-width:180px;"><h4 style="font-weight:700;margin-bottom:6px;font-size:14px;color:#1a1a2e;">${zone.name}</h4><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};"></span><span style="font-size:13px;font-weight:600;text-transform:capitalize;color:#475569;">${zone.status}</span></div><p style="font-size:12px;color:#94a3b8;">~${zone.crowd} people</p></div>`);
      const label = L.divIcon({ html: `<div style="background:${color};color:white;font-size:11px;font-weight:700;padding:3px 8px;border-radius:8px;white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,0.2);text-align:center;">${zone.crowd}<br/><span style="font-size:8px;font-weight:400;opacity:0.8;">${zone.name.split(' ')[0]}</span></div>`, className: '', iconSize: [50,30], iconAnchor: [25,15] });
      const marker = L.marker(zone.coords, { icon: label }).addTo(mapInstanceRef.current);
      markersRef.current.push(heat, inner, marker);
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

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      <div className="flex items-center justify-between animate-fade-in">
        <div><h1 className="text-2xl font-black flex items-center gap-2 text-gray-900"><BarChart3 className="w-6 h-6 text-red-500" />Campus Analytics</h1><p className="text-gray-500 text-sm mt-1">GPS-based crowd density heatmap</p></div>
        <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-sm text-gray-600 font-semibold"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <div className="bg-white rounded-xl p-5 border border-gray-100"><div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-blue-500" /><span className="text-xs text-gray-400">Total</span></div><p className="text-3xl font-black text-gray-800">{totalPeople}</p></div>
        <div className="bg-white rounded-xl p-5 border border-gray-100"><div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-cyan-500" /><span className="text-xs text-gray-400">Avg/Zone</span></div><p className="text-3xl font-black text-gray-800">{avgCrowd}</p></div>
        <div className="bg-white rounded-xl p-5 border border-gray-100"><div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-red-500" /><span className="text-xs text-gray-400">Peak</span></div><p className="text-lg font-black text-gray-800">{peakZone?.name}</p><p className="text-[10px] text-gray-400">{peakZone?.crowd} people</p></div>
        <div className="bg-white rounded-xl p-5 border border-gray-100"><div className="flex items-center gap-2 mb-2"><TrendingDown className="w-4 h-4 text-green-500" /><span className="text-xs text-gray-400">Quietest</span></div><p className="text-lg font-black text-gray-800">{quietZone?.name}</p><p className="text-[10px] text-gray-400">{quietZone?.crowd} people</p></div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-sm text-gray-700 flex items-center gap-2"><MapPin className="w-4 h-4 text-red-400" />Heatmap — Techno Main Saltlake</h2>
          <div className="hidden md:flex items-center gap-3 text-[10px] font-bold">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>Empty</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>Moderate</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>Crowded</span>
          </div>
        </div>
        <div ref={mapRef} className="h-[450px] w-full" />
        <div className="p-3 border-t border-gray-100 text-[10px] text-gray-400 text-center font-semibold">Updated: {lastRefresh.toLocaleTimeString()} • Auto-refresh 30s</div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-700">Zone Breakdown</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 text-xs text-gray-400"><th className="text-left p-4 font-medium">Zone</th><th className="text-left p-4 font-medium">Type</th><th className="text-left p-4 font-medium">People</th><th className="text-left p-4 font-medium">Status</th><th className="text-left p-4 font-medium">Density</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {[...crowdData].sort((a,b) => b.crowd - a.crowd).map(zone => (
                <tr key={zone.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm font-semibold text-gray-800">{zone.name}</td>
                  <td className="p-4 text-sm text-gray-500 capitalize">{zone.type}</td>
                  <td className="p-4 text-sm font-bold text-gray-800">{zone.crowd}</td>
                  <td className="p-4"><span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${zone.status==='crowded'?'bg-red-50 text-red-500':zone.status==='moderate'?'bg-amber-50 text-amber-600':'bg-green-50 text-green-600'}`}>{zone.status}</span></td>
                  <td className="p-4"><div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min((zone.crowd/50)*100,100)}%`, backgroundColor: getStatusColor(zone.status) }} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
