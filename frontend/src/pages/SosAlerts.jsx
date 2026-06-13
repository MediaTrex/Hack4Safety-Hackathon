import React, { useState, useEffect, useRef } from "react";

const SOS_DATA = [
  // Page 1 — May 23
  { id: "SOS-2025-0523-18", location: "Butwal, Rupandehi",         type: "Flood",     time: "2025-05-23T10:20", status: "Assigned",    priority: "High",   team: "Team Alpha",   lat: 27.6745, lng: 83.4753 },
  { id: "SOS-2025-0523-17", location: "Siddharth Hwy, Bhairawa",  type: "Accident",  time: "2025-05-23T10:06", status: "Not-Assign",  priority: "High",   team: "-",            lat: 27.6588, lng: 83.4561 },
  { id: "SOS-2025-0523-16", location: "Palpa, Tanahun",            type: "Landslide", time: "2025-05-23T09:52", status: "Assigned",    priority: "Medium", team: "Team Bravo",   lat: 27.9674, lng: 82.8309 },
  { id: "SOS-2025-0523-15", location: "Kapilvastu-7",              type: "Flood",     time: "2025-05-23T09:19", status: "In Progress", priority: "High",   team: "Team Delta",   lat: 27.5500, lng: 83.0500 },
  { id: "SOS-2025-0523-14", location: "Tansen, Palpa",             type: "Flood",     time: "2025-05-23T08:40", status: "Not-Assign",  priority: "Medium", team: "-",            lat: 27.8660, lng: 83.5490 },
  { id: "SOS-2025-0523-13", location: "Arghakhanchi",              type: "Landslide", time: "2025-05-23T07:50", status: "Assigned",    priority: "Medium", team: "Team Bravo",   lat: 27.9400, lng: 83.1500 },
  { id: "SOS-2025-0523-12", location: "Biratnagar, Morang",        type: "Fire",      time: "2025-05-23T06:45", status: "Responding",  priority: "High",   team: "Team Delta",   lat: 26.4525, lng: 87.2718 },
  { id: "SOS-2025-0523-11", location: "Birtamode-5, Jhapa",        type: "Flood",     time: "2025-05-23T06:20", status: "Assigned",    priority: "Medium", team: "Team Alpha",   lat: 26.6445, lng: 87.9906 },
  // Page 2 — May 22
  { id: "SOS-2025-0522-10", location: "Nepalgunj, Banke",          type: "Flood",     time: "2025-05-22T21:10", status: "In Progress", priority: "High",   team: "Team Echo",    lat: 28.0500, lng: 81.6167 },
  { id: "SOS-2025-0522-09", location: "Dhangadhi, Kailali",        type: "Accident",  time: "2025-05-22T19:30", status: "Not-Assign",  priority: "High",   team: "-",            lat: 28.9985, lng: 80.2767 },
  { id: "SOS-2025-0522-08", location: "Surkhet, Birendranagar",    type: "Fire",      time: "2025-05-22T17:45", status: "Responding",  priority: "High",   team: "Team Foxtrot", lat: 28.6835, lng: 81.6227 },
  { id: "SOS-2025-0522-07", location: "Jumla, Karnali",            type: "Landslide", time: "2025-05-22T15:20", status: "Assigned",    priority: "Medium", team: "Team Bravo",   lat: 29.2747, lng: 82.1838 },
  { id: "SOS-2025-0522-06", location: "Chitwan, Bharatpur",        type: "Flood",     time: "2025-05-22T13:00", status: "In Progress", priority: "High",   team: "Team Delta",   lat: 27.5291, lng: 84.3542 },
  { id: "SOS-2025-0522-05", location: "Dharan, Sunsari",           type: "Fire",      time: "2025-05-22T11:10", status: "Not-Assign",  priority: "Medium", team: "-",            lat: 27.3314, lng: 87.6743 },
  { id: "SOS-2025-0522-04", location: "Birgunj, Parsa",            type: "Accident",  time: "2025-05-22T09:30", status: "Assigned",    priority: "Low",    team: "Team Alpha",   lat: 27.0104, lng: 84.8770 },
  { id: "SOS-2025-0522-03", location: "Itahari, Sunsari",          type: "Crowd",     time: "2025-05-22T07:50", status: "Pending",     priority: "Low",    team: "-",            lat: 26.8120, lng: 87.2833 },
  // Page 3 — May 21
  { id: "SOS-2025-0521-02", location: "Mustang, Jomsom",           type: "Landslide", time: "2025-05-21T20:15", status: "Assigned",    priority: "High",   team: "Team Bravo",   lat: 28.6956, lng: 83.4861 },
  { id: "SOS-2025-0521-01", location: "Hetauda, Makwanpur",        type: "Flood",     time: "2025-05-21T18:00", status: "Responding",  priority: "Medium", team: "Team Charlie", lat: 27.4295, lng: 85.0322 },
];

