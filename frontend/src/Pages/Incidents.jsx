// import Topbar from "../components/Topbar";
// import TableFilters from "../components/TableFilters";

// function Incidents() {
//   return (
//     <div className="p-6 bg-slate-100 min-h-screen">
//       <Topbar title="Incidents" />

//       <div className="bg-white rounded-xl p-6 mt-5 shadow">
//         <h1 className="text-2xl font-bold">Incidents</h1>

//         <p className="text-gray-500 mb-5">
//           Manage and track all reported incidents
//         </p>

//         <TableFilters placeholder="Search incidents..." />
//       </div>
//     </div>
//   );
// }

// export default Incidents;
import { FaEye, FaEllipsisV } from "react-icons/fa";

function Incidents() {
  const rows = [
    {
      id: "INC-2025-0523-24",
      type: "Flood",
      location: "Butwal",
      time: "10:21 AM",
      status: "In Progress",
      priority: "High",
      team: "Alpha",
    },
  ];

  const action = (msg) => {
    alert(msg);
  };

  return (
    <div className="p-6">
      <h1 className="text-5xl font-bold">Incidents</h1>

      <p className="text-gray-500 mb-8">Manage and track incidents</p>

      <div className="flex gap-4 mb-8">
        <input
          placeholder="Search incidents..."
          className="border p-4 rounded-xl"
        />

        <select className="border p-4 rounded-xl">
          <option>All Types</option>
          <option>Flood</option>
          <option>Fire</option>
          <option>Landslide</option>
        </select>

        <select className="border p-4 rounded-xl">
          <option>All Status</option>
        </select>

        <input type="date" className="border p-4 rounded-xl" />
      </div>

      <table className="w-full bg-white rounded-xl shadow">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Location</th>
            <th>Reported Time</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Assigned Team</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="text-center h-20 border-b">
              <td>{r.id}</td>

              <td>{r.type}</td>

              <td>{r.location}</td>

              <td>{r.time}</td>

              <td>
                <span className="bg-blue-100 px-3 py-1 rounded">
                  {r.status}
                </span>
              </td>

              <td>
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded">
                  {r.priority}
                </span>
              </td>

              <td>{r.team}</td>

              <td>
                <div className="flex justify-center gap-4">
                  <button onClick={() => action("View")}>
                    <FaEye />
                  </button>

                  <button onClick={() => action("Menu")}>
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

export default Incidents;
