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

  const [search, setSearch] = useState("");

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
        </div>
      </div>
    </div>
  );
}

export default RescueTeams;
