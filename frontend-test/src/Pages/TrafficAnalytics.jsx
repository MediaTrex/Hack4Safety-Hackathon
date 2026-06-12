import {
  FaCar,
  FaRoad,
  FaExclamationTriangle,
  FaTrafficLight,
} from "react-icons/fa";

function TrafficAnalytics() {
  const roads = [
    {
      road: "East-West Highway",
      traffic: "Heavy",
      speed: "18 km/h",
      incidents: 3,
    },
    {
      road: "Siddhartha Highway",
      traffic: "Moderate",
      speed: "42 km/h",
      incidents: 1,
    },
    {
      road: "Butwal Ring Road",
      traffic: "Low",
      speed: "65 km/h",
      incidents: 0,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Traffic Analytics
        </h1>

        <p className="text-sm text-gray-500">
          Real-time traffic monitoring and road congestion analysis
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <FaCar className="text-blue-600 text-2xl mb-2" />
          <p className="text-sm text-gray-500">Vehicles Tracked</p>
          <h2 className="text-3xl font-semibold">12,548</h2>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <FaRoad className="text-green-600 text-2xl mb-2" />
          <p className="text-sm text-gray-500">Roads Monitored</p>
          <h2 className="text-3xl font-semibold">87</h2>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <FaTrafficLight className="text-yellow-600 text-2xl mb-2" />
          <p className="text-sm text-gray-500">Congested Roads</p>
          <h2 className="text-3xl font-semibold">14</h2>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <FaExclamationTriangle className="text-red-600 text-2xl mb-2" />
          <p className="text-sm text-gray-500">Traffic Incidents</p>
          <h2 className="text-3xl font-semibold">8</h2>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4">Road</th>
              <th className="text-left">Traffic</th>
              <th className="text-left">Average Speed</th>
              <th className="text-left">Incidents</th>
            </tr>
          </thead>

          <tbody>
            {roads.map((road, index) => (
              <tr key={index} className="border-t">
                <td className="p-4">{road.road}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      road.traffic === "Heavy"
                        ? "bg-red-100 text-red-600"
                        : road.traffic === "Moderate"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                    }`}
                  >
                    {road.traffic}
                  </span>
                </td>

                <td>{road.speed}</td>

                <td>{road.incidents}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

export default TrafficAnalytics;
>>>>>>> origin/master
