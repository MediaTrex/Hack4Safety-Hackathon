function StatusBadge({ text }) {
  const colors = {
    "In Progress": "bg-blue-100 text-blue-600",
    "On The Way": "bg-yellow-100 text-yellow-600",
    Assigned: "bg-indigo-100 text-indigo-600",
    Monitoring: "bg-gray-100 text-gray-600",
    "Rescue Started": "bg-green-100 text-green-600",
    Responding: "bg-orange-100 text-orange-600",
    Pending: "bg-gray-100 text-gray-500",
    "Rescue Completed": "bg-green-100 text-green-700",
    High: "bg-red-100 text-red-600",
    Medium: "bg-yellow-100 text-yellow-600",
    Low: "bg-green-100 text-green-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[text]}`}
    >
      {text}
    </span>
  );
}

export default StatusBadge;
