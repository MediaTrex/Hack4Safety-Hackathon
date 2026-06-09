import { useState } from "react";
import {FaEllipsisV, FaFilter } from "react-icons/fa";

function RescueTeams() {
  const [teams, setTeams] = useState([
    {
      id: "RT-001",
      name: "Butwal Rescue Unit 3",
      location: "Butwal",
      status: "On Mission",
      mission: "Flood Rescue",
      members: 5,
      time: "10:24 AM",
    },

    {
      id: "RT-002",
      name: "Bhairawa Unit 2",
      location: "Bhairawa",
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

  const filtered = teams.filter((t) =>
    t.id.toLowerCase().includes(search.toLowerCase()),
  );

  const addTeam = () => {
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

    setShowForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold">Rescue Teams</h1>

          <p className="text-gray-500">Monitor rescue teams</p>
        </div>

        <button onClick={() => alert("Notifications")} className="text-2xl">
          <FaBell />
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          placeholder="Search Team ID"
          className="border p-3 rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={() => alert("Filter Open")}
          className="border px-5 rounded-xl flex gap-2 items-center"
        >
          <FaFilter />
          Filter
        </button>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-5 rounded-xl"
        >
          + Add Team
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-5 rounded-xl shadow mb-5">
          <input
            placeholder="Team ID"
            className="border p-2 mr-3"
            onChange={(e) =>
              setNewTeam({
                ...newTeam,
                id: e.target.value,
              })
            }
          />

          <input
            placeholder="Team Name"
            className="border p-2 mr-3"
            onChange={(e) =>
              setNewTeam({
                ...newTeam,
                name: e.target.value,
              })
            }
          />

          <input
            placeholder="Location"
            className="border p-2"
            onChange={(e) =>
              setNewTeam({
                ...newTeam,
                location: e.target.value,
              })
            }
          />

          <button
            onClick={addTeam}
            className="bg-green-600 text-white px-4 py-2 ml-3 rounded"
          >
            Save
          </button>
        </div>
      )}

      <table className="w-full bg-white shadow rounded-xl">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Location</th>
            <th>Status</th>
            <th>Mission</th>
            <th>Members</th>
            <th>Update</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((t) => (
            <>
              <tr key={t.id} className="text-center border-b h-16">
                <td>{t.id}</td>

                <td>{t.name}</td>

                <td>{t.location}</td>

                <td>
                  <span className="bg-green-100 px-3 py-1 rounded">
                    {t.status}
                  </span>
                </td>

                <td>{t.mission}</td>

                <td>{t.members}</td>

                <td>{t.time}</td>

                <td>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() =>
                        setVisible({
                          ...visible,
                          [t.id]: !visible[t.id],
                        })
                      }
                    >
                      <FaEye />
                    </button>

                    <button onClick={() => alert("Edit/Delete")}>
                      <FaEllipsisV />
                    </button>
                  </div>
                </td>
              </tr>

              {visible[t.id] && (
                <tr>
                  <td colSpan="8" className="bg-gray-100 p-3">
                    Extra Team Details Visible
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RescueTeams;
