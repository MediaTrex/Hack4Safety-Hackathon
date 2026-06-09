function RecentAlerts() {
  const alerts = [
    {
      id: 1,
      title: "Flood Alert",
      location: "Butwal",
      priority: "High",
    },
    {
      id: 2,
      title: "Road Block",
      location: "Pokhara",
      priority: "Medium",
    },
    {
      id: 3,
      title: "SOS Request",
      location: "Kathmandu",
      priority: "Critical",
    },
  ];

  const handleAlertClick = (alert) => {
    alert(
      `${alert.title}\nLocation: ${alert.location}\nPriority: ${alert.priority}`,
    );
  };

  return (
    <div className="bg-white p-5 rounded-xl h-full">
      <h2 className="text-xl font-bold mb-5">Recent Alerts</h2>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <button
            key={alert.id}
            onClick={() => handleAlertClick(alert)}
            className="w-full text-left border rounded-lg p-3 hover:bg-gray-100 transition"
          >
            <h3 className="font-semibold">{alert.title}</h3>

            <p className="text-sm text-gray-500">{alert.location}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default RecentAlerts;
