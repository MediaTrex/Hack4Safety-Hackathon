import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

const HEAT_TYPES = [
  'Flood Risk',
  'Landslide Risk',
  'Accident Hotspot',
  'Crowd Density',
];

const HEATMAP_DATA = {
  'Flood Risk': [
    [27.6745, 83.4753, 1.0],
    [27.7082, 83.4591, 0.9],
    [27.5291, 84.3542, 0.85],
    [26.6567, 88.0238, 0.8],
    [27.6767, 85.3149, 0.6],
    [26.4525, 87.2718, 0.75],
    [28.3949, 80.1963, 0.9],
    [27.8974, 81.6314, 0.85],
    [27.5030, 83.4500, 0.7],
    [27.4500, 83.6000, 0.65],
    [27.3500, 84.0000, 0.8],
    [26.7000, 87.5000, 0.7],
  ],
  'Landslide Risk': [
    [28.2096, 83.9856, 0.95],
    [27.9674, 82.8309, 0.9],
    [28.1784, 82.1752, 0.85],
    [27.7956, 84.4302, 0.8],
    [28.5466, 83.8654, 0.9],
    [28.6333, 83.9333, 0.85],
    [27.6000, 86.7000, 0.9],
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
    [27.7172, 85.3240, 1.0],
    [27.6767, 85.3149, 0.9],
    [28.2096, 83.9856, 0.8],
    [26.4525, 87.2718, 0.75],
    [27.6745, 83.4753, 0.7],
    [27.9333, 81.6167, 0.65],
  ],
};

const riskSummary = {
  'Flood Risk': {
    high: 8,
    medium: 14,
    low: 23,
    accuracy: 87,
    subtext:
      'High risk in Rupandehi, Chitwan and surrounding river basins due to heavy rainfall prediction.',
  },
  'Landslide Risk': {
    high: 6,
    medium: 11,
    low: 18,
    accuracy: 82,
    subtext:
      'High risk in hilly regions of Palpa, Pokhara, and Gorkha due to soil saturation.',
  },
  'Accident Hotspot': {
    high: 5,
    medium: 9,
    low: 15,
    accuracy: 78,
    subtext:
      'Major hotspots on Siddharth Highway and Prithvi Highway sections.',
  },
  'Crowd Density': {
    high: 4,
    medium: 7,
    low: 12,
    accuracy: 91,
    subtext:
      'High density areas in Kathmandu Valley; monitoring recommended.',
  },
};

const THEMES = {
  'Flood Risk': {
    gradient: {
      0.15: '#22c55e',
      0.35: '#eab308',
      0.65: '#f97316',
      1.0: '#ef4444',
    },
    primary: '#3b82f6',
    accent: '#1d4ed8',
    glow: 'rgba(59,130,246,0.35)',
  },
  'Landslide Risk': {
    gradient: {
      0.15: '#84cc16',
      0.35: '#facc15',
      0.65: '#f97316',
      1.0: '#b45309',
    },
    primary: '#f59e0b',
    accent: '#d97706',
    glow: 'rgba(245,158,11,0.35)',
  },
  'Accident Hotspot': {
    gradient: {
      0.15: '#facc15',
      0.4: '#fb923c',
      0.7: '#ef4444',
      1.0: '#991b1b',
    },
    primary: '#ef4444',
    accent: '#dc2626',
    glow: 'rgba(239,68,68,0.35)',
  },
  'Crowd Density': {
    gradient: {
      0.15: '#60a5fa',
      0.35: '#8b5cf6',
      0.65: '#7c3aed',
      1.0: '#4c1d95',
    },
    primary: '#8b5cf6',
    accent: '#7c3aed',
    glow: 'rgba(139,92,246,0.35)',
  },
};

function getTopHotspot(data = []) {
  if (!data.length) return null;
  return [...data].sort((a, b) => b[2] - a[2])[0];
}

