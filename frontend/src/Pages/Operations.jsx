import { useState } from "react";
import { FaEllipsisV } from "react-icons/fa";

function Operations() {
  const [ops, setOps] = useState([
    {
      id: "OP-001",
      type: "Flood Rescue",
      location: "Butwal",
      team: "Unit 3",
      status: "In Progress",
      time: "10:20",
    },
  ]);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [type, setType] = useState("");

  const [show, setShow] = useState(false);

  const addOperation = () => {
    setOps([
      ...ops,
      {
        id: "OP-" + Date.now(),
        type: "New Operation",
        location: "Kathmandu",
        team: "Unit",
        status: "Assigned",
        time: "Now",
      },
    ]);
  };

  const filtered = ops.filter((o) =>
    o.id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-4xl font-bold">Operations</h1>

          <p className="text-gray-500">Track operations</p>
        </div>

        <button onClick={() => alert("Bell")}>
          <FaBell />
        </button>
      </div>

      <div className="flex gap-4 my-6">
        <input
          placeholder="Search operation"
          className="border p-3 rounded-xl"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-3 rounded-xl"
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All Status</option>

          <option>Assigned</option>

          <option>In Progress</option>
        </select>

        <select
          className="border p-3 rounded-xl"
          onChange={(e) => setType(e.target.value)}
        >
          <option>All Types</option>

          <option>Flood</option>

          <option>Rescue</option>
        </select>

        <button
          onClick={addOperation}
          className="bg-blue-600 text-white px-5 rounded-xl"
        >
          + Create Operation
        </button>
      </div>

      <table className="w-full bg-white rounded-xl shadow">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Location</th>
            <th>Team</th>
            <th>Status</th>
            <th>Time</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((o) => (
            <tr key={o.id} className="text-center h-16 border-b">
              <td>{o.id}</td>

              <td>{o.type}</td>

              <td>{o.location}</td>

              <td>{o.team}</td>

              <td>
                <span className="bg-blue-100 px-3 py-1 rounded">
                  {o.status}
                </span>
              </td>

              <td>{o.time}</td>

              <td>
                <div className="flex justify-center gap-3">
                  <button onClick={() => alert("View")}>
                    <FaEye />
                  </button>

                  <button onClick={() => alert("More")}>
                    <FaEllipsisV />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Operations;
