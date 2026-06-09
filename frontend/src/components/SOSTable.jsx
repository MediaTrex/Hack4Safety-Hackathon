import StatusBadge from "./StatusBadge";

function SOSTable() {
  const data = [
    {
      id: "SOS-2025-0523-18",
      location: "Butwal",
      type: "Flood",
      status: "Assigned",
      priority: "High",
      team: "Alpha",
    },

    {
      id: "SOS-2025-0523-17",
      location: "Palpa",
      type: "Landslide",
      status: "Responding",
      priority: "Medium",
      team: "Bravo",
    },
  ];

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>ID</th>
          <th>Location</th>
          <th>Type</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Team</th>
        </tr>
      </thead>

      <tbody>
        {data.map((s) => (
          <tr key={s.id} className="border-b h-16">
            <td>{s.id}</td>

            <td>{s.location}</td>

            <td>{s.type}</td>

            <td>
              <StatusBadge text={s.status} />
            </td>

            <td>
              <StatusBadge text={s.priority} />
            </td>

            <td>{s.team}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default SOSTable;