const PAGE_SIZE = 8;

const TYPE_ICON  = { Flood: "", Landslide: "", Accident: "", Crowd: "", Fire: "" };
const TYPE_COLOR = { Flood: "#3b82f6", Landslide: "#f59e0b", Accident: "#8b5cf6", Crowd: "#a855f7", Fire: "#f97316" };

const STATUS_STYLE = {
  "Not-Assign":  "text-red-600 bg-red-50",
  Assigned:      "text-purple-600 bg-purple-50",
  "On The Way":  "text-orange-600 bg-orange-50",
  "In Progress": "text-blue-600 bg-blue-50",
  Pending:       "text-gray-600 bg-gray-50",
  Responding:    "text-green-600 bg-green-50",
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

export default function SosAlerts() {
  const [search, setSearch]             = useState("");
  const [typeFilter, setTypeFilter]     = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFrom, setDateFrom]         = useState("");
  const [dateTo, setDateTo]             = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const [selectedId, setSelectedId]     = useState(null);

  const mapRef     = useRef(null);
  const leafletMap = useRef(null);
  const markerRefs = useRef({});

  // ── Filter ─────────────────────────────────────────────────
  const filtered = SOS_DATA.filter((i) => {
    const matchSearch  = search === "" || i.id.toLowerCase().includes(search.toLowerCase()) || i.location.toLowerCase().includes(search.toLowerCase());
    const matchType    = typeFilter   === "All Types"  || i.type   === typeFilter;
    const matchStatus  = statusFilter === "All Status" || i.status === statusFilter;
    const incDate      = new Date(i.time);
    const matchFrom    = dateFrom === "" || incDate >= new Date(dateFrom);
    const matchTo      = dateTo   === "" || incDate <= new Date(dateTo + "T23:59:59");
    return matchSearch && matchType && matchStatus && matchFrom && matchTo;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);
  const pageRows   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [search, typeFilter, statusFilter, dateFrom, dateTo]);

  // ── Leaflet init ───────────────────────────────────────────
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || leafletMap.current) return;
      const L = window.L;
      if (!L) return;

      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false }).setView([28.0, 83.5], 7);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(map);
      leafletMap.current = map;

      SOS_DATA.forEach((s) => {
        const color = TYPE_COLOR[s.type] || "#ef4444";
        const icon  = L.divIcon({
          className: "",
          html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 0 10px 4px ${color}66,0 0 20px 8px ${color}33;display:flex;align-items:center;justify-content:center;font-size:13px;line-height:1;">🆘</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const marker = L.marker([s.lat, s.lng], { icon }).addTo(map);
        const pColor = s.priority === "High" ? "#ef4444" : s.priority === "Medium" ? "#f97316" : "#22c55e";
        marker.bindPopup(`
          <div style="font-family:sans-serif;min-width:170px">
            <div style="font-size:12px;font-weight:700;margin-bottom:4px">🆘 ${s.id}</div>
            <div style="font-size:11px;color:#555;margin-bottom:2px">📍 ${s.location}</div>
            <div style="font-size:11px;color:#555;margin-bottom:2px">${TYPE_ICON[s.type] || ""} ${s.type} &nbsp;·&nbsp; 🕐 ${fmt(s.time)}</div>
            <div style="font-size:11px;color:#555;margin-bottom:4px">👥 ${s.team}</div>
            <span style="font-size:10px;background:${color}22;color:${color};padding:2px 8px;border-radius:99px;font-weight:600">${s.status}</span>
            <span style="font-size:10px;color:${pColor};font-weight:700;margin-left:6px">${s.priority}</span>
          </div>
        `);
        markerRefs.current[s.id] = { marker, id: s.id };
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
      if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; markerRefs.current = {}; }
    };
  }, []);

  // Sync marker visibility
  useEffect(() => {
    if (!leafletMap.current) return;
    const visibleIds = new Set(filtered.map((i) => i.id));
    Object.values(markerRefs.current).forEach(({ marker, id }) => {
      if (visibleIds.has(id)) { if (!leafletMap.current.hasLayer(marker)) marker.addTo(leafletMap.current); }
      else                    { if (leafletMap.current.hasLayer(marker))  leafletMap.current.removeLayer(marker); }
    });
  }, [filtered]);

  const focusSos = (s) => {
    setSelectedId(s.id);
    if (!leafletMap.current) return;
    leafletMap.current.flyTo([s.lat, s.lng], 12, { duration: 0.8 });
    const ref = markerRefs.current[s.id];
    if (ref) setTimeout(() => ref.marker.openPopup(), 850);
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Pagination ─────────────────────────────────────────────
  const renderPages = () => {
    const btns = [];
    btns.push(
      <button key="prev" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
        className="px-2.5 py-1 text-xs rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30">‹</button>
    );
    let nums = [];
    if (totalPages <= 5) nums = Array.from({ length: totalPages }, (_, i) => i + 1);
    else if (safePage <= 3) nums = [1, 2, 3, 4, "…", totalPages];
    else if (safePage >= totalPages - 2) nums = [1, "…", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    else nums = [1, "…", safePage - 1, safePage, safePage + 1, "…", totalPages];

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
              placeholder="Search SOS alerts..."
              className="pl-3 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 max-w-xs"
            />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none">
              {["All Types","Flood","Landslide","Accident","Crowd","Fire"].map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none">
              {["All Status","Not-Assign","Assigned","On The Way","In Progress","Pending","Responding"].map(t => <option key={t}>{t}</option>)}
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
            <div className="flex items-center gap-2 px-4 py-1.5 bg-red-50 border-b text-xs text-red-700">
              <span>📅 Showing SOS alerts</span>
              {dateFrom && <span>from <b>{new Date(dateFrom).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</b></span>}
              {dateTo   && <span>to <b>{new Date(dateTo).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</b></span>}
              <span className="text-red-400">— {filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
            </div>
          )}

          {/* Table */}
          <table className="w-full">
            <thead className="bg-[#f8fafc] border-b border-gray-100">
              <tr>
                {["Alert ID","Location","Type","Reported Time","Status","Priority","Assigned Team","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {pageRows.map((s) => (
                <tr key={s.id}
                  className={`hover:bg-gray-50 transition cursor-pointer ${selectedId === s.id ? "bg-red-50" : ""}`}
                  onClick={() => focusSos(s)}>
                  <td className="px-4 py-3 text-xs text-red-600 font-medium">{s.id}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{s.location}</td>
                  <td className="px-4 py-3 text-xs text-gray-700">
                    <span className="flex items-center gap-1">{TYPE_ICON[s.type]} {s.type}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{fmt(s.time)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLE[s.status] || "text-gray-600 bg-gray-50"}`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs"><span className={PRIORITY_STYLE[s.priority]}>{s.priority}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-600">{s.team}</td>
                  <td className="px-4 py-3">
                    <button onClick={(e) => { e.stopPropagation(); focusSos(s); }}
                      className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-0.5 rounded hover:bg-red-50 transition">
                      Locate
                    </button>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-sm text-gray-400">No SOS alerts match the current filters.</td></tr>
              )}
            </tbody>
          </table>

          {/* Pagination footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} SOS alerts
            </p>
            <div className="flex items-center gap-1">{renderPages()}</div>
          </div>
        </div>

        {/* ── SOS Locations Map ── */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">SOS Alert Locations</h3>
              <p className="text-xs text-gray-400 mt-0.5">All filtered alerts shown · Click a row to locate</p>
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
            {filtered.length === SOS_DATA.length ? (
              <span className="bg-[#1a3a6b] text-white px-3 py-0.5 rounded-full">All {SOS_DATA.length} Alerts</span>
            ) : (
              <>
                <span className="bg-red-100 text-red-700 font-medium px-3 py-0.5 rounded-full">
                  {filtered.length} filtered alert{filtered.length !== 1 ? "s" : ""}
                </span>
                <button onClick={() => { setSearch(""); setStatusFilter("All Status"); setTypeFilter("All Types"); setDateFrom(""); setDateTo(""); }}
                  className="text-gray-400 hover:text-gray-600">✕ Clear all filters</button>
              </>
            )}
            {selectedId && (
              <span className="ml-auto flex items-center gap-1 text-red-600">
                📍 Focused: <b>{SOS_DATA.find(i => i.id === selectedId)?.location}</b>
                <button onClick={() => { setSelectedId(null); leafletMap.current?.setView([28.0, 83.5], 7); }}
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
