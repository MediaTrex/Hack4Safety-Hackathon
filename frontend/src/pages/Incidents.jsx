import React, { useState, useEffect, useRef } from "react";

const INCIDENTS = [
  // Page 1
  { id: "INC-2025-0523-24", type: "Flood",     location: "Butwal, Rupandehi",          time: "2025-05-23T10:21", status: "In Progress",      priority: "High",   team: "Team Alpha",   lat: 27.6745, lng: 83.4753 },
  { id: "INC-2025-0523-23", type: "Landslide", location: "Palpa, Tanahun",              time: "2025-05-23T09:41", status: "On The Way",       priority: "Medium", team: "Team Bravo",   lat: 27.9674, lng: 82.8309 },
  { id: "INC-2025-0523-22", type: "Accident",  location: "Siddharth Hwy, Bhairawa",    time: "2025-05-23T09:15", status: "Rescue Started",   priority: "High",   team: "Team Charlie", lat: 27.6588, lng: 83.4561 },
  { id: "INC-2025-0523-21", type: "Crowd",     location: "Tinkune, Kathmandu",          time: "2025-05-23T09:20", status: "Monitoring",       priority: "Low",    team: "-",            lat: 27.7069, lng: 85.3145 },
  { id: "INC-2025-0523-20", type: "Fire",      location: "Biratnagar, Morang",          time: "2025-05-23T07:50", status: "Assigned",         priority: "Medium", team: "Team Delta",   lat: 26.4525, lng: 87.2718 },
  { id: "INC-2025-0523-19", type: "Flood",     location: "Devdaha, Rupandehi",          time: "2025-05-23T07:20", status: "In Progress",      priority: "High",   team: "Team Alpha",   lat: 27.5034, lng: 83.4540 },
  { id: "INC-2025-0523-18", type: "Landslide", location: "Arghakhanchi",               time: "2025-05-23T06:40", status: "On The Way",       priority: "Medium", team: "Team Bravo",   lat: 27.9400, lng: 83.1500 },
  { id: "INC-2025-0523-17", type: "Accident",  location: "Pokhara, Kaski",             time: "2025-05-23T06:10", status: "Rescue Completed", priority: "Low",    team: "Team Charlie", lat: 28.2096, lng: 83.9856 },
  // Page 2
  { id: "INC-2025-0522-16", type: "Fire",      location: "Surkhet, Birendranagar",     time: "2025-05-22T21:30", status: "In Progress",      priority: "High",   team: "Team Echo",    lat: 28.6835, lng: 81.6227 },
  { id: "INC-2025-0522-15", type: "Flood",     location: "Banke, Nepalgunj",           time: "2025-05-22T19:55", status: "Rescue Started",   priority: "High",   team: "Team Foxtrot", lat: 28.0500, lng: 81.6167 },
  { id: "INC-2025-0522-14", type: "Crowd",     location: "Itahari, Sunsari",           time: "2025-05-22T18:10", status: "Monitoring",       priority: "Low",    team: "-",            lat: 26.8120, lng: 87.2833 },
  { id: "INC-2025-0522-13", type: "Landslide", location: "Jumla, Karnali",             time: "2025-05-22T16:45", status: "Assigned",         priority: "Medium", team: "Team Delta",   lat: 29.2747, lng: 82.1838 },
  { id: "INC-2025-0522-12", type: "Accident",  location: "Birgunj, Parsa",             time: "2025-05-22T14:30", status: "Rescue Completed", priority: "Low",    team: "Team Alpha",   lat: 27.0104, lng: 84.8770 },
  { id: "INC-2025-0522-11", type: "Fire",      location: "Dharan, Sunsari",            time: "2025-05-22T13:00", status: "In Progress",      priority: "High",   team: "Team Bravo",   lat: 27.3314, lng: 87.6743 },
  { id: "INC-2025-0522-10", type: "Flood",     location: "Chitwan, Bharatpur",         time: "2025-05-22T11:20", status: "On The Way",       priority: "Medium", team: "Team Charlie", lat: 27.5291, lng: 84.3542 },
  { id: "INC-2025-0522-09", type: "Crowd",     location: "Banepa, Kavre",              time: "2025-05-22T09:45", status: "Monitoring",       priority: "Low",    team: "-",            lat: 27.6300, lng: 85.5200 },
  // Page 3
  { id: "INC-2025-0521-08", type: "Landslide", location: "Mustang, Jomsom",            time: "2025-05-21T22:10", status: "Rescue Started",   priority: "High",   team: "Team Echo",    lat: 28.6956, lng: 83.4861 },
  { id: "INC-2025-0521-07", type: "Accident",  location: "Hetauda, Makwanpur",         time: "2025-05-21T20:30", status: "Rescue Completed", priority: "Medium", team: "Team Foxtrot", lat: 27.4295, lng: 85.0322 },
  { id: "INC-2025-0521-06", type: "Fire",      location: "Kailali, Dhangadhi",         time: "2025-05-21T18:00", status: "Assigned",         priority: "High",   team: "Team Delta",   lat: 28.7000, lng: 80.6000 },
  { id: "INC-2025-0521-05", type: "Flood",     location: "Lamjung, Besisahar",         time: "2025-05-21T15:30", status: "In Progress",      priority: "Medium", team: "Team Alpha",   lat: 28.3949, lng: 84.1240 },
  { id: "INC-2025-0521-04", type: "Crowd",     location: "Dadeldhura",                 time: "2025-05-21T13:10", status: "Monitoring",       priority: "Low",    team: "-",            lat: 29.8412, lng: 80.5385 },
  { id: "INC-2025-0521-03", type: "Landslide", location: "Sindhupalchok, Chautara",   time: "2025-05-21T11:00", status: "On The Way",       priority: "High",   team: "Team Bravo",   lat: 27.8606, lng: 85.6896 },
  { id: "INC-2025-0521-02", type: "Accident",  location: "Taplejung",                  time: "2025-05-21T08:40", status: "Rescue Started",   priority: "Medium", team: "Team Charlie", lat: 27.3543, lng: 87.6698 },
  { id: "INC-2025-0521-01", type: "Fire",      location: "Dolpa, Dunai",               time: "2025-05-21T06:15", status: "Rescue Completed", priority: "Low",    team: "Team Echo",    lat: 28.9940, lng: 82.8990 },
];

