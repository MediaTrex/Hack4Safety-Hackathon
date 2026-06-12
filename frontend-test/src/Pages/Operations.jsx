import { useState } from "react";
import { FaEllipsisV, FaEye } from "react-icons/fa";

function Operations() {
  const [ops, setOps] = useState([
    {
      id: "OP-001",
      type: "Flood Rescue",
      location: "Butwal",
      team: "Unit 3",
      status: "In Progress",
      time: "10:20 AM",
    },
    {
      id: "OP-002",
      type: "Accident Response",
      location: "Bhairahawa",
      team: "Unit 2",
      status: "Assigned",
      time: "09:45 AM",
    },
  ]);

  const [search, setSearch] = useState("");

  const addOperation = () => {
    setOps([
      ...ops,
      {
        id: `OP-${ops.length + 1}`.padStart(6, "0"),
        type: "New Operation",
        location: "Kathmandu",
        team: "Unit 5",
        status: "Assigned",
        time: "Now",
      },
    ]);
  };

  const filtered = ops.filter((o) =>
    o.id.toLowerCase().includes(search.toLowerCase()),
  );

export default function Operations() {
  return (
<<<<<<< HEAD
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
          <div className="flex items-center gap-3 p-4 border-b">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input placeholder="Search operations..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
              {['All Status','In Progress','On The Way','Assigned','Monitoring','Completed'].map(t=><option key={t}>{t}</option>)}
            </select>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
              {['All Types','Flood Rescue','Landslide Response','Accident Rescue','Fire Response','Crowd Management'].map(t=><option key={t}>{t}</option>)}
            </select>
            <div className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-2">📅 May 16 – May 23, 2025</div>
            <button className="ml-auto bg-[#1a3a6b] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#0f2347]">＋ Create Operation</button>
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
              {OPS.map(op=>(
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
=======
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Operations</h1>

        <p className="text-sm text-gray-500">
          Track and manage active rescue operations
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search operation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 px-4 border rounded-lg text-sm"
        />

        <select className="h-10 px-4 border rounded-lg text-sm">
          <option>All Status</option>
          <option>Assigned</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>

        <select className="h-10 px-4 border rounded-lg text-sm">
          <option>All Types</option>
          <option>Flood Rescue</option>
          <option>Accident Response</option>
          <option>Medical Emergency</option>
        </select>

        <button
          onClick={addOperation}
          className="h-10 px-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          + Create Operation
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-sm text-gray-700">
              <th className="p-4 text-left">ID</th>
              <th className="text-left">Type</th>
              <th className="text-left">Location</th>
              <th className="text-left">Team</th>
              <th className="text-left">Status</th>
              <th className="text-left">Updated</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-4 font-medium text-blue-600">{o.id}</td>

                <td>{o.type}</td>

                <td>{o.location}</td>

                <td>{o.team}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      o.status === "In Progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>

                <td>{o.time}</td>

                <td>
                  <div className="flex justify-center gap-4">
                    <button onClick={() => alert(`Viewing ${o.id}`)}>
                      <FaEye className="text-blue-600" />
                    </button>

                    <button onClick={() => alert(`More options for ${o.id}`)}>
                      <FaEllipsisV className="text-gray-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  No operations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
>>>>>>> origin/master
    </div>
  );
}
