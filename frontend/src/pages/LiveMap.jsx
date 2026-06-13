import React, { useEffect, useRef, useState } from 'react';

const MARKERS = [
  { lat: 27.6745, lng: 83.4753, type: 'SOS', label: 'SOS - Butwal', color: '#ef4444', icon: '🆘' },
  { lat: 28.1784, lng: 82.1752, type: 'Flood', label: 'Flood Alert - Dang', color: '#3b82f6', icon: '🌊' },
  { lat: 27.9674, lng: 82.8309, type: 'Landslide', label: 'Landslide - Palpa', color: '#f59e0b', icon: '⛰️' },
  { lat: 27.6767, lng: 85.3149, type: 'Team', label: 'Team Alpha - Kathmandu', color: '#22c55e', icon: '🚑' },
  { lat: 27.6588, lng: 83.4561, type: 'SOS', label: 'SOS - Bhairahawa', color: '#ef4444', icon: '🆘' },
  { lat: 26.4525, lng: 87.2718, type: 'Fire', label: 'Fire - Biratnagar', color: '#f97316', icon: '🔥' },
  { lat: 28.2096, lng: 83.9856, type: 'Team', label: 'Team Bravo - Pokhara', color: '#22c55e', icon: '🚑' },
  { lat: 27.7172, lng: 85.3240, type: 'Hospital', label: 'Bir Hospital', color: '#0ea5e9', icon: '🏥' },
  { lat: 27.5291, lng: 84.3542, type: 'Team', label: 'Team Charlie - Chitwan', color: '#22c55e', icon: '🚑' },
  { lat: 26.6567, lng: 88.0238, type: 'Shelter', label: 'Shelter - Jhapa', color: '#8b5cf6', icon: '🏠' },
  { lat: 27.7069, lng: 85.3145, type: 'Crowd', label: 'Crowd - Tinkune', color: '#a855f7', icon: '👥' },
  { lat: 28.3949, lng: 84.1240, type: 'Flood', label: 'Flood Alert - Lamjung', color: '#3b82f6', icon: '🌊' },
  { lat: 28.2380, lng: 83.9956, type: 'Hospital', label: 'Pokhara Regional Hospital', color: '#0ea5e9', icon: '🏥' },
  { lat: 28.6835, lng: 81.6227, type: 'Fire', label: 'Forest Fire - Surkhet', color: '#f97316', icon: '🔥' },
  { lat: 29.2747, lng: 82.1838, type: 'Landslide', label: 'Landslide - Jumla', color: '#f59e0b', icon: '⛰️' },
  { lat: 28.0500, lng: 81.6167, type: 'Flood', label: 'Flood - Banke', color: '#3b82f6', icon: '🌊' },
  { lat: 28.9985, lng: 80.2767, type: 'SOS', label: 'SOS - Dhangadhi', color: '#ef4444', icon: '🆘' },
  { lat: 29.8412, lng: 80.5385, type: 'Shelter', label: 'Emergency Shelter - Dadeldhura', color: '#8b5cf6', icon: '🏠' },
  { lat: 28.7000, lng: 80.6000, type: 'Team', label: 'Team Delta - Kailali', color: '#22c55e', icon: '🚑' },
  { lat: 27.3314, lng: 87.6743, type: 'Hospital', label: 'District Hospital - Dharan', color: '#0ea5e9', icon: '🏥' },
  { lat: 26.8120, lng: 87.2833, type: 'Crowd', label: 'Crowd Gathering - Itahari', color: '#a855f7', icon: '👥' },
  { lat: 26.6445, lng: 87.9906, type: 'SOS', label: 'SOS - Birtamod', color: '#ef4444', icon: '🆘' },
  { lat: 26.5450, lng: 87.2718, type: 'Fire', label: 'Warehouse Fire - Biratnagar', color: '#f97316', icon: '🔥' },
  { lat: 27.0380, lng: 87.3210, type: 'Flood', label: 'Flood - Sunsari', color: '#3b82f6', icon: '🌊' },
  { lat: 27.4295, lng: 85.0322, type: 'Hospital', label: 'Hetauda Hospital', color: '#0ea5e9', icon: '🏥' },
  { lat: 27.6300, lng: 85.5200, type: 'Crowd', label: 'Crowd - Banepa', color: '#a855f7', icon: '👥' },
  { lat: 27.6306, lng: 85.5211, type: 'Team', label: 'Team Echo - Kavre', color: '#22c55e', icon: '🚑' },
  { lat: 27.1610, lng: 84.9800, type: 'SOS', label: 'SOS - Simara', color: '#ef4444', icon: '🆘' },
  { lat: 27.0104, lng: 84.8770, type: 'Fire', label: 'Factory Fire - Birgunj', color: '#f97316', icon: '🔥' },
  { lat: 27.1878, lng: 84.9870, type: 'Shelter', label: 'Relief Camp - Bara', color: '#8b5cf6', icon: '🏠' },
  { lat: 28.6956, lng: 83.4861, type: 'Landslide', label: 'Landslide - Mustang', color: '#f59e0b', icon: '⛰️' },
  { lat: 28.5980, lng: 81.6330, type: 'Flood', label: 'Flood Risk - Bheri River', color: '#3b82f6', icon: '🌊' },
  { lat: 28.1000, lng: 84.1000, type: 'Helipad', label: 'Rescue Helipad', color: '#06b6d4', icon: '🚁' },
  { lat: 27.5500, lng: 83.4500, type: 'Shelter', label: 'Shelter - Butwal', color: '#8b5cf6', icon: '🏠' },
  { lat: 27.6900, lng: 83.4700, type: 'Hospital', label: 'Lumbini Provincial Hospital', color: '#0ea5e9', icon: '🏥' },
  { lat: 27.6200, lng: 83.4400, type: 'Crowd', label: 'Crowd - Butwal Bus Park', color: '#a855f7', icon: '👥' },
  { lat: 27.7000, lng: 83.4800, type: 'Team', label: 'Team Foxtrot - Rupandehi', color: '#22c55e', icon: '🚑' },
  { lat: 27.7170, lng: 85.3300, type: 'Emergency', label: 'Emergency HQ', color: '#dc2626', icon: '🚨' },
  { lat: 27.7000, lng: 85.3500, type: 'Helipad', label: 'Army Rescue Helicopter', color: '#06b6d4', icon: '🚁' },
  { lat: 27.7300, lng: 85.3000, type: 'Shelter', label: 'National Relief Camp', color: '#8b5cf6', icon: '🏠' },
];

