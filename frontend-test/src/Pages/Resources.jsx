import { useState } from "react";
import { FaSearch, FaEye, FaEdit, FaTrash, FaEllipsisV } from "react-icons/fa";

function Resources() {
  const [activeTab, setActiveTab] = useState("All Resources");

  const tabs = [
    "All Resources",
    "Vehicles",
    "Boats",
    "Drones",
    "Medical Kits",
    "Equipment",
    "Fuel",
  ];

  const cards = [
    {
      title: "Total Vehicles",
      total: "60",
      available: "42",
    },
    {
      title: "Boats",
      total: "25",
      available: "18",
    },
    {
      title: "Drones",
      total: "20",
      available: "15",
    },
    {
      title: "Medical Kits",
      total: "100",
      available: "75",
    },
    {
      title: "Fuel (Liters)",
      total: "10,600",
      available: "6,340 L",
    },
  ];

  const resources = [
    {
      id: "VH-001",
      type: "Vehicle",
      name: "Rescue Truck",
      location: "Butwal",
      total: 10,
      available: 7,
      inUse: 2,
      maintenance: 1,
      status: "Available",
    },
    {
      id: "BT-001",
      type: "Boat",
      name: "Inflatable Rescue Boat",
      location: "Bardiya",
      total: 5,
      available: 2,
      inUse: 2,
      maintenance: 1,
      status: "Maintenance",
    },
    {
      id: "DR-001",
      type: "Drone",
      name: "DJI Rescue Drone",
      location: "Kathmandu",
      total: 8,
      available: 5,
      inUse: 2,
      maintenance: 1,
      status: "Available",
    },
    {
      id: "MK-001",
      type: "Medical Kit",
      name: "Emergency Kit",
      location: "Pokhara",
      total: 100,
      available: 25,
      inUse: 60,
      maintenance: 15,
      status: "Low Stock",
    },
  ];

  const statusBadge = (status) => {
    if (status === "Available") {
      return (
        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">
          Available
        </span>
      );
    }

    if (status === "Maintenance") {
      return (
        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs">
          Maintenance
        </span>
      );
    }

    return (
      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs">
        Low Stock
      </span>
    );
  };

  return (
    <div>
      {/* PAGE TITLE */}

      <div className="mb-5">
        <h1 className="text-3xl font-bold">Resources</h1>

        <p className="text-gray-500">
          Monitor availability of all resources and equipment
        </p>
      </div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-5 gap-4 mb-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-gray-500 text-sm">{card.title}</p>

            <h2 className="text-4xl font-bold text-blue-600 mt-2">
              {card.total}
            </h2>

            <p className="text-green-600 mt-2 font-medium">
              Available: {card.available}
            </p>
          </div>
        ))}
      </div>

      {/* TABS */}

      <div className="bg-white rounded-xl p-3 mb-5 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* FILTERS */}

      <div className="bg-white rounded-xl p-4 mb-5 flex gap-3 flex-wrap">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />

          <input
            type="text"
            placeholder="Search resources..."
            className="border rounded-lg pl-10 pr-4 py-2"
          />
        </div>

        <select className="border rounded-lg px-4 py-2">
          <option>All Types</option>
          <option>Vehicle</option>
          <option>Boat</option>
          <option>Drone</option>
          <option>Medical Kit</option>
          <option>Equipment</option>
          <option>Fuel</option>
        </select>

        <select className="border rounded-lg px-4 py-2">
          <option>All Status</option>
          <option>Available</option>
          <option>Maintenance</option>
          <option>Low Stock</option>
        </select>

        <button className="bg-blue-600 text-white px-5 rounded-lg">
          Filter
        </button>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-4">ID</th>
              <th>Type</th>
              <th>Name</th>
              <th>Location</th>
              <th>Total</th>
              <th>Available</th>
              <th>In Use</th>
              <th>Maintenance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {resources.map((item) => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="p-4">{item.id}</td>

                <td>{item.type}</td>

                <td>{item.name}</td>

                <td>{item.location}</td>

                <td>{item.total}</td>

                <td>{item.available}</td>

                <td>{item.inUse}</td>

                <td>{item.maintenance}</td>

                <td>{statusBadge(item.status)}</td>

                <td>
                  <div className="flex gap-3">
                    <button onClick={() => alert(`Viewing ${item.name}`)}>
                      <FaEye />
                    </button>

                    <button onClick={() => alert(`Editing ${item.name}`)}>
                      <FaEdit />
                    </button>

                    <button onClick={() => alert(`Deleting ${item.name}`)}>
                      <FaTrash />
                    </button>

                    <button onClick={() => alert("More Actions")}>
                      <FaEllipsisV />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}

        <div className="p-4 border-t flex justify-between items-center">
          <p className="text-sm text-gray-500">Showing 1 to 4 of 4 resources</p>

          <div className="flex gap-2">
            <button className="border px-3 py-1 rounded">Previous</button>

            <button className="bg-blue-600 text-white px-3 py-1 rounded">
              1
            </button>

            <button className="border px-3 py-1 rounded">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Resources;
