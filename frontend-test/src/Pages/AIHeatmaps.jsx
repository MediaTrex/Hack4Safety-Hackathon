import React, { useEffect, useRef, useState } from 'react';

const HEAT_TYPES = ['Flood Risk', 'Landslide Risk', 'Accident Hotspot', 'Crowd Density'];

// Heatmap data for Nepal districts
const HEATMAP_DATA = {
  'Flood Risk': [
    // [lat, lng, intensity] - high risk areas in Terai and river basins
    [27.6745, 83.4753, 1.0], // Butwal
    [27.7082, 83.4591, 0.9], // Rupandehi
    [27.5291, 84.3542, 0.85], // Narayanghat
    [26.6567, 88.0238, 0.8], // Jhapa
    [27.6767, 85.3149, 0.6], // Kathmandu
    [26.4525, 87.2718, 0.75], // Biratnagar
    [28.3949, 80.1963, 0.9], // Kailali
    [27.8974, 81.6314, 0.85], // Dang
    [27.5030, 83.4500, 0.7],
    [27.4500, 83.6000, 0.65],
    [27.3500, 84.0000, 0.8],
    [26.7000, 87.5000, 0.7],
  ],
  'Landslide Risk': [
    [28.2096, 83.9856, 0.95], // Pokhara hills
    [27.9674, 82.8309, 0.9], // Palpa
    [28.1784, 82.1752, 0.85], // Dang hills
    [27.7956, 84.4302, 0.8], // Gorkha
    [28.5466, 83.8654, 0.9], // Lamjung
    [28.6333, 83.9333, 0.85],
    [27.6000, 86.7000, 0.9], // Khumbu
    [28.0000, 85.3000, 0.75],
    [29.0000, 84.5000, 0.8],
  ],
  'Accident Hotspot': [
    [27.6745, 83.4753, 0.9],
    [27.6767, 85.3149, 0.85],
    [28.2096, 83.9856, 0.7],
    [27.5291, 84.3542, 0.8],
    [26.4525, 87.2718, 0.75],
    [27.7172, 85.3240, 0.9],
    [27.6588, 83.4561, 0.85],
  ],
  'Crowd Density': [
    [27.7172, 85.3240, 1.0], // Kathmandu center
    [27.6767, 85.3149, 0.9],
    [28.2096, 83.9856, 0.8], // Pokhara
    [26.4525, 87.2718, 0.75],
    [27.6745, 83.4753, 0.7],
    [27.9333, 81.6167, 0.65],
  ],
};