function createHotspotIcon(theme) {
  return L.divIcon({
    className: '',
    html: `
      <div class="ai-marker-root">
        <div class="ai-marker-pulse" style="--pulse-color:${theme.primary}; --pulse-glow:${theme.glow};"></div>
        <div class="ai-marker-bounce">
          <div class="ai-marker-core" style="--core-color:${theme.primary}; --core-accent:${theme.accent};"></div>
        </div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

export default function AIHeatmaps() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatLayerRef = useRef(null);
  const hotspotMarkerRef = useRef(null);

  const [activeTab, setActiveTab] = useState('Flood Risk');
  const [date] = useState('May 23, 2025');
  const rs = riskSummary[activeTab];

  const activeData = useMemo(() => HEATMAP_DATA[activeTab] || [], [activeTab]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([28.2, 84.0], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (heatLayerRef.current) {
        heatLayerRef.current.remove();
        heatLayerRef.current = null;
      }
      if (hotspotMarkerRef.current) {
        hotspotMarkerRef.current.remove();
        hotspotMarkerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const theme = THEMES[activeTab];
    const points = activeData.map(([lat, lng, intensity]) => [lat, lng, intensity]);

    if (heatLayerRef.current) {
      heatLayerRef.current.remove();
      heatLayerRef.current = null;
    }

    if (hotspotMarkerRef.current) {
      hotspotMarkerRef.current.remove();
      hotspotMarkerRef.current = null;
    }

    heatLayerRef.current = L.heatLayer(points, {
      radius: 30,
      blur: 24,
      maxZoom: 11,
      minOpacity: 0.35,
      gradient: theme.gradient,
    }).addTo(map);

    const top = getTopHotspot(activeData);
    if (top) {
      const [lat, lng, intensity] = top;

      hotspotMarkerRef.current = L.marker([lat, lng], {
        icon: createHotspotIcon(theme),
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:180px">
            <div style="font-weight:700; margin-bottom:4px;">${activeTab}</div>
            <div style="font-size:12px; color:#475569;">AI hotspot intensity: ${(intensity * 100).toFixed(0)}%</div>
          </div>
        `);

      map.flyTo([lat, lng], 8, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [activeTab, activeData]);

  return (
    <div className="flex flex-col h-full">
      <style>{`
        .shadow-card {
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        }

        .ai-marker-root {
          position: relative;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-marker-pulse {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: var(--pulse-glow);
          animation: aiPulse 1.8s ease-out infinite;
          transform-origin: center;
        }

        .ai-marker-bounce {
          position: relative;
          width: 18px;
          height: 18px;
          animation: aiBounce 1.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }

        .ai-marker-core {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background:
            radial-gradient(circle at 30% 30%, #ffffff 0%, var(--core-color) 45%, var(--core-accent) 100%);
          border: 2px solid rgba(255,255,255,0.95);
          box-shadow:
            0 0 0 4px rgba(255,255,255,0.18),
            0 10px 24px rgba(15, 23, 42, 0.28);
        }

        @keyframes aiPulse {
          0% {
            transform: scale(0.9);
            opacity: 0.85;
          }
          70% {
            transform: scale(2.6);
            opacity: 0;
          }
          100% {
            transform: scale(2.8);
            opacity: 0;
          }
        }

        @keyframes aiBounce {
          0%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px) scale(1.02);
          }
          55% {
            transform: translateY(0) scale(0.98);
          }
          75% {
            transform: translateY(-4px) scale(1);
          }
        }

        .leaflet-popup-content-wrapper {
          border-radius: 12px;
        }

        .leaflet-container {
          font-family: inherit;
        }
      `}</style>

      <div className="flex-1 p-4 space-y-4 bg-[#f0f4f8]">
        <div className="bg-white rounded-xl shadow-card p-1 flex gap-1 max-w-max flex-wrap">
          {HEAT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-sm rounded-lg transition ${
                activeTab === t
                  ? 'bg-[#1a3a6b] text-white font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-4 max-lg:flex-col">
          <div className="flex-1 bg-white rounded-xl shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b max-sm:flex-col max-sm:items-start max-sm:gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={date}
                  readOnly
                  className="text-sm border border-gray-200 rounded px-2 py-1"
                >
                  <option>{date}</option>
                </select>

                <select className="text-sm border border-gray-200 rounded px-2 py-1">
                  <option>Next 24 Hours</option>
                  <option>Next 48 Hours</option>
                  <option>Next 7 Days</option>
                </select>
              </div>

              <button className="flex items-center gap-2 text-sm text-blue-600 border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-50">
                Download
              </button>
            </div>

            <div ref={mapRef} style={{ height: 420, width: '100%' }} />

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

          <div className="w-64 max-lg:w-full flex flex-col gap-3">
            <div className="bg-white rounded-xl shadow-card p-4">
              <h3 className="font-semibold text-sm text-gray-800 mb-1">
                Risk Summary ({activeTab.split(' ')[0]})
              </h3>
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
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${rs.accuracy}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400">↑ 5% from last week</p>
                </div>
              </div>
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}