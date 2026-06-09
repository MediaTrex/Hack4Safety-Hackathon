function MapStats() {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="font-bold text-lg mb-4">Map Statistics</h2>

      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Active Incidents</span>
          <span className="font-bold text-blue-600">24</span>
        </div>

        <div className="flex justify-between">
          <span>SOS Alerts</span>
          <span className="font-bold text-red-600">18</span>
        </div>

        <div className="flex justify-between">
          <span>Rescue Teams</span>
          <span className="font-bold text-indigo-600">32</span>
        </div>

        <div className="flex justify-between">
          <span>Shelters</span>
          <span className="font-bold text-green-600">45</span>
        </div>

        <div className="flex justify-between">
          <span>Hospitals</span>
          <span className="font-bold text-cyan-600">28</span>
        </div>
      </div>
    </div>
  );
}

export default MapStats;
