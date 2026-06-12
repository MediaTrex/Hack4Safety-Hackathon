import React, { useState } from 'react';

const INCIDENTS = [
  { id: 'INC-2025-0523-24', type: 'Flood', location: 'Butwal, Rupandehi', time: '10:21 AM, May 23', status: 'In Progress', priority: 'High', team: 'Team Alpha' },
  { id: 'INC-2025-0523-23', type: 'Landslide', location: 'Palpa, Tanahun', time: '09:41 AM, May 23', status: 'On The Way', priority: 'Medium', team: 'Team Bravo' },
  { id: 'INC-2025-0523-22', type: 'Accident', location: 'Siddharth Hwy, Bhairawa', time: '09:15 AM, May 23', status: 'Rescue Started', priority: 'High', team: 'Team Charlie' },
  { id: 'INC-2025-0523-21', type: 'Crowd', location: 'Tinkune, Kathmandu', time: '09:20 AM, May 23', status: 'Monitoring', priority: 'Low', team: '-' },
  { id: 'INC-2025-0523-20', type: 'Fire', location: 'Biratnagar, Morang', time: '07:50 AM, May 23', status: 'Assigned', priority: 'Medium', team: 'Team Delta' },
  { id: 'INC-2025-0523-19', type: 'Flood', location: 'Devdaha, Rupandehi', time: '07:20 AM, May 23', status: 'In Progress', priority: 'High', team: 'Team Alpha' },
  { id: 'INC-2025-0523-18', type: 'Landslide', location: 'Arghakhanchi', time: '06:40 AM, May 23', status: 'On The Way', priority: 'Medium', team: 'Team Bravo' },
  { id: 'INC-2025-0523-17', type: 'Accident', location: 'Pokhara, Kaski', time: '06:10 AM, May 23', status: 'Rescue Completed', priority: 'Low', team: 'Team Charlie' },
];

const STATUS_STYLE = {
  'In Progress': 'text-blue-600 bg-blue-50',
  'On The Way': 'text-orange-600 bg-orange-50',
  'Rescue Started': 'text-green-600 bg-green-50',
  'Monitoring': 'text-sky-600 bg-sky-50',
  'Assigned': 'text-purple-600 bg-purple-50',
  'Rescue Completed': 'text-green-700 bg-green-100',
};
const PRIORITY_STYLE = {
  'High': 'text-red-600 font-bold',
  'Medium': 'text-orange-500 font-bold',
  'Low': 'text-green-600 font-bold',
};

export default function Incidents() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filtered = INCIDENTS.filter(i =>
    (search === '' || i.id.toLowerCase().includes(search.toLowerCase()) || i.location.toLowerCase().includes(search.toLowerCase())) &&
    (typeFilter === 'All Types' || i.type === typeFilter) &&
    (statusFilter === 'All Status' || i.status === statusFilter)
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 bg-[#f0f4f8]">
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 p-4 border-b">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search incidents..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
            <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none">
              {['All Types','Flood','Landslide','Accident','Crowd','Fire'].map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none">
              {['All Status','In Progress','On The Way','Rescue Started','Monitoring','Assigned','Rescue Completed'].map(t => <option key={t}>{t}</option>)}
            </select>
            <div className="ml-auto flex items-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-2">
              📅 May 16, 2025 – May 23, 2025
            </div>
          </div>

          {/* Table */}
          <table className="w-full">
            <thead className="bg-[#f8fafc] border-b border-gray-100">
              <tr>
                {['ID','Type','Location','Reported Time','Status','Priority','Assigned Team','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(inc => (
                <tr key={inc.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-xs text-blue-600 font-medium">{inc.id}</td>
                  <td className="px-4 py-3 text-xs text-gray-700">{inc.type}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{inc.location}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{inc.time}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLE[inc.status] || 'text-gray-600 bg-gray-50'}`}>{inc.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs"><span className={PRIORITY_STYLE[inc.priority]}>{inc.priority}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-600">{inc.team}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-blue-500 text-base" title="View"></button>
                      <button className="text-gray-400 hover:text-gray-600 text-base" title="More">⋯</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-xs text-gray-500">Showing 1 to {filtered.length} of 24 incidents</p>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded">‹</button>
              {[1,2,3].map(p => (
                <button key={p} className={`px-3 py-1 text-xs rounded ${p===1?'bg-[#1a3a6b] text-white':'text-gray-500 hover:bg-gray-100'}`}>{p}</button>
              ))}
              <button className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded">›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