export default function AIHeatmaps() {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const heatLayer = useRef(null);
  const [activeTab, setActiveTab] = useState('Flood Risk');
  const [date, setDate] = useState('May 23, 2025');

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || leafletMap.current) return;
      const L = window.L;
      if (!L) return;

      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false }).setView([28.0, 83.5], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
      leafletMap.current = map;

      addHeatmap('Flood Risk');
    };

    const addHeatmap = (type) => {
      const L = window.L;
      if (!L || !leafletMap.current) return;
      const data = HEATMAP_DATA[type] || [];

      // Remove existing circles
      if (heatLayer.current) {
        heatLayer.current.forEach(l => leafletMap.current.removeLayer(l));
      }

      const colors = {
        'Flood Risk': ['#3b82f6', '#1d4ed8'],
        'Landslide Risk': ['#f59e0b', '#d97706'],
        'Accident Hotspot': ['#ef4444', '#dc2626'],
        'Crowd Density': ['#8b5cf6', '#7c3aed'],
      };
      const [c1, c2] = colors[type] || ['#ef4444', '#dc2626'];

      const layers = data.map(([lat, lng, intensity]) => {
        const radius = intensity * 40000;
        return L.circle([lat, lng], {
          radius,
          color: 'transparent',
          fillColor: intensity > 0.8 ? c2 : c1,
          fillOpacity: intensity * 0.45,
          weight: 0,
        }).addTo(leafletMap.current);
      });
      heatLayer.current = layers;
    };

    if (window.L) {
      initMap();
    } else {
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

  useEffect(() => {
    if (!leafletMap.current || !window.L) return;
    const L = window.L;
    const data = HEATMAP_DATA[activeTab] || [];

    if (heatLayer.current) {
      heatLayer.current.forEach(l => leafletMap.current.removeLayer(l));
    }
    const colors = {
      'Flood Risk': ['#3b82f6', '#1d4ed8'],
      'Landslide Risk': ['#f59e0b', '#d97706'],
      'Accident Hotspot': ['#ef4444', '#dc2626'],
      'Crowd Density': ['#8b5cf6', '#7c3aed'],
    };
    const [c1, c2] = colors[activeTab] || ['#ef4444', '#dc2626'];

    const layers = data.map(([lat, lng, intensity]) => {
      const radius = intensity * 40000;
      return L.circle([lat, lng], {
        radius,
        color: 'transparent',
        fillColor: intensity > 0.8 ? c2 : c1,
        fillOpacity: intensity * 0.45,
        weight: 0,
      }).addTo(leafletMap.current);
    });
    heatLayer.current = layers;
  }, [activeTab]);

  const riskSummary = {
    'Flood Risk': { high: 8, medium: 14, low: 23, accuracy: 87, subtext: 'High risk in Rupandehi, Chitwan and surrounding river basins due to heavy rainfall prediction.' },
    'Landslide Risk': { high: 6, medium: 11, low: 18, accuracy: 82, subtext: 'High risk in hilly regions of Palpa, Pokhara, and Gorkha due to soil saturation.' },
    'Accident Hotspot': { high: 5, medium: 9, low: 15, accuracy: 78, subtext: 'Major hotspots on Siddharth Highway and Prithvi Highway sections.' },
    'Crowd Density': { high: 4, medium: 7, low: 12, accuracy: 91, subtext: 'High density areas in Kathmandu Valley; monitoring recommended.' },
  };
  const rs = riskSummary[activeTab];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 space-y-4 bg-[#f0f4f8]">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-card p-1 flex gap-1 max-w-max">
          {HEAT_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-sm rounded-lg transition ${activeTab === t ? 'bg-[#1a3a6b] text-white font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          {/* Map */}
          <div className="flex-1 bg-white rounded-xl shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="flex items-center gap-2">
                <select className="text-sm border border-gray-200 rounded px-2 py-1">
                  <option>May 23, 2025</option>
                </select>
                <select className="text-sm border border-gray-200 rounded px-2 py-1">
                  <option>Next 24 Hours</option>
                  <option>Next 48 Hours</option>
                  <option>Next 7 Days</option>
                </select>
              </div>
              <button className="flex items-center gap-2 text-sm text-blue-600 border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-50">
                ⬇️ Download
              </button>
            </div>
            <div ref={mapRef} style={{ height: 400 }} />

            {/* Legend */}
            <div className="p-3 border-t">
              <p className="text-xs font-semibold text-gray-700 mb-2">Risk Level</p>
              <div className="flex flex-col gap-1">
                {[
                  ['Very High', '#7f1d1d'],
                  ['High', '#ef4444'],
                  ['Medium', '#f59e0b'],
                  ['Low', '#22c55e'],
                  ['Very Low', '#86efac'],
                ].map(([label, color]) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-8 h-3 rounded" style={{ background: color }} />
                    <span className="text-xs text-gray-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-64 flex flex-col gap-3">
            {/* Risk Summary */}
            <div className="bg-white rounded-xl shadow-card p-4">
              <h3 className="font-semibold text-sm text-gray-800 mb-1">Risk Summary ({activeTab.split(' ')[0]})</h3>
              <p className="text-xs text-gray-500 mb-3">{rs.subtext}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-red-50 rounded-lg p-2 text-center">
                  <p className="text-xl font-bold text-red-600">{rs.high}</p>
                  <p className="text-[10px] text-red-500">High Risk Areas</p>
                  <p className="text-[10px] text-gray-400">↑ 2 new</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-2 text-center">
                  <p className="text-xl font-bold text-orange-500">{rs.medium}</p>
                  <p className="text-[10px] text-orange-500">Medium Risk Areas</p>
                  <p className="text-[10px] text-gray-400">↑ 4 new</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2 text-center">
                  <p className="text-xl font-bold text-green-600">{rs.low}</p>
                  <p className="text-[10px] text-green-500">Low Risk Areas</p>
                  <p className="text-[10px] text-gray-400">No change</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <p className="text-xl font-bold text-blue-600">{rs.accuracy}%</p>
                  <p className="text-[10px] text-blue-500">Model Accuracy</p>
                  <div className="mt-1 h-1.5 bg-blue-200 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full" style={{width: `${rs.accuracy}%`}} />
                  </div>
                  <p className="text-[10px] text-gray-400">↑ 5% from last week</p>
                </div>
              </div>
            </div>

            {/* AI Model Info */}
            <div className="bg-white rounded-xl shadow-card p-4">
              <h3 className="font-semibold text-sm text-gray-800 mb-2">AI Model Info</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Model Version</span>
                  <span className="font-medium text-blue-600">v2.3.1</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated</span>
                  <span className="font-medium">2 hrs ago</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Sources</span>
                  <span className="font-medium">Weather, Satellite</span>
                </div>
                <div className="flex justify-between">
                  <span>Predictions</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
              </div>
            </div>

            {/* Integration Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">🔗 Backend Integration</p>
              <p className="text-[11px] text-blue-600">Connect your AI engine API to replace mock data with real-time predictions. Set <code className="bg-blue-100 px-1 rounded">REACT_APP_AI_API_URL</code> env variable.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