// Map each filter layer to the marker types it should show
const LAYER_TYPE_MAP = {
  'All': null, // null = show everything
  'Incidents': ['Fire', 'Crowd', 'Emergency', 'Helipad'],
  'SOS Alerts': ['SOS'],
  'Rescue Teams': ['Team'],
  'Shelters': ['Shelter'],
  'Hospitals': ['Hospital'],
  'Road Blocks': [], // No markers of this type currently, will show empty
  'Flood Areas': ['Flood'],
  'Landslide Areas': ['Landslide'],
};

const LAYERS = Object.keys(LAYER_TYPE_MAP);

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

export default function LiveMap() {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  // Store leaflet marker objects keyed by index
  const markerRefs = useRef([]);
  const [activeLayer, setActiveLayer] = useState('All');
  const [mapReady, setMapReady] = useState(false);

  // Initialize the map once
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || leafletMap.current) return;
      const L = window.L;
      if (!L) return;

      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false }).setView([28.0, 83.5], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap',
      }).addTo(map);
      leafletMap.current = map;

      // Create all markers and store references
      markerRefs.current = MARKERS.map(m => {
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            width:22px;height:22px;border-radius:50%;
            background:${m.color};
            box-shadow:0 0 10px 4px ${m.color}66, 0 0 20px 8px ${m.color}33;
            border:2px solid white;
          "></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:sans-serif;min-width:140px">
            <div style="font-size:13px;font-weight:600;margin-bottom:4px">${m.icon} ${m.label}</div>
            <div style="font-size:11px;color:#666;background:#f3f4f6;display:inline-block;padding:2px 8px;border-radius:99px">${m.type}</div>
          </div>
        `);
        return { marker, type: m.type };
      });

      setMapReady(true);
    };

    if (window.L) {
      initMap();
    } else {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        markerRefs.current = [];
      }
    };
  }, []);

  // Show/hide markers whenever activeLayer changes (and map is ready)
  useEffect(() => {
    if (!mapReady || !leafletMap.current) return;
    const allowedTypes = LAYER_TYPE_MAP[activeLayer];

    markerRefs.current.forEach(({ marker, type }) => {
      if (allowedTypes === null || allowedTypes.includes(type)) {
        // Show: add to map if not already there
        if (!leafletMap.current.hasLayer(marker)) {
          marker.addTo(leafletMap.current);
        }
      } else {
        // Hide: remove from map
        if (leafletMap.current.hasLayer(marker)) {
          leafletMap.current.removeLayer(marker);
        }
      }
    });
  }, [activeLayer, mapReady]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex p-4 gap-4 bg-[#f0f4f8]">
        {/* Map Area */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow overflow-hidden">
          {/* Layer Filters */}
          <div className="flex items-center gap-2 p-3 border-b overflow-x-auto flex-shrink-0">
            {LAYERS.map(l => (
              <button
                key={l}
                onClick={() => setActiveLayer(l)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap font-medium transition-all ${
                  activeLayer === l
                    ? 'bg-[#1a3a6b] text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {l}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              <button className="flex items-center gap-1 text-xs text-gray-600 border px-3 py-1 rounded-lg hover:bg-gray-50">
                <span>⊞</span> Layers
              </button>
              <button className="flex items-center gap-1 text-xs text-gray-600 border px-3 py-1 rounded-lg hover:bg-gray-50">
                <span>▽</span> Filter
              </button>
            </div>
          </div>

          {/* Active Layer Badge */}
          {activeLayer !== 'All' && (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 border-b text-xs text-blue-700">
              <span>Showing:</span>
              <span className="font-semibold">{activeLayer}</span>
              <span className="text-blue-400">
                ({(LAYER_TYPE_MAP[activeLayer] || []).length === 0
                  ? 'No markers for this layer'
                  : `${markerRefs.current.filter(m => (LAYER_TYPE_MAP[activeLayer] || []).includes(m.type)).length} markers`})
              </span>
              <button
                onClick={() => setActiveLayer('All')}
                className="ml-auto text-blue-500 hover:text-blue-700 font-medium"
              >
                ✕ Clear filter
              </button>
            </div>
          )}

          {/* The Map */}
          <div ref={mapRef} className="flex-1" style={{ minHeight: 400 }} />

          {/* Legend */}
          <div className="flex flex-wrap gap-3 px-4 py-2 border-t text-[11px] text-gray-500 flex-shrink-0">
            {[
              ['🆘', 'SOS Alerts', 'SOS Alerts'],
              ['🔥', 'Incidents', 'Incidents'],
              ['🚑', 'Rescue Teams', 'Rescue Teams'],
              ['🏠', 'Shelters', 'Shelters'],
              ['🏥', 'Hospitals', 'Hospitals'],
              ['💧', 'Flood Areas', 'Flood Areas'],
              ['⛰️', 'Landslide', 'Landslide Areas'],
            ].map(([icon, label, layerName]) => (
              <button
                key={label}
                onClick={() => setActiveLayer(layerName)}
                className={`flex items-center gap-1 transition rounded px-1 ${
                  activeLayer === layerName ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:text-gray-700'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-52 flex flex-col gap-3">
          {/* Map Stats */}
          <div className="bg-white rounded-xl shadow p-3">
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
          <div className="bg-white rounded-xl shadow p-3">
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

          {/* Active Filter Info */}
          <div className="bg-white rounded-xl shadow p-3">
            <h3 className="font-semibold text-sm text-gray-800 mb-2">Active Filter</h3>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center justify-between">
                <span>Layer</span>
                <span className="font-semibold text-[#1a3a6b]">{activeLayer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Showing</span>
                <span className="font-semibold text-gray-700">
                  {activeLayer === 'All'
                    ? `${MARKERS.length} markers`
                    : `${markerRefs.current.filter(m => (LAYER_TYPE_MAP[activeLayer] || []).includes(m.type)).length} markers`}
                </span>
              </div>
            </div>
            {activeLayer !== 'All' && (
              <button
                onClick={() => setActiveLayer('All')}
                className="mt-2 w-full text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
              >
                Show All
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