const PAGE_SIZE = 8;

const TYPE_ICON = { Flood: "", Landslide: "", Accident: "", Crowd: "", Fire: "" };
const TYPE_COLOR = { Flood: "#3b82f6", Landslide: "#f59e0b", Accident: "#8b5cf6", Crowd: "#a855f7", Fire: "#f97316" };

const STATUS_STYLE = {
  "In Progress":      "text-blue-600 bg-blue-50",
  "On The Way":       "text-orange-600 bg-orange-50",
  "Rescue Started":   "text-green-600 bg-green-50",
  Monitoring:         "text-sky-600 bg-sky-50",
  Assigned:           "text-purple-600 bg-purple-50",
  "Rescue Completed": "text-green-700 bg-green-100",
};

const PRIORITY_STYLE = {
  High:   "text-red-600 font-bold",
  Medium: "text-orange-500 font-bold",
  Low:    "text-green-600 font-bold",
};

function fmt(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, month: "short", day: "numeric" });
}

export default function Incidents() {
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [typeFilter, setTypeFilter]   = useState("All Types");
  const [dateFrom, setDateFrom]       = useState("");
  const [dateTo, setDateTo]           = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const mapRef     = useRef(null);
  const leafletMap = useRef(null);
  const markerRefs = useRef({});

  // ── Filtering ──────────────────────────────────────────────
  const filtered = INCIDENTS.filter((i) => {
    const matchSearch =
      search === "" ||
      i.id.toLowerCase().includes(search.toLowerCase()) ||
      i.location.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter   === "All Types"   || i.type   === typeFilter;
    const matchStatus = statusFilter === "All Status"  || i.status === statusFilter;

    const incDate = new Date(i.time);
    const matchFrom = dateFrom === "" || incDate >= new Date(dateFrom);
    const matchTo   = dateTo   === "" || incDate <= new Date(dateTo + "T23:59:59");

    return matchSearch && matchType && matchStatus && matchFrom && matchTo;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);
  const pageRows   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, typeFilter, dateFrom, dateTo]);

  // ── Leaflet init ────────────────────────────────────────────
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || leafletMap.current) return;
      const L = window.L;
      if (!L) return;

      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false }).setView([28.0, 83.5], 7);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(map);
      leafletMap.current = map;

      INCIDENTS.forEach((inc) => {
        const color = TYPE_COLOR[inc.type] || "#6b7280";
        const icon  = window.L.divIcon({
          className: "",
          html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 0 10px 4px ${color}66,0 0 20px 8px ${color}33;display:flex;align-items:center;justify-content:center;font-size:13px;line-height:1;">${TYPE_ICON[inc.type] || "📍"}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const marker = L.marker([inc.lat, inc.lng], { icon }).addTo(map);
        const pColor = inc.priority === "High" ? "#ef4444" : inc.priority === "Medium" ? "#f97316" : "#22c55e";
        marker.bindPopup(`
          <div style="font-family:sans-serif;min-width:170px">
            <div style="font-size:12px;font-weight:700;margin-bottom:4px">${TYPE_ICON[inc.type]} ${inc.type} — ${inc.location}</div>
            <div style="font-size:11px;color:#555;margin-bottom:2px">🕐 ${fmt(inc.time)}</div>
            <div style="font-size:11px;color:#555;margin-bottom:4px">👥 ${inc.team}</div>
            <span style="font-size:10px;background:${color}22;color:${color};padding:2px 8px;border-radius:99px;font-weight:600">${inc.status}</span>
            <span style="font-size:10px;color:${pColor};font-weight:700;margin-left:6px">${inc.priority}</span>
          </div>
        `);
        markerRefs.current[inc.id] = { marker, id: inc.id };
      });
    };

    if (window.L) {
      initMap();
    } else {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        markerRefs.current = {};
      }
    };
  }, []);

  // Sync markers to filtered set
  useEffect(() => {
    if (!leafletMap.current) return;
    const visibleIds = new Set(filtered.map((i) => i.id));
    Object.values(markerRefs.current).forEach(({ marker, id }) => {
      if (visibleIds.has(id)) {
        if (!leafletMap.current.hasLayer(marker)) marker.addTo(leafletMap.current);
      } else {
        if (leafletMap.current.hasLayer(marker)) leafletMap.current.removeLayer(marker);
      }
    });
  }, [filtered]);

  const focusIncident = (inc) => {
    setSelectedTeam(inc.id);
    if (!leafletMap.current) return;
    leafletMap.current.flyTo([inc.lat, inc.lng], 12, { duration: 0.8 });
    const ref = markerRefs.current[inc.id];
    if (ref) setTimeout(() => ref.marker.openPopup(), 850);
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Pagination ──────────────────────────────────────────────
  const renderPages = () => {
    const btns = [];
    btns.push(
      <button key="prev" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
        className="px-2.5 py-1 text-xs rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30">‹</button>
    );
    let nums = [];
    if (totalPages <= 5) {
      nums = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (safePage <= 3) {
      nums = [1, 2, 3, 4, "…", totalPages];
    } else if (safePage >= totalPages - 2) {
      nums = [1, "…", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      nums = [1, "…", safePage - 1, safePage, safePage + 1, "…", totalPages];
    }
    nums.forEach((p, i) => {
      if (p === "…") {
        btns.push(<span key={`e${i}`} className="px-2 py-1 text-xs text-gray-400">…</span>);
      } else {
        btns.push(
          <button key={p} onClick={() => setCurrentPage(p)}
            className={`px-2.5 py-1 text-xs rounded ${safePage === p ? "bg-[#1a3a6b] text-white" : "text-gray-500 hover:bg-gray-100"}`}>{p}</button>
        );
      }
    });
    btns.push(
      <button key="next" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
        className="px-2.5 py-1 text-xs rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30">›</button>
    );
    return btns;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 space-y-4 bg-[#f0f4f8]">

        {/* Table card */}
        <div className="bg-white rounded-xl shadow overflow-hidden">

          {/* Toolbar */}
          <div className="flex gap-3 p-4 border-b flex-wrap items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search incidents..."
              className="pl-3 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 max-w-xs"
            />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none">
              {["All Types","Flood","Landslide","Accident","Crowd","Fire"].map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none">
              {["All Status","In Progress","On The Way","Rescue Started","Monitoring","Assigned","Rescue Completed"].map(t => <option key={t}>{t}</option>)}
            </select>

            {/* Date range */}
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-xs text-gray-400 whitespace-nowrap">From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
              <span className="text-gray-400 text-xs">—</span>
              <label className="text-xs text-gray-400 whitespace-nowrap">To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
              {(dateFrom || dateTo) && (
                <button onClick={() => { setDateFrom(""); setDateTo(""); }}
                  className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-1">✕</button>
              )}
            </div>
          </div>

          {/* Active date badge */}
          {(dateFrom || dateTo) && (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 border-b text-xs text-blue-700">
              <span>📅 Showing incidents</span>
              {dateFrom && <span>from <b>{new Date(dateFrom).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</b></span>}
              {dateTo   && <span>to <b>{new Date(dateTo).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</b></span>}
              <span className="text-blue-400">— {filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
            </div>
          )}

          {/* Table */}
          <table className="w-full">
            <thead className="bg-[#f8fafc] border-b border-gray-100">
              <tr>
                {["Incident ID","Type","Location","Reported Time","Status","Priority","Assigned Team","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {pageRows.map((inc) => (
                <tr key={inc.id}
                  className={`hover:bg-gray-50 transition cursor-pointer ${selectedTeam === inc.id ? "bg-blue-50" : ""}`}
                  onClick={() => focusIncident(inc)}>
                  <td className="px-4 py-3 text-xs text-blue-600 font-medium">{inc.id}</td>
                  <td className="px-4 py-3 text-xs text-gray-700">
                    <span className="flex items-center gap-1">{TYPE_ICON[inc.type]} {inc.type}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{inc.location}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{fmt(inc.time)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLE[inc.status] || "text-gray-600 bg-gray-50"}`}>{inc.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs"><span className={PRIORITY_STYLE[inc.priority]}>{inc.priority}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-600">{inc.team}</td>
                  <td className="px-4 py-3">
                    <button onClick={(e) => { e.stopPropagation(); focusIncident(inc); }}
                      className="text-xs text-blue-500 hover:text-blue-700 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-50 transition">
                      Locate
                    </button>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-sm text-gray-400">No incidents match the current filters.</td></tr>
              )}
            </tbody>
          </table>

          {/* Pagination footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} incidents
            </p>
            <div className="flex items-center gap-1">{renderPages()}</div>
          </div>
        </div>

        {/* ── Incident Locations Map ── */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Incident Locations</h3>
              <p className="text-xs text-gray-400 mt-0.5">All filtered incidents shown · Click a row to locate</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
              {Object.entries(TYPE_COLOR).map(([type, color]) => (
                <span key={type} className="flex items-center gap-1">
                  <span style={{ background: color, width: 10, height: 10, borderRadius: "50%", display: "inline-block" }} />
                  {type}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 border-b bg-gray-50 text-xs">
            <span className="text-gray-400">Map shows:</span>
            {filtered.length === INCIDENTS.length ? (
              <span className="bg-[#1a3a6b] text-white px-3 py-0.5 rounded-full">All {INCIDENTS.length} Incidents</span>
            ) : (
              <>
                <span className="bg-blue-100 text-blue-700 font-medium px-3 py-0.5 rounded-full">
                  {filtered.length} filtered incident{filtered.length !== 1 ? "s" : ""}
                </span>
                <button onClick={() => { setSearch(""); setStatusFilter("All Status"); setTypeFilter("All Types"); setDateFrom(""); setDateTo(""); }}
                  className="text-gray-400 hover:text-gray-600">✕ Clear all filters</button>
              </>
            )}
            {selectedTeam && (
              <span className="ml-auto flex items-center gap-1 text-blue-600">
                📍 Focused: <b>{INCIDENTS.find(i => i.id === selectedTeam)?.location}</b>
                <button onClick={() => { setSelectedTeam(null); leafletMap.current?.setView([28.0, 83.5], 7); }}
                  className="ml-1 text-gray-400 hover:text-gray-600">✕</button>
              </span>
            )}
          </div>

          <div ref={mapRef} style={{ height: 420 }} />
        </div>

      </div>
    </div>
  );
}
