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

  const getStatusColor = (status) => {
    switch (status) {
      case 'crowded': return '#ef4444';
      case 'moderate': return '#f59e0b';
      case 'empty': return '#22c55e';
      default: return '#64748b';
    }
  };

  const handleRefresh = () => {
    refreshCrowdData();
    setLastRefresh(new Date());
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current) return;
    const L = window.L;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    crowdData.forEach(zone => {
      const color = getStatusColor(zone.status);
      const intensity = Math.min(zone.crowd / 50, 1);

      // Heatmap-style large circle
      const heat = L.circleMarker(zone.coords, {
        radius: 30 + intensity * 25,
        fillColor: color,
        fillOpacity: 0.15 + intensity * 0.2,
        color: color,
        weight: 1,
        opacity: 0.4,
      }).addTo(mapInstanceRef.current);

      // Inner circle
      const inner = L.circleMarker(zone.coords, {
        radius: 12 + intensity * 10,
        fillColor: color,
        fillOpacity: 0.3 + intensity * 0.3,
        color: color,
        weight: 2,
        opacity: 0.7,
      }).addTo(mapInstanceRef.current);

      inner.bindPopup(`
        <div style="min-width: 180px;">
          <h4 style="font-weight: 700; margin-bottom: 6px; font-size: 14px;">${zone.name}</h4>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};"></span>
            <span style="font-size: 13px; font-weight: 600; text-transform: capitalize;">${zone.status}</span>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">~${zone.crowd} people detected via GPS</p>
          ${zone.capacity ? `<p style="font-size: 11px; color: #64748b; margin-top: 4px;">Capacity: ${zone.capacity} | Utilization: ${Math.round((zone.crowd / zone.capacity) * 100)}%</p>` : ''}
        </div>
      `);

      // Label
      const label = L.divIcon({
        html: `<div style="background:${color};color:white;font-size:11px;font-weight:700;padding:3px 8px;border-radius:8px;white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,0.4);text-align:center;">${zone.crowd}<br/><span style="font-size:8px;font-weight:400;opacity:0.8;">${zone.name.split(' ')[0]}</span></div>`,
        className: '',
        iconSize: [50, 30],
        iconAnchor: [25, 15],
      });
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

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-accent-light" />
            Campus Analytics
          </h1>
          <p className="text-text-muted text-sm mt-1">GPS-based crowd density heatmap & zone analytics</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-surface-light/50 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Data
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-accent-light" />
            <span className="text-xs text-text-muted">Total on Campus</span>
          </div>
          <p className="text-3xl font-bold">{totalPeople}</p>
          <p className="text-[10px] text-text-muted mt-1">people detected</p>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-info" />
            <span className="text-xs text-text-muted">Avg per Zone</span>
          </div>
          <p className="text-3xl font-bold">{avgCrowd}</p>
          <p className="text-[10px] text-text-muted mt-1">people average</p>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-danger" />
            <span className="text-xs text-text-muted">Peak Zone</span>
          </div>
          <p className="text-xl font-bold">{peakZone?.name}</p>
          <p className="text-[10px] text-text-muted mt-1">{peakZone?.crowd} people</p>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-success" />
            <span className="text-xs text-text-muted">Quietest Zone</span>
          </div>
          <p className="text-xl font-bold">{quietZone?.name}</p>
          <p className="text-[10px] text-text-muted mt-1">{quietZone?.crowd} people</p>
        </div>
      </div>

      {/* Map */}
      <div className="glass rounded-xl overflow-hidden animate-fade-in">
        <div className="p-4 border-b border-glass-border flex items-center justify-between">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent-light" />
            Crowd Heatmap — Techno Main Saltlake
          </h2>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-success"></span> Empty (&lt;10)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-warning"></span> Moderate (10-20)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-danger"></span> Crowded (20+)</span>
          </div>
        </div>
        <div ref={mapRef} className="h-[500px] w-full" />
        <div className="p-3 border-t border-glass-border text-[10px] text-text-muted text-center">
          GPS-based crowd detection • Last updated: {lastRefresh.toLocaleTimeString()} • Auto-refreshes every 30s
        </div>
      </div>

      {/* Zone Breakdown Table */}
      <div className="glass rounded-xl overflow-hidden animate-fade-in">
        <div className="p-5 border-b border-glass-border">
          <h2 className="font-semibold">Zone-wise Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-glass-border text-xs text-text-muted">
                <th className="text-left p-4 font-medium">Zone</th>
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">People</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Density</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {crowdData.sort((a, b) => b.crowd - a.crowd).map((zone) => (
                <tr key={zone.id} className="hover:bg-surface-light/20 transition-colors">
                  <td className="p-4 text-sm font-medium">{zone.name}</td>
                  <td className="p-4 text-sm text-text-muted capitalize">{zone.type}</td>
                  <td className="p-4 text-sm font-semibold">{zone.crowd}</td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                      zone.status === 'crowded' ? 'bg-danger/15 text-danger' :
                      zone.status === 'moderate' ? 'bg-warning/15 text-warning' :
                      'bg-success/15 text-success'
                    }`}>
                      {zone.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="w-24 h-2 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((zone.crowd / 50) * 100, 100)}%`,
                          backgroundColor: getStatusColor(zone.status),
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
