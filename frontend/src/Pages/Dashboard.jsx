import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import RecentAlerts from "../components/RecentAlerts";
import LiveMapComponent from "../components/LiveMapComponent";

function Dashboard() {
  const dashboardStats = {
    activeIncidents: 100,
    sosAlerts: 18,
    rescueTeams: 32,
    peopleAssisted: 256,
    resources: "68%",
  };

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <Topbar title="Command Center Dashboard" />

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4 mt-6">
        <StatCard
          title="Active Incidents"
          value={dashboardStats.activeIncidents}
          color="text-blue-500"
        />

        <StatCard
          title="SOS Alerts"
          value={dashboardStats.sosAlerts}
          color="text-red-500"
        />

        <StatCard
          title="Rescue Teams"
          value={dashboardStats.rescueTeams}
          color="text-indigo-500"
        />

        <StatCard
          title="People Assisted"
          value={dashboardStats.peopleAssisted}
          color="text-green-500"
        />

        <StatCard
          title="Resources"
          value={dashboardStats.resources}
          color="text-cyan-500"
        />
      </div>

      {/* Map + Alerts Section */}
      <div className="grid grid-cols-4 gap-5 mt-6">
        {/* Live Map */}
        <div className="col-span-3 bg-white rounded-xl p-5 shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Live Situation Map</h2>

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              onClick={() => (window.location.href = "/live-map")}
            >
              Open Full Map
            </button>
          </div>

          <LiveMapComponent />
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-xl p-5 shadow">
          <RecentAlerts />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
