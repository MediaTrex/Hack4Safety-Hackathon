import React, { useEffect, useRef, useState } from 'react';

const TEAMS = [
  // Page 1 (1–8)
  { id: 'RT-2201', name: 'Butwal Rescue Unit 3',       location: 'Butwal, Rupandehi',      status: 'On Mission',  mission: 'Flood Rescue',        members: 5, lastUpdate: '10:24 AM', lat: 27.6745, lng: 83.4753 },
  { id: 'RT-3204', name: 'Bhairawa Rescue Unit 2',     location: 'Bhairawa, Rupandehi',    status: 'On The Way',  mission: 'Accident Rescue',     members: 4, lastUpdate: '10:20 AM', lat: 27.6588, lng: 83.4561 },
  { id: 'RT-5401', name: 'Palpa Rescue Unit 1',        location: 'Palpa, Tanahun',         status: 'On Mission',  mission: 'Landslide Response',  members: 5, lastUpdate: '10:18 AM', lat: 27.9674, lng: 82.8309 },
  { id: 'RT-1244', name: 'Kathmandu Rescue Unit 5',    location: 'Kathmandu',              status: 'Available',   mission: '-',                   members: 6, lastUpdate: '10:15 AM', lat: 27.7172, lng: 85.3240 },
  { id: 'RT-1005', name: 'Pokhara Rescue Unit 2',      location: 'Pokhara, Kaski',         status: 'Standby',     mission: '-',                   members: 4, lastUpdate: '10:10 AM', lat: 28.2096, lng: 83.9856 },
  { id: 'RT-0026', name: 'Biratnagar Rescue Unit 1',   location: 'Biratnagar, Morang',     status: 'On Mission',  mission: 'Fire Response',       members: 5, lastUpdate: '10:08 AM', lat: 26.4525, lng: 87.2718 },
  { id: 'RT-0107', name: 'Nepalgunj Rescue Unit 1',    location: 'Nepalgunj, Banke',       status: 'On The Way',  mission: 'Flood Rescue',        members: 5, lastUpdate: '10:05 AM', lat: 28.0500, lng: 81.6167 },
  { id: 'RT-1208', name: 'Dhangadhi Rescue Unit 1',    location: 'Dhangadhi, Kailali',     status: 'Available',   mission: '-',                   members: 4, lastUpdate: '10:02 AM', lat: 28.9985, lng: 80.2767 },
  // Page 2 (9–16)
  { id: 'RT-4402', name: 'Hetauda Rescue Unit 2',      location: 'Hetauda, Makwanpur',     status: 'On Mission',  mission: 'Flood Rescue',        members: 5, lastUpdate: '09:58 AM', lat: 27.4295, lng: 85.0322 },
  { id: 'RT-6601', name: 'Dang Rescue Unit 1',         location: 'Tulsipur, Dang',         status: 'On The Way',  mission: 'Landslide Rescue',    members: 4, lastUpdate: '09:54 AM', lat: 28.1784, lng: 82.1752 },
  { id: 'RT-7703', name: 'Jhapa Rescue Unit 3',        location: 'Birtamod, Jhapa',        status: 'Available',   mission: '-',                   members: 6, lastUpdate: '09:50 AM', lat: 26.6445, lng: 87.9906 },
  { id: 'RT-8801', name: 'Surkhet Rescue Unit 1',      location: 'Birendranagar, Surkhet', status: 'On Mission',  mission: 'Fire Response',       members: 5, lastUpdate: '09:46 AM', lat: 28.6835, lng: 81.6227 },
  { id: 'RT-9901', name: 'Mustang Rescue Unit 1',      location: 'Jomsom, Mustang',        status: 'Standby',     mission: '-',                   members: 3, lastUpdate: '09:42 AM', lat: 28.6956, lng: 83.4861 },
  { id: 'RT-1101', name: 'Jumla Rescue Unit 1',        location: 'Jumla, Karnali',         status: 'On Mission',  mission: 'Landslide Response',  members: 4, lastUpdate: '09:38 AM', lat: 29.2747, lng: 82.1838 },
  { id: 'RT-1302', name: 'Chitwan Rescue Unit 2',      location: 'Bharatpur, Chitwan',     status: 'On The Way',  mission: 'Flood Rescue',        members: 5, lastUpdate: '09:34 AM', lat: 27.5291, lng: 84.3542 },
  { id: 'RT-2203', name: 'Kavre Rescue Unit 3',        location: 'Banepa, Kavre',          status: 'Available',   mission: '-',                   members: 4, lastUpdate: '09:30 AM', lat: 27.6306, lng: 85.5211 },
  // Page 3 (17–24)
  { id: 'RT-3305', name: 'Bara Rescue Unit 5',         location: 'Kalaiya, Bara',          status: 'On Mission',  mission: 'Accident Rescue',     members: 5, lastUpdate: '09:26 AM', lat: 27.1878, lng: 84.9870 },
  { id: 'RT-4406', name: 'Birgunj Rescue Unit 6',      location: 'Birgunj, Parsa',         status: 'On The Way',  mission: 'Fire Response',       members: 4, lastUpdate: '09:22 AM', lat: 27.0104, lng: 84.8770 },
  { id: 'RT-5502', name: 'Itahari Rescue Unit 2',      location: 'Itahari, Sunsari',       status: 'Available',   mission: '-',                   members: 6, lastUpdate: '09:18 AM', lat: 26.8120, lng: 87.2833 },
  { id: 'RT-6604', name: 'Dharan Rescue Unit 4',       location: 'Dharan, Sunsari',        status: 'On Mission',  mission: 'Crowd Rescue',        members: 5, lastUpdate: '09:14 AM', lat: 27.3314, lng: 87.6743 },
  { id: 'RT-7705', name: 'Dadeldhura Rescue Unit 5',   location: 'Dadeldhura',             status: 'Standby',     mission: '-',                   members: 3, lastUpdate: '09:10 AM', lat: 29.8412, lng: 80.5385 },
  { id: 'RT-8806', name: 'Kailali Rescue Unit 6',      location: 'Dhangadhi, Kailali',     status: 'On Mission',  mission: 'Flood Rescue',        members: 5, lastUpdate: '09:06 AM', lat: 28.7000, lng: 80.6000 },
  { id: 'RT-9902', name: 'Lamjung Rescue Unit 2',      location: 'Besisahar, Lamjung',     status: 'On The Way',  mission: 'Landslide Rescue',    members: 4, lastUpdate: '09:02 AM', lat: 28.3949, lng: 84.1240 },
  { id: 'RT-1103', name: 'Rupandehi Rescue Unit 3',    location: 'Siddharthanagar, Rupandehi', status: 'Available', mission: '-',                members: 6, lastUpdate: '08:58 AM', lat: 27.5034, lng: 83.4540 },
  // Page 4 (25–32)
  { id: 'RT-2207', name: 'Banke Rescue Unit 7',        location: 'Kohalpur, Banke',        status: 'On Mission',  mission: 'Flood Rescue',        members: 5, lastUpdate: '08:54 AM', lat: 28.0500, lng: 81.6167 },
  { id: 'RT-3308', name: 'Makwanpur Rescue Unit 8',    location: 'Hetauda, Makwanpur',     status: 'On The Way',  mission: 'Accident Rescue',     members: 4, lastUpdate: '08:50 AM', lat: 27.4100, lng: 85.0300 },
  { id: 'RT-4409', name: 'Morang Rescue Unit 9',       location: 'Biratnagar, Morang',     status: 'Available',   mission: '-',                   members: 6, lastUpdate: '08:46 AM', lat: 26.4700, lng: 87.2900 },
  { id: 'RT-5503', name: 'Sindhupalchok Rescue Unit 3',location: 'Chautara, Sindhupalchok',status: 'On Mission',  mission: 'Landslide Response',  members: 5, lastUpdate: '08:42 AM', lat: 27.8606, lng: 85.6896 },
  { id: 'RT-6607', name: 'Solukhumbu Rescue Unit 7',   location: 'Salleri, Solukhumbu',    status: 'Standby',     mission: '-',                   members: 3, lastUpdate: '08:38 AM', lat: 27.5053, lng: 86.6210 },
  { id: 'RT-7708', name: 'Taplejung Rescue Unit 8',    location: 'Taplejung',              status: 'On Mission',  mission: 'Fire Response',       members: 4, lastUpdate: '08:34 AM', lat: 27.3543, lng: 87.6698 },
  { id: 'RT-8809', name: 'Humla Rescue Unit 9',        location: 'Simikot, Humla',         status: 'On The Way',  mission: 'Crowd Rescue',        members: 4, lastUpdate: '08:30 AM', lat: 29.9740, lng: 81.8190 },
  { id: 'RT-9910', name: 'Dolpa Rescue Unit 10',       location: 'Dunai, Dolpa',           status: 'Available',   mission: '-',                   members: 5, lastUpdate: '08:26 AM', lat: 28.9940, lng: 82.8990 },
];

