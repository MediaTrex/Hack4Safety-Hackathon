import React, { useEffect, useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

const statCards = [
  {
    label: "Active Incidents",
    value: "24",
    sub: "↑ 5 new today",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-l-4 border-blue-500",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    label: "SOS Alerts",
    value: "18",
    sub: "↑ 7 new today",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-l-4 border-red-500",
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    sos: true,
  },
  {
    label: "Rescue Teams",
    value: "32",
    sub: "↑ 4 on mission",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-l-4 border-green-500",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    label: "People Assisted",
    value: "256",
    sub: "↑ 42 today",
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-l-4 border-teal-500",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  },
];

const recentAlerts = [
  {
    type: "Flood Alert",
    loc: "Butwal, Rupandehi",
    time: "2 min ago",
    color: "text-blue-600",
    dot: "bg-blue-500",
  },
  {
    type: "Landslide Reported",
    loc: "Palpa, Tanahun",
    time: "15 min ago",
    color: "text-orange-600",
    dot: "bg-orange-500",
  },
  {
    type: "Accident Reported",
    loc: "Siddharth Hwy, Bhairawa",
    time: "28 min ago",
    color: "text-red-600",
    dot: "bg-red-500",
  },
  {
    type: "Crowd Gathering",
    loc: "Tinkune, Kathmandu",
    time: "45 min ago",
    color: "text-purple-600",
    dot: "bg-purple-500",
  },
  {
    type: "Fire Alert",
    loc: "Biratnagar, Morang",
    time: "1 hr ago",
    color: "text-red-600",
    dot: "bg-red-600",
  },
  {
    type: "Flood Alert",
    loc: "Birgunj, Parsa",
    time: "2 hr ago",
    color: "text-blue-600",
    dot: "bg-blue-500",
  },
];

const activeOps = [
  {
    id: "OP-2025-0523-01",
    type: "Flood Rescue",
    loc: "Butwal-11, Rupandehi",
    status: "In Progress",
    sc: "text-blue-600 bg-blue-50",
  },
  {
    id: "OP-2025-0523-02",
    type: "Landslide Response",
    loc: "Palpa, Tanahun",
    status: "On The Way",
    sc: "text-orange-600 bg-orange-50",
  },
  {
    id: "OP-2025-0523-03",
    type: "Accident Rescue",
    loc: "Siddharth Hwy, Bhairawa",
    status: "Rescue Started",
    sc: "text-green-600 bg-green-50",
  },
  {
    id: "OP-2025-0523-04",
    type: "Flood Rescue",
    loc: "Kapilvastu-7",
    status: "In Progress",
    sc: "text-blue-600 bg-blue-50",
  },
  {
    id: "OP-2025-0523-05",
    type: "Fire Response",
    loc: "Biratnagar, Morang",
    status: "Assigned",
    sc: "text-gray-600 bg-gray-100",
  },
];

const incidentData = [
  { name: "Flood", value: 10, color: "#3b82f6" },
  { name: "Landslide", value: 6, color: "#f59e0b" },
  { name: "Accident", value: 4, color: "#ef4444" },
  { name: "Fire", value: 2, color: "#f97316" },
  { name: "Other", value: 2, color: "#9ca3af" },
];

const teamData = [
  { name: "Not Assign", value: 16, color: "#ff0000" },
  { name: "On Mission", value: 12, color: "#3b82f6" },
  { name: "Available", value: 10, color: "#22c55e" },
  { name: "On The Way", value: 8, color: "#f59e0b" },
  { name: "Standby", value: 2, color: "#d1d5db" },
];

const sparkData = [3, 5, 4, 7, 6, 8, 9, 7, 8, 10, 9, 11].map((v) => ({ v }));

function StatIcon({ d }) {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default function Dashboard({ onNavigate }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);

  useEffect(() => {
    const init = () => {
      if (!mapRef.current || leafletMap.current || !window.L) return;
      const L = window.L;
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([28.1, 83.5], 7);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
      }).addTo(map);
      L.control.zoom({ position: "topright" }).addTo(map);
      leafletMap.current = map;
      [
        [28.18, 82.19, "#ef4444"],
        [27.68, 84.42, "#3b82f6"],
        [28.05, 82.58, "#f59e0b"],
        [27.67, 85.43, "#8b5cf6"],
        [26.45, 87.28, "#ef4444"],
        [28.63, 83.98, "#3b82f6"],
      ].forEach(([la, ln, c]) => {
        const icon = window.L.divIcon({
          className: "custom-marker",
          html: `<div class="marker-glow" style="background:${c};box-shadow:0 0 16px 8px ${c}55, 0 0 32px 16px ${c}22;"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        window.L.marker([la, ln], { icon }).addTo(map);
      });
    };
    if (window.L) init();
    else {
      const s = document.createElement("script");
      s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      s.onload = init;
      document.head.appendChild(s);
    }
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full page-enter">
      <div className="flex-1 p-4 space-y-4 bg-[#f0f4f8]">
        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-4 gap-3">
          {statCards.map((s) => (
            <div
              key={s.label}
              className={`bg-white rounded-xl p-4 shadow-card ${s.border} relative overflow-hidden`}
            >
              <div
                className={`absolute top-3 right-3 w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center ${s.color}`}
              >
                <StatIcon d={s.icon} />
              </div>
              <p className="text-[11px] text-gray-600 font-medium">{s.label}</p>
              <p
                className={`text-3xl font-bold mt-1 ${s.color} ${s.sos ? "sos-badge" : ""}`}
              >
                {s.value}
              </p>
              <p className="text-[11px] text-green-600 mt-1 font-medium">
                {s.sub}
              </p>
            </div>
          ))}
        </div>

        {/* ── Row 2: Map + Alerts + Active Ops ── */}
        <div className="grid grid-cols-3 gap-4">
          {/* Live Map */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <h3 className="font-semibold text-sm text-gray-800">
                Live Situation Map
              </h3>
              <button
                onClick={() => onNavigate && onNavigate("live-map")}
                className="text-xs text-primary hover:underline font-medium"
              >
                View Full Map →
              </button>
            </div>
            <div ref={mapRef} className="h-52" />
            <div className="px-3 py-2 flex flex-wrap gap-3 bg-gray-50 border-t border-gray-100">
              {[
                ["bg-red-500", "SOS"],
                ["bg-blue-500", "Flood"],
                ["bg-orange-400", "Landslide"],
                ["bg-green-500", "Teams"],
              ].map(([c, l]) => (
                <span
                  key={l}
                  className="flex items-center gap-1 text-[10px] text-gray-600"
                >
                  <span className={`w-2 h-2 rounded-full ${c}`} />
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-xl shadow-card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <h3 className="font-semibold text-sm text-gray-800">
                Recent Alerts
              </h3>
              <button
                onClick={() => onNavigate && onNavigate("sos-alerts")}
                className="text-xs text-primary hover:underline font-medium"
              >
                View All
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentAlerts.map((a) => (
                <div
                  key={a.type}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition"
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${a.dot}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${a.color}`}>
                      {a.type}
                    </p>
                    <p className="text-[11px] text-gray-600 truncate">
                      {a.loc}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-600 whitespace-nowrap">
                    {a.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Ops */}
          <div className="bg-white rounded-xl shadow-card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <h3 className="font-semibold text-sm text-gray-800">
                Active Operations
              </h3>
              <button
                onClick={() => onNavigate && onNavigate("operations")}
                className="text-xs text-primary hover:underline font-medium"
              >
                View All
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {activeOps.map((op) => (
                <div
                  key={op.id}
                  className="px-4 py-2.5 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[11px] text-primary font-semibold">
                      {op.id}
                    </p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${op.sc}`}
                    >
                      {op.status}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-700">{op.type}</p>
                  <p className="text-[11px] text-gray-600">{op.loc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 3: AI Risk + Incident Stats + Team Deployment ── */}
        <div className="grid grid-cols-3 gap-4">
          {/* AI Risk */}
          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-800">
                AI Predictive Risk
              </h3>
              <button
                onClick={() => onNavigate && onNavigate("ai-heatmaps")}
                className="text-xs text-primary hover:underline font-medium"
              >
                View Heatmap
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Flood Risk", risk: "High", pct: "82%", c: "red" },
                {
                  label: "Landslide Risk",
                  risk: "Medium",
                  pct: "65%",
                  c: "orange",
                },
                {
                  label: "Accident Hotspot",
                  risk: "High",
                  pct: "78%",
                  c: "red",
                },
                {
                  label: "Crowd Density",
                  risk: "Medium",
                  pct: "55%",
                  c: "orange",
                },
              ].map((r) => (
                <div
                  key={r.label}
                  className={`rounded-xl p-3 border ${r.c === "red" ? "border-red-100 bg-red-50" : "border-orange-100 bg-orange-50"}`}
                >
                  <p className="text-[10px] text-gray-600 font-medium">
                    {r.label}
                  </p>
                  <p
                    className={`text-[10px] font-semibold ${r.c === "red" ? "text-red-500" : "text-orange-600"}`}
                  >
                    {r.risk}
                  </p>
                  <p
                    className={`text-2xl font-bold ${r.c === "red" ? "text-red-600" : "text-orange-600"}`}
                  >
                    {r.pct}
                  </p>
                  <ResponsiveContainer width="100%" height={28}>
                    <AreaChart data={sparkData}>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={r.c === "red" ? "#ef4444" : "#f97316"}
                        fill={r.c === "red" ? "#fee2e2" : "#fff7ed"}
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Stats */}
          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-800 mb-3">
              Incident Statistics (Today)
            </h3>
            <button
              onClick={() => onNavigate && onNavigate("incidents")}
              className="text-xs text-primary hover:underline font-medium"
            >
              View All
            </button>
            </div>
            <div className="flex flex-col gap-3 p-4">
              <div className="relative flex-shrink-0 flex flex-col items-center justify-center">
                <PieChart width={120} height={120}>
                  <Pie
                    data={incidentData}
                    cx={57}
                    cy={57}
                    innerRadius={36}
                    outerRadius={59}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {incidentData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[9px] text-gray-600">Total</p>
                  <p className="text-xl font-bold text-gray-800">24</p>
                </div>
              </div>
              <div className="space-y-1.5 flex-1">
                {incidentData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ background: d.color }}
                    />
                    <span className="text-[11px] text-gray-600 flex-1">
                      {d.name}
                    </span>
                    <span className="text-[11px] font-bold text-gray-700">
                      {d.value}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      ({Math.round((d.value / 24) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Deployment */}
          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-800">
                Team Deployment
              </h3>
              <button
                onClick={() => onNavigate && onNavigate("rescue-teams")}
                className="text-xs text-primary hover:underline font-medium"
              >
                View All
              </button>
            </div>
            <div className="flex flex-col gap-3 p-4">
              <div className="relative flex-shrink-0 flex flex-col items-center justify-center">
                <PieChart width={120} height={120}>
                  <Pie
                    data={teamData}
                    cx={57}
                    cy={57}
                    innerRadius={36}
                    outerRadius={59}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {teamData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[9px] text-gray-600">Teams</p>
                  <p className="text-xl font-bold text-gray-800">48</p>
                </div>
              </div>
              <div className="space-y-1.5 flex-1">
                {teamData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ background: d.color }}
                    />
                    <span className="text-[11px] text-gray-600 flex-1">
                      {d.name}
                    </span>
                    <span className="text-[11px] font-bold text-gray-700">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
