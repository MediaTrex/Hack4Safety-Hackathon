// EDITED:
// Removed NotificationBell
// Better table styling
// Better action button

import { FaChartBar } from "react-icons/fa";

function CrowdAnalytics() {
  const rows = [
    {
      location: "Tinkune, Kathmandu",
      density: "85%",
      trend: "Increasing",
      risk: "High",
      time: "10:31 AM",
    },
    {
      location: "New Road, Kathmandu",
      density: "72%",
      trend: "Increasing",
      risk: "High",
      time: "10:19 AM",
    },
    {
      location: "Indra Chowk",
      density: "46%",
      trend: "Stable",
      risk: "Medium",
      time: "10:15 AM",
    },
    {
      location: "Lakeside, Pokhara",
      density: "29%",
      trend: "Decreasing",
      risk: "Low",
      time: "10:10 AM",
    },
  ];

  const showChart = (row) => {
    alert(`Showing crowd chart for ${row.location}`);
  };

  return (
    <div>
      {/* Header */}

      <div className="mb-8">
        <div className="bg-blue-700 text-white px-4 py-2 rounded inline-block font-bold">
          8. CROWD ANALYTICS
        </div>

        <h1 className="text-3xl font-bold mt-3">Crowd Analytics</h1>

        <p className="text-gray-500">Real-time crowd density monitoring</p>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow">
          <h2 className="text-blue-600 text-3xl font-bold">12</h2>
          <p>Total Locations</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow">
          <h2 className="text-red-500 text-3xl font-bold">4</h2>
          <p>High Density</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow">
          <h2 className="text-orange-500 text-3xl font-bold">5</h2>
          <p>Medium Density</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow">
          <h2 className="text-green-500 text-3xl font-bold">3</h2>
          <p>Low Density</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow">
          <h2 className="text-green-600 text-3xl font-bold">42%</h2>
          <p>Average Density</p>
        </div>
      </div>

      {/* Table */}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Location</th>
              <th>Current Density</th>
              <th>Trend</th>
              <th>Risk Level</th>
              <th>Last Update</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="p-4">{row.location}</td>

                <td>{row.density}</td>

                <td>{row.trend}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm ${
                      row.risk === "High"
                        ? "bg-red-500"
                        : row.risk === "Medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                  >
                    {row.risk}
                  </span>
                </td>

                <td>{row.time}</td>

                <td>
                  <button
                    onClick={() => showChart(row)}
                    className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200"
                  >
                    <FaChartBar />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CrowdAnalytics;
