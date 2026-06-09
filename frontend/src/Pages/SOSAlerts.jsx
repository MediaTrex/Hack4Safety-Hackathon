// import Topbar from "../components/Topbar";
// import TableFilters from "../components/TableFilters";
// import SOSTable from "../components/SOSTable";

// function SOSAlerts() {
//   return (
//     <div className="p-6 bg-slate-100 min-h-screen">
//       <Topbar title="SOS Alerts" />

//       <div className="bg-white p-6 rounded-xl shadow mt-5">
//         <h2 className="text-2xl font-bold">SOS Alerts</h2>

//         <p className="text-gray-500 mb-5">Real-time emergency SOS alerts</p>

//         <TableFilters placeholder="Search SOS alerts..." />

//         <SOSTable />
//       </div>
//     </div>
//   );
// }

// export default SOSAlerts;
import { FaEye, FaPhone, FaCommentDots, FaEllipsisV } from "react-icons/fa";

function SOSAlerts() {
  const click = (x) => alert(x);

  const data = [
    {
      id: "SOS-2025",
      location: "Butwal",
      type: "Flood",
      time: "10:20",
      status: "Assigned",
      priority: "High",
      team: "Alpha",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-5xl font-bold">SOS Alerts</h1>

      <p className="text-gray-500 mb-8">Real-time emergency alerts</p>

      <div className="flex gap-4 mb-8">
        <input placeholder="Search" className="border p-4 rounded-xl" />

        <select className="border p-4 rounded-xl">
          <option>All Status</option>
        </select>

        <select className="border p-4 rounded-xl">
          <option>All Priority</option>
        </select>

        <input type="date" className="border p-4 rounded-xl" />

        <button
          onClick={() => click("Export")}
          className="bg-blue-600 text-white px-6 rounded-xl"
        >
          Export
        </button>
      </div>

      <table className="w-full bg-white shadow rounded-xl">
        <thead>
          <tr>
            <th>ID</th>
            <th>Location</th>
            <th>Type</th>
            <th>Time</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Team</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((a) => (
            <tr key={a.id} className="text-center h-20 border-b">
              <td>{a.id}</td>

              <td>{a.location}</td>

              <td>{a.type}</td>

              <td>{a.time}</td>

              <td>
                <span className="bg-blue-100 px-3 py-1 rounded">
                  {a.status}
                </span>
              </td>

              <td>
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded">
                  {a.priority}
                </span>
              </td>

              <td>{a.team}</td>

              <td>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => click("View")}>
                    <FaEye />
                  </button>

                  <button onClick={() => click("Call")}>
                    <FaPhone />
                  </button>

                  <button onClick={() => click("Message")}>
                    <FaCommentDots />
                  </button>

                  <button onClick={() => click("More")}>
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

export default SOSAlerts;
