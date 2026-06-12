import { useState } from "react";
import { FaEllipsisV, FaFilter, FaEye } from "react-icons/fa";

function RescueTeams() {
  const [teams, setTeams] = useState([
    {
      id: "RT-001",
      name: "Butwal Unit 3",
      location: "Butwal",
      status: "On Mission",
      mission: "Flood Rescue",
      members: 5,
      time: "10:24 AM",
    },
    {
      id: "RT-002",
      name: "Bhairahawa Unit 2",
      location: "Bhairahawa",
      status: "On The Way",
      mission: "Accident Rescue",
      members: 4,
      time: "10:20 AM",
    },
  ]);

export default function RescueTeams() {
  const [search, setSearch] = useState('');

<<<<<<< HEAD
  const filtered = TEAMS.filter(t =>
    search === '' || t.name.toLowerCase().includes(search.toLowerCase()) || t.location.toLowerCase().includes(search.toLowerCase())
  );

  const counts = { total: 32, onMission: 12, onTheWay: 10, available: 8, standby: 2 };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 space-y-4 bg-[#f0f4f8]">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Total Teams', value: counts.total, sub: 'Active across field', color: 'text-gray-800' },
            { label: 'On Mission', value: counts.onMission, sub: 'Teams currently deployed', color: 'text-green-600' },
            { label: 'On The Way', value: counts.onTheWay, sub: 'Teams en route', color: 'text-orange-500' },
            { label: 'Available', value: counts.available, sub: 'Teams ready', color: 'text-blue-600' },
            { label: 'Standby', value: counts.standby, sub: 'Teams in standby', color: 'text-yellow-600' },
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
          <div className="flex items-center gap-3 p-4 border-b">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search teams..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
            <button className="flex items-center gap-2 text-sm border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
              ▽ Filter
            </button>
            <button className="ml-auto flex items-center gap-2 bg-[#1a3a6b] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#0f2347]">
              ＋ Add Team
            </button>
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
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition">
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
                    <div className="flex gap-2">
                      <button className="text-gray-400 hover:text-gray-600 text-sm">⋯</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-xs text-gray-500">Showing 1 to {filtered.length} of 32 teams</p>
            <div className="flex gap-1">
              {['‹','1','2','3','4','›'].map(p => (
                <button key={p} className={`px-2.5 py-1 text-xs rounded ${p==='1'?'bg-[#1a3a6b] text-white':'text-gray-500 hover:bg-gray-100'}`}>{p}</button>
              ))}
            </div>
          </div>
=======
  const [showForm, setShowForm] = useState(false);

  const [visible, setVisible] = useState({});

  const [newTeam, setNewTeam] = useState({
    id: "",
    name: "",
    location: "",
  });

  const filtered = teams.filter(
    (team) =>
      team.id.toLowerCase().includes(search.toLowerCase()) ||
      team.name.toLowerCase().includes(search.toLowerCase()),
  );

  const addTeam = () => {
    if (!newTeam.id || !newTeam.name || !newTeam.location) {
      alert("Please fill all fields");
      return;
    }

    setTeams([
      ...teams,
      {
        ...newTeam,
        status: "Available",
        mission: "-",
        members: 0,
        time: "Now",
      },
    ]);

    setNewTeam({
      id: "",
      name: "",
      location: "",
    });

    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Rescue Teams</h1>

        <p className="text-gray-500 text-sm mt-1">
          Monitor and manage all rescue teams
        </p>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search Team ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-xl px-4 py-3 w-72"
        />

        <button className="border rounded-xl px-5 py-3 flex items-center gap-2 hover:bg-gray-50">
          <FaFilter />
          Filter
        </button>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl"
        >
          + Add Team
        </button>
      </div>

      {/* Add Team Form */}
      {showForm && (
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold mb-4">Add Rescue Team</h3>

          <div className="grid md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Team ID"
              value={newTeam.id}
              onChange={(e) =>
                setNewTeam({
                  ...newTeam,
                  id: e.target.value,
                })
              }
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="text"
              placeholder="Team Name"
              value={newTeam.name}
              onChange={(e) =>
                setNewTeam({
                  ...newTeam,
                  name: e.target.value,
                })
              }
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="text"
              placeholder="Location"
              value={newTeam.location}
              onChange={(e) =>
                setNewTeam({
                  ...newTeam,
                  location: e.target.value,
                })
              }
              className="border rounded-lg px-3 py-2"
            />
          </div>

          <button
            onClick={addTeam}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
          >
            Save Team
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-24 p-4 text-left">ID</th>

                <th className="w-56 p-4 text-left">Name</th>

                <th className="w-40 p-4 text-left">Location</th>

                <th className="w-40 p-4 text-left">Status</th>

                <th className="w-44 p-4 text-left">Mission</th>

                <th className="w-28 p-4 text-center">Members</th>

                <th className="w-32 p-4 text-center">Updated</th>

                <th className="w-28 p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((team) => (
                <>
                  <tr key={team.id} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-medium">{team.id}</td>

                    <td className="p-4 whitespace-nowrap">{team.name}</td>

                    <td className="p-4">{team.location}</td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          team.status === "On Mission"
                            ? "bg-green-100 text-green-700"
                            : team.status === "On The Way"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {team.status}
                      </span>
                    </td>

                    <td className="p-4">{team.mission}</td>

                    <td className="p-4 text-center">{team.members}</td>

                    <td className="p-4 text-center">{team.time}</td>

                    <td className="p-4">
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() =>
                            setVisible({
                              ...visible,
                              [team.id]: !visible[team.id],
                            })
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEye />
                        </button>

                        <button
                          onClick={() => alert(`Manage Team: ${team.name}`)}
                          className="text-gray-600 hover:text-black"
                        >
                          <FaEllipsisV />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {visible[team.id] && (
                    <tr>
                      <td colSpan="8" className="bg-blue-50 p-4">
                        <div className="space-y-1">
                          <p>
                            <strong>Team:</strong> {team.name}
                          </p>

                          <p>
                            <strong>Location:</strong> {team.location}
                          </p>

                          <p>
                            <strong>Status:</strong> {team.status}
                          </p>

                          <p>
                            <strong>Mission:</strong> {team.mission}
                          </p>

                          <p>
                            <strong>Members:</strong> {team.members}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
>>>>>>> origin/master
        </div>
      </div>
    </div>
  );
}
