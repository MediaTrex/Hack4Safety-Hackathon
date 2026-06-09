import StatusBadge from "./StatusBadge";

function IncidentTable() {
  const data = [
    {
      id: "INC-2025-0523-24",
      type: "Flood",
      location: "Butwal",
      status: "In Progress",
      priority: "High",
      team: "Alpha",
    },

    {
      id: "INC-2025-0523-23",
      type: "Landslide",
      location: "Palpa",
      status: "On The Way",
      priority: "Medium",
      team: "Bravo",
    },

    {
      id: "INC-2025-0523-22",
      type: "Accident",
      location: "Bhairahawa",
      status: "Rescue Started",
      priority: "High",
      team: "Charlie",
    },
  ];

  return (
    <table className="w-full">
      <thead className="border-b">
        <tr>
          <th>ID</th>
          <th>Type</th>
          <th>Location</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Team</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {data.map((row) => (
          <tr key={row.id} className="border-b h-16">
            <td>{row.id}</td>

            <td>{row.type}</td>

            <td>{row.location}</td>

            <td>
              <StatusBadge text={row.status} />
            </td>

            <td>
              <StatusBadge text={row.priority} />
            </td>

            <td>{row.team}</td>

            <td>
              <button
                onClick={() => alert(row.id)}
                className="border px-3 py-1 rounded"
              >
                View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default IncidentTable;