const PAGE_SIZE = 8;

const STATUS_STYLE = {
  'On Mission': 'text-green-600 bg-green-50 font-semibold',
  'On The Way': 'text-orange-500 bg-orange-50',
  'Available':  'text-blue-600 bg-blue-50',
  'Standby':    'text-gray-500 bg-gray-100',
};

const STATUS_COLOR = {
  'On Mission': '#22c55e',
  'On The Way': '#f97316',
  'Available':  '#3b82f6',
  'Standby':    '#9ca3af',
};

export default function RescueTeams() {
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter]   = useState('All Types');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const mapRef      = useRef(null);
  const leafletMap  = useRef(null);
  const markerRefs  = useRef({});
  const mapReady    = useRef(false);

  const counts = { total: 32, onMission: 12, onTheWay: 8, available: 9, standby: 3 };

  // All filtered rows (across all pages)
  const filtered = TEAMS.filter(
    (t) =>
      (search === '' ||
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.location.toLowerCase().includes(search.toLowerCase())) &&
      (typeFilter === 'All Types' || t.mission === typeFilter) &&
      (statusFilter === 'All Status' || t.status === statusFilter),
  );

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage    = Math.min(currentPage, totalPages);
  const pageRows    = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset to page 1 on filter change
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, typeFilter]);

  // Init Leaflet map once
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || leafletMap.current) return;
      const L = window.L;
      if (!L) return;

      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false }).setView([28.0, 83.5], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
      leafletMap.current = map;

      TEAMS.forEach((t) => {
        const color = STATUS_COLOR[t.status];
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:26px;height:26px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 0 10px 4px ${color}66,0 0 20px 8px ${color}33;display:flex;align-items:center;justify-content:center;font-size:13px;line-height:1;">🚑</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        const marker = L.marker([t.lat, t.lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:sans-serif;min-width:160px">
            <div style="font-size:12px;font-weight:700;margin-bottom:4px">🚑 ${t.name}</div>
            <div style="font-size:11px;color:#555;margin-bottom:2px">📍 ${t.location}</div>
            <div style="font-size:11px;color:#555;margin-bottom:4px">👥 ${t.members} members</div>
            <span style="font-size:10px;background:${color}22;color:${color};padding:2px 8px;border-radius:99px;font-weight:600">${t.status}</span>
            ${t.mission !== '-' ? `<div style="font-size:10px;color:#777;margin-top:4px">Mission: ${t.mission}</div>` : ''}
          </div>
        `);
        markerRefs.current[t.id] = { marker, teamId: t.id };
      });
      mapReady.current = true;
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
        markerRefs.current = {};
        mapReady.current = false;
      }
    };
  }, []);

  // Sync marker visibility with filtered list (all pages shown on map)
  useEffect(() => {
    if (!leafletMap.current) return;
    const visibleIds = new Set(filtered.map((t) => t.id));
    Object.values(markerRefs.current).forEach(({ marker, teamId }) => {
      if (visibleIds.has(teamId)) {
        if (!leafletMap.current.hasLayer(marker)) marker.addTo(leafletMap.current);
      } else {
        if (leafletMap.current.hasLayer(marker)) leafletMap.current.removeLayer(marker);
      }
    });
  }, [filtered]);

  const focusTeam = (team) => {
    setSelectedTeam(team.id);
    if (!leafletMap.current) return;
    leafletMap.current.flyTo([team.lat, team.lng], 12, { duration: 0.8 });
    const ref = markerRefs.current[team.id];
    if (ref) setTimeout(() => ref.marker.openPopup(), 850);
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Pagination button renderer
  const renderPages = () => {
    const pages = [];
    // always show ‹
    pages.push(
      <button
        key="prev"
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={safePage === 1}
        className="px-2.5 py-1 text-xs rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30"
      >‹</button>
    );

    // page numbers: show up to 4, with ellipsis
    let pageNums = [];
    if (totalPages <= 5) {
      pageNums = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (safePage <= 3) {
      pageNums = [1, 2, 3, 4, '…', totalPages];
    } else if (safePage >= totalPages - 2) {
      pageNums = [1, '…', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      pageNums = [1, '…', safePage - 1, safePage, safePage + 1, '…', totalPages];
    }

    pageNums.forEach((p, i) => {
      if (p === '…') {
        pages.push(<span key={`ellipsis-${i}`} className="px-2 py-1 text-xs text-gray-400">…</span>);
      } else {
        pages.push(
          <button
            key={p}
            onClick={() => setCurrentPage(p)}
            className={`px-2.5 py-1 text-xs rounded ${safePage === p ? 'bg-[#1a3a6b] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >{p}</button>
        );
      }
    });

    pages.push(
      <button
        key="next"
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={safePage === totalPages}
        className="px-2.5 py-1 text-xs rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30"
      >›</button>
    );
    return pages;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 space-y-4 bg-[#f0f4f8]">

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Total Teams',  value: counts.total,     sub: 'Active across field',     color: 'text-gray-800' },
            { label: 'On Mission',   value: counts.onMission, sub: 'Teams currently deployed', color: 'text-green-600' },
            { label: 'On The Way',   value: counts.onTheWay,  sub: 'Teams en route',          color: 'text-orange-500' },
            { label: 'Available',    value: counts.available, sub: 'Teams ready',             color: 'text-blue-600' },
            { label: 'Standby',      value: counts.standby,   sub: 'Teams in standby',        color: 'text-yellow-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="flex gap-3 p-4 border-b flex-wrap">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams..."
              className="pl-3 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 max-w-xs"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none"
            >
              {['All Types','Flood Rescue','Landslide Rescue','Accident Rescue','Crowd Rescue','Fire Response','Landslide Response'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none"
            >
              {['All Status','On Mission','On The Way','Available','Standby'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <table className="w-full">
            <thead className="bg-[#f8fafc] border-b border-gray-100">
              <tr>
                {['Team ID','Team Name','Location','Status','Current Mission','Members','Last Update','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {pageRows.map(t => (
                <tr
                  key={t.id}
                  className={`hover:bg-gray-50 transition cursor-pointer ${selectedTeam === t.id ? 'bg-blue-50' : ''}`}
                  onClick={() => focusTeam(t)}
                >
                  <td className="px-4 py-3 text-xs text-blue-600 font-medium">{t.id}</td>
                  <td className="px-4 py-3 text-xs text-gray-800 font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{t.location}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLE[t.status]}`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{t.mission}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{t.members}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{t.lastUpdate}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); focusTeam(t); }}
                      className="text-xs text-blue-500 hover:text-blue-700 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-50 transition"
                    >
                      Locate
                    </button>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-sm text-gray-400">No teams match the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} teams
            </p>
            <div className="flex items-center gap-1">{renderPages()}</div>
          </div>
        </div>

        {/* Team Locations Map */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Team Locations</h3>
              <p className="text-xs text-gray-400 mt-0.5">All filtered teams shown · Click a row to locate</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {Object.entries(STATUS_COLOR).map(([status, color]) => (
                <span key={status} className="flex items-center gap-1.5">
                  <span style={{ background: color, width: 10, height: 10, borderRadius: '50%', display: 'inline-block' }} />
                  {status}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 border-b bg-gray-50 text-xs">
            <span className="text-gray-400">Map shows:</span>
            {filtered.length === TEAMS.length ? (
              <span className="bg-[#1a3a6b] text-white px-3 py-0.5 rounded-full">All {TEAMS.length} Teams</span>
            ) : (
              <>
                <span className="bg-blue-100 text-blue-700 font-medium px-3 py-0.5 rounded-full">{filtered.length} filtered team{filtered.length !== 1 ? 's' : ''}</span>
                <button
                  onClick={() => { setSearch(''); setStatusFilter('All Status'); setTypeFilter('All Types'); }}
                  className="text-gray-400 hover:text-gray-600"
                >✕ Clear filters</button>
              </>
            )}
            {selectedTeam && (
              <span className="ml-auto flex items-center gap-1 text-blue-600">
                📍 Focused: <b>{TEAMS.find(t => t.id === selectedTeam)?.name}</b>
                <button
                  onClick={() => { setSelectedTeam(null); leafletMap.current?.setView([28.0, 83.5], 7); }}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >✕</button>
              </span>
            )}
          </div>

          <div ref={mapRef} style={{ height: 420 }} />
        </div>

      </div>
    </div>
  );
}
