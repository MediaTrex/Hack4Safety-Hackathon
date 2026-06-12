import React, { useState } from 'react';

const SOS_DATA = [
  { id: 'SOS-2025-0523-18', location: 'Butwal, Rupandehi', type: 'Flood', time: '10:20 AM', status: 'Assigned', priority: 'High', team: 'Team Alpha' },
  { id: 'SOS-2025-0523-17', location: 'Siddharth Hwy, Bhairawa', type: 'Accident', time: '10:06 AM', status: 'On The Way', priority: 'High', team: 'Team Charlie' },
  { id: 'SOS-2025-0523-16', location: 'Palpa, Tanahun', type: 'Landslide', time: '09:52 AM', status: 'Assigned', priority: 'Medium', team: 'Team Bravo' },
  { id: 'SOS-2025-0523-15', location: 'Kapilvastu-7', type: 'Flood', time: '09:19 AM', status: 'In Progress', priority: 'High', team: 'Team Delta' },
  { id: 'SOS-2025-0523-14', location: 'Tansen, Palpa', type: 'Flood', time: '08:40 AM', status: 'Pending', priority: 'Medium', team: '-' },
  { id: 'SOS-2025-0523-13', location: 'Arghakhanchi', type: 'Landslide', time: '07:50 AM', status: 'Assigned', priority: 'Medium', team: 'Team Bravo' },
  { id: 'SOS-2025-0523-12', location: 'Biratnagar, Morang', type: 'Fire', time: '06:45 AM', status: 'Responding', priority: 'High', team: 'Team Delta' },
  { id: 'SOS-2025-0523-11', location: 'Birtamode-5', type: 'Flood', time: '06:20 AM', status: 'Assigned', priority: 'Medium', team: 'Team Alpha' },
];

const STATUS_STYLE = {
  'Assigned': 'text-purple-600 bg-purple-50',
  'On The Way': 'text-orange-600 bg-orange-50',
  'In Progress': 'text-blue-600 bg-blue-50',
  'Pending': 'text-gray-600 bg-gray-50',
  'Responding': 'text-green-600 bg-green-50',
};
const PRIORITY_STYLE = {
  'High': 'text-red-600 font-bold',
  'Medium': 'text-orange-500 font-bold',
  'Low': 'text-green-600 font-bold',
};

export default function SosAlerts() {
  const [search, setSearch] = useState('');

  const filtered = SOS_DATA.filter(s =>
    search === '' || s.id.toLowerCase().includes(search.toLowerCase()) || s.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 bg-[#f0f4f8]">
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search SOS alerts..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none">
              {['All Status','Assigned','On The Way','In Progress','Pending','Responding'].map(t => <option key={t}>{t}</option>)}
            </select>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none">
              {['All Priority','High','Medium','Low'].map(t => <option key={t}>{t}</option>)}
            </select>
            <div className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-2">
              📅 May 16, 2025 – May 23, 2025
            </div>
            <button className="ml-auto flex items-center gap-2 bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700">
              ⬇️ Export
            </button>
          </div>

          <table className="w-full">
            <thead className="bg-[#f8fafc] border-b border-gray-100">
              <tr>
                {['Alert ID','Location','Type','Time','Status','Priority','Assigned Team','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-xs text-red-600 font-medium">{s.id}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{s.location}</td>
                  <td className="px-4 py-3 text-xs text-gray-700">{s.type}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{s.time}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLE[s.status] || 'text-gray-600 bg-gray-50'}`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs"><span className={PRIORITY_STYLE[s.priority]}>{s.priority}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-600">{s.team}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="text-gray-400 hover:text-blue-500 text-sm" title="View"></button>
                      <button className="text-gray-400 hover:text-green-500 text-sm" title="Call"></button>
                      <button className="text-gray-400 hover:text-blue-500 text-sm" title="Message"></button>
                      <button className="text-gray-400 hover:text-gray-600 text-sm" title="More">⋯</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-xs text-gray-500">Showing 1 to 8 of 18 SOS alerts</p>
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
