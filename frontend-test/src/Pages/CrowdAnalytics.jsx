import React from 'react';

const LOCATIONS = [
  { name: 'Tinkune, Kathmandu', density: '85% (High)', trend: '↑ Increasing', risk: 'High', update: '10:31 AM', trendColor: 'text-red-500', densityColor: 'text-red-600', riskColor: 'text-red-600 bg-red-50' },
  { name: 'New Road, Kathmandu', density: '72% (High)', trend: '↑ Increasing', risk: 'High', update: '10:19 AM', trendColor: 'text-red-500', densityColor: 'text-red-600', riskColor: 'text-red-600 bg-red-50' },
  { name: 'Indra Chowk, Kathmandu', density: '46% (Medium)', trend: '↔ Stable', risk: 'Medium', update: '10:15 AM', trendColor: 'text-gray-500', densityColor: 'text-orange-500', riskColor: 'text-orange-500 bg-orange-50' },
  { name: 'Babarmahal, Kathmandu', density: '36% (Medium)', trend: '↔ Stable', risk: 'Medium', update: '10:12 AM', trendColor: 'text-gray-500', densityColor: 'text-orange-500', riskColor: 'text-orange-500 bg-orange-50' },
  { name: 'Lakeside, Pokhara', density: '29% (Low)', trend: '↓ Decreasing', risk: 'Low', update: '10:10 AM', trendColor: 'text-green-500', densityColor: 'text-green-600', riskColor: 'text-green-600 bg-green-50' },
  { name: 'Butwal Bus Park', density: '22% (Low)', trend: '↓ Decreasing', risk: 'Low', update: '10:08 AM', trendColor: 'text-green-500', densityColor: 'text-green-600', riskColor: 'text-green-600 bg-green-50' },
  { name: 'Birtamode, Jhapa', density: '18% (Low)', trend: '↓ Decreasing', risk: 'Low', update: '10:05 AM', trendColor: 'text-green-500', densityColor: 'text-green-600', riskColor: 'text-green-600 bg-green-50' },
  { name: 'Dharan Clock Tower', density: '65% (High)', trend: '↑ Increasing', risk: 'High', update: '10:03 AM', trendColor: 'text-red-500', densityColor: 'text-red-600', riskColor: 'text-red-600 bg-red-50' },
];

export default function CrowdAnalytics() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 space-y-4 bg-[#f0f4f8]">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Total Locations', value: 12, sub: 'Monitored areas', color: 'text-gray-800' },
            { label: 'High Density', value: 4, sub: 'Locations', color: 'text-red-600' },
            { label: 'Medium Density', value: 5, sub: 'Locations', color: 'text-orange-500' },
            { label: 'Low Density', value: 3, sub: 'Locations', color: 'text-green-600' },
            { label: 'Average Density', value: '42%', sub: 'Overall', color: 'text-blue-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-sm text-gray-800">Crowd Density by Location</h3>
          </div>
          <table className="w-full">
            <thead className="bg-[#f8fafc] border-b border-gray-100">
              <tr>
                {['Location','Current Density','Trend','Risk Level','Last Update','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {LOCATIONS.map(l => (
                <tr key={l.name} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-medium text-gray-800">{l.name}</td>
                  <td className={`px-4 py-3 text-xs font-semibold ${l.densityColor}`}>{l.density}</td>
                  <td className={`px-4 py-3 text-xs font-medium ${l.trendColor}`}>{l.trend}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${l.riskColor}`}>{l.risk}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{l.update}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-gray-400 hover:text-blue-500 text-sm">📊</button>
                      <button className="text-gray-400 hover:text-gray-600 text-sm">⋯</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Integration Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-blue-700 mb-1">🔗 Backend Integration Ready</p>
          <p className="text-[11px] text-blue-600">Connect your crowd analytics engine to <code className="bg-blue-100 px-1 rounded">GET /api/crowd-analytics</code> to stream real-time density data to this view.</p>
        </div>
      </div>
    </div>
  );
}
