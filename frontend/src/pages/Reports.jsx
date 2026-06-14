import React from 'react';

const REPORT_CATS = ['Incident Reports','SOS Alerts Report','Rescue Operations Report','Resource Utilization Report','Team Performance Report','AI Prediction Report','Traffic Report','Crowd Report','Custom Report'];

const DAILY = [
  { date: 'May 23, 2025', total: 24, resolved: 18, progress: 4, pending: 2 },
  { date: 'May 22, 2025', total: 28, resolved: 22, progress: 4, pending: 2 },
  { date: 'May 21, 2025', total: 20, resolved: 15, progress: 3, pending: 2 },
  { date: 'May 20, 2025', total: 18, resolved: 14, progress: 2, pending: 2 },
  { date: 'May 19, 2025', total: 16, resolved: 12, progress: 2, pending: 2 },
  { date: 'May 18, 2025', total: 10, resolved: 8, progress: 1, pending: 1 },
  { date: 'May 17, 2025', total: 8, resolved: 5, progress: 2, pending: 1 },
];

export default function Reports() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 bg-[#f0f4f8]">
        <div className="grid grid-cols-4 gap-4">
          {/* Left: Categories */}
          <div className="bg-white rounded-xl shadow-card p-4">
            <h3 className="font-semibold text-sm text-gray-800 mb-3">Report Categories</h3>
            <div className="space-y-1">
              {REPORT_CATS.map((c,i) => (
                <button key={c} className={`w-full text-left px-3 py-2 text-xs rounded-lg transition ${i===0?'bg-blue-50 text-blue-600 font-medium':'text-gray-600 hover:bg-gray-50'}`}>{c}</button>
              ))}
            </div>
          </div>

          {/* Right: Report Content */}
          <div className="col-span-3 space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Total Incidents', value: 124, sub: '↑ 12% from last week', color: 'text-gray-800' },
                { label: 'Resolved', value: '98', sub: '79%', color: 'text-green-600' },
                { label: 'In Progress', value: 18, sub: '15%', color: 'text-blue-600' },
                { label: 'Pending', value: 8, sub: '6%', color: 'text-orange-500' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-green-600 mt-1">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-card overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-sm text-gray-800">Incident Reports</h3>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5">
                    
                  </div>
                  <button className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700">
                    Download Report
                  </button>
                </div>
              </div>
              <table className="w-full">
                <thead className="bg-[#f8fafc] border-b border-gray-100">
                  <tr>
                    {['Date','Total Incidents','Resolved','In Progress','Pending','Actions'].map(h=>(
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {DAILY.map(d => (
                    <tr key={d.date} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-700 font-medium">{d.date}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{d.total}</td>
                      <td className="px-4 py-3 text-xs text-green-600 font-medium">{d.resolved}</td>
                      <td className="px-4 py-3 text-xs text-blue-600">{d.progress}</td>
                      <td className="px-4 py-3 text-xs text-orange-500">{d.pending}</td>
                      <td className="px-4 py-3">
                        <button className="text-gray-400 hover:text-blue-500 text-base">⬇️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <p className="text-xs text-gray-500">Showing 1 to 7 of 7 days</p>
                <div className="flex gap-1">
                  {['‹','1','›'].map(p=>(
                    <button key={p} className={`px-2.5 py-1 text-xs rounded ${p==='1'?'bg-[#1a3a6b] text-white':'text-gray-500 hover:bg-gray-100'}`}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
