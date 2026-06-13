import React, { useState } from 'react';

const OPS = [
  { id: 'OP-2025-0523-01', type: 'Flood Rescue', location: 'Butwal-11, Rupandehi', team: 'Butwal Unit 3', status: 'In Progress', start: '10:23 AM' },
  { id: 'OP-2025-0523-02', type: 'Landslide Response', location: 'Palpa, Tanahun', team: 'Palpa Unit 1', status: 'On The Way', start: '09:45 AM' },
  { id: 'OP-2025-0523-03', type: 'Accident Rescue', location: 'Siddharth Hwy, Bhairawa', team: 'Bhairawa Unit 2', status: 'Rescue Started', start: '09:15 AM' },
  { id: 'OP-2025-0523-04', type: 'Flood Rescue', location: 'Kapilvastu-7', team: 'Kapilvastu Unit 1', status: 'In Progress', start: '09:00 AM' },
  { id: 'OP-2025-0523-05', type: 'Fire Response', location: 'Biratnagar, Morang', team: 'Biratnagar Unit 1', status: 'Assigned', start: '09:50 AM' },
  { id: 'OP-2025-0523-06', type: 'Road Block', location: 'Tansen, Palpa', team: 'Palpa Unit 2', status: 'On The Way', start: '07:10 AM' },
  { id: 'OP-2025-0523-07', type: 'Crowd Management', location: 'Tinkune, Kathmandu', team: 'Kathmandu Unit 5', status: 'Monitoring', start: '06:40 AM' },
  { id: 'OP-2025-0523-08', type: 'Flood Rescue', location: 'Devdaha, Rupandehi', team: 'Butwal Unit 3', status: 'Completed', start: '06:20 AM' },
];

const STATUS_STYLE = {
  'In Progress': 'text-blue-600 bg-blue-50',
  'On The Way': 'text-orange-500 bg-orange-50',
  'Rescue Started': 'text-green-600 bg-green-50',
  'Assigned': 'text-purple-600 bg-purple-50',
  'Monitoring': 'text-sky-600 bg-sky-50',
  'Completed': 'text-green-700 bg-green-100',
};

export default function Operations() {
  const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [typeFilter, setTypeFilter] = useState("All Types");
  
    const filtered = OPS.filter(
      (i) =>
        (search === "" ||
          i.id.toLowerCase().includes(search.toLowerCase()) ||
          i.location.toLowerCase().includes(search.toLowerCase())) &&
        (typeFilter === "All Types" || i.type === typeFilter) &&
        (statusFilter === "All Status" || i.status === statusFilter),
    );
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 space-y-4 bg-[#f0f4f8]">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Total Operations', value: 28, sub: 'All time', color: 'text-gray-800' },
            { label: 'In Progress', value: 8, sub: 'Currently active', color: 'text-blue-600' },
            { label: 'On The Way', value: 6, sub: 'En route', color: 'text-orange-500' },
            { label: 'Assigned', value: 10, sub: 'Waiting to start', color: 'text-green-600' },
            { label: 'Completed Today', value: 4, sub: 'Finished today', color: 'text-teal-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-card overflow-hidden">

           {/* Toolbar */}
          <div className="flex gap-3 p-4 border-b">
            <div className="relative max-w-xs">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search incidents..."
                className="w-full pl-2 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none"
            >
              {[
                "All Types",
                "Flood Rescue",
                "Landslide Response",
                "Accident Rescue",
                "Crowd Management",
                "Fire Response",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none"
            >
              {[
                "All Status",
                "In Progress",
                "On The Way",
                "Rescue Started",
                "Monitoring",
                "Assigned",
                "Rescue Completed",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <div className="flex items-center gap-2 ml-[100px]">
              <div className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-2">
                <input type="date" name="" id="" />
              </div>
              <span> - </span>
              <div className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-2">
                <input type="date" name="" id="" />
              </div>
            </div>
          </div>

          <table className="w-full">
            <thead className="bg-[#f8fafc] border-b border-gray-100">
              <tr>
                {['Operation ID','Type','Location','Assigned Team','Status','Start Time','Actions'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(op=>(
                <tr key={op.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-xs text-blue-600 font-medium">{op.id}</td>
                  <td className="px-4 py-3 text-xs text-gray-700">{op.type}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{op.location}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{op.team}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLE[op.status]}`}>{op.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{op.start}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-gray-400 hover:text-gray-600 text-sm">⋯</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-xs text-gray-500">Showing 1 to 8 of 28 operations</p>
            <div className="flex gap-1">
              {['‹','1','2','3','4','›'].map(p=>(
                <button key={p} className={`px-2.5 py-1 text-xs rounded ${p==='1'?'bg-[#1a3a6b] text-white':'text-gray-500 hover:bg-gray-100'}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
