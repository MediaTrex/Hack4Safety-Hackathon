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

  return (
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
    </div>
  );
}

export default Operations;
