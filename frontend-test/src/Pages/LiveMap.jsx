import React, { useEffect, useRef, useState } from 'react';

const LAYERS = ['All', 'Incidents', 'SOS Alerts', 'Rescue Teams', 'Shelters', 'Hospitals', 'Road Blocks', 'Flood Areas', 'Landslide Areas'];

const MAP_STATS = [
  { label: 'Active Incidents', value: 24, color: 'text-blue-600' },
  { label: 'SOS Alerts', value: 18, color: 'text-red-600' },
  { label: 'Rescue Teams', value: 32, color: 'text-green-600' },
  { label: 'Shelters', value: 45, color: 'text-teal-600' },
  { label: 'Hospitals', value: 28, color: 'text-blue-500' },
  { label: 'Road Blocks', value: 12, color: 'text-red-500' },
  { label: 'Flood Areas', value: 8, color: 'text-blue-600' },
  { label: 'Landslide Areas', value: 6, color: 'text-orange-600' },
];

// Nepal incident data for map
const MARKERS = [
  { lat: 27.6745, lng: 83.4753, type: 'SOS', label: 'SOS - Butwal', color: '#ef4444', icon: '🆘' },
  { lat: 28.1784, lng: 82.1752, type: 'Flood', label: 'Flood Alert - Dang', color: '#3b82f6', icon: '🌊' },
  { lat: 27.9674, lng: 82.8309, type: 'Landslide', label: 'Landslide - Palpa', color: '#f59e0b', icon: '⛰️' },
  { lat: 27.6767, lng: 85.3149, type: 'Team', label: 'Team Alpha - Kathmandu', color: '#22c55e', icon: '🚑' },
  { lat: 27.6588, lng: 83.4561, type: 'SOS', label: 'SOS - Bhairawa', color: '#ef4444', icon: '🆘' },
  { lat: 26.4525, lng: 87.2718, type: 'Fire', label: 'Fire - Biratnagar', color: '#f97316', icon: '🔥' },
  { lat: 28.2096, lng: 83.9856, type: 'Team', label: 'Team Bravo', color: '#22c55e', icon: '🚑' },
  { lat: 27.7172, lng: 85.3240, type: 'Hospital', label: 'Bir Hospital', color: '#0ea5e9', icon: '🏥' },
  { lat: 28.3949, lng: 80.1963, type: 'Flood', label: 'Flood - Kailali', color: '#3b82f6', icon: '🌊' },
  { lat: 27.5291, lng: 84.3542, type: 'Team', label: 'Team Charlie', color: '#22c55e', icon: '🚑' },
  { lat: 26.6567, lng: 88.0238, type: 'Shelter', label: 'Shelter - Jhapa', color: '#8b5cf6', icon: '🏠' },
  { lat: 27.7069, lng: 85.3145, type: 'Crowd', label: 'Crowd - Tinkune', color: '#a855f7', icon: '👥' },
];

export default function LiveMap() {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const [activeLayer, setActiveLayer] = useState('All');
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || leafletMap.current) return;
      const L = window.L;
      if (!L) return;

      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false }).setView([28.0, 83.5], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap'
      }).addTo(map);
      leafletMap.current = map;

      MARKERS.forEach(m => {
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div class="marker-glow" style="background:${m.color};box-shadow:0 0 20px 10px ${m.color}55, 0 0 40px 20px ${m.color}22;"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
        marker.bindPopup(`<b>${m.label}</b><br/><small>Type: ${m.type}</small>`);
      });

      return () => {
        if (leafletMap.current) {
          leafletMap.current.remove();
          leafletMap.current = null;
        }
      };
    };

    if (window.L) {
      initMap();
    } else {
      // Load leaflet dynamically if not loaded
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex p-4 gap-4 bg-[#f0f4f8]">
        {/* Map Area */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-card overflow-hidden">
          {/* Layer Filters */}
          <div className="flex items-center gap-2 p-3 border-b overflow-x-auto flex-shrink-0">
            {LAYERS.map(l => (
              <button
                key={l}
                onClick={() => setActiveLayer(l)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition ${activeLayer === l ? 'bg-[#1a3a6b] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {l}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <button className="flex items-center gap-1 text-xs text-gray-600 border px-3 py-1 rounded-lg hover:bg-gray-50">
                <span>⊞</span> Layers
              </button>
              <button className="flex items-center gap-1 text-xs text-gray-600 border px-3 py-1 rounded-lg hover:bg-gray-50">
                <span>▽</span> Filter
              </button>
            </div>
          </div>

          {/* The Map */}
          <div ref={mapRef} className="flex-1" style={{ minHeight: 400 }} />

          {/* Legend */}
          <div className="flex flex-wrap gap-3 px-4 py-2 border-t text-[11px] text-gray-500 flex-shrink-0">
            {[['🔴','SOS Alerts'],['🟡','Incidents'],['🟢','Rescue Teams'],['🔵','Shelters'],['🏥','Hospitals'],['🔴','Road Blocks'],['💧','Flood Areas'],['⛰️','Landslide Areas']].map(([icon, label]) => (
              <span key={label} className="flex items-center gap-1">{icon} {label}</span>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-52 flex flex-col gap-3">
          {/* Map Stats */}
          <div className="bg-white rounded-xl shadow-card p-3">
            <h3 className="font-semibold text-sm text-gray-800 mb-2">Map Statistics</h3>
            <div className="space-y-2">
              {MAP_STATS.map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{s.label}</span>
                  <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-card p-3">
            <h3 className="font-semibold text-sm text-gray-800 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-xs flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition">
                ➕ Add Incident
              </button>
              <button className="w-full text-xs flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-100 transition">
                📣 Broadcast Alert
              </button>
              <button className="w-full text-xs flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition">
                👥 Assign Team
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
