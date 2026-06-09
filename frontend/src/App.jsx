import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

// Main Pages
import Dashboard from "./pages/Dashboard";
import LiveMap from "./pages/LiveMap";
import Incidents from "./pages/Incidents";
import SOSAlerts from "./pages/SOSAlerts";
import RescueTeams from "./pages/RescueTeams";
import Operations from "./pages/Operations";
import Heatmaps from "./pages/Heatmaps";
import CrowdAnalytics from "./pages/CrowdAnalytics";
import TrafficAnalytics from "./pages/TrafficAnalytics";
import Resources from "./pages/Resources";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Settings from "./pages/Settings";

// Communication Pages
import Communications from "./pages/Communications";
import Broadcasts from "./pages/Broadcasts";
import VoiceMessages from "./pages/VoiceMessages";
import Announcements from "./pages/Announcements";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Core Modules */}
          <Route path="/live-map" element={<LiveMap />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/sos-alerts" element={<SOSAlerts />} />
          <Route path="/rescue-teams" element={<RescueTeams />} />
          <Route path="/operations" element={<Operations />} />

          {/* AI Analytics */}
          <Route path="/heatmaps" element={<Heatmaps />} />
          <Route path="/crowd-analytics" element={<CrowdAnalytics />} />
          <Route path="/traffic-analytics" element={<TrafficAnalytics />} />

          {/* Resource Management */}
          <Route path="/resources" element={<Resources />} />

          {/* Reports */}
          <Route path="/reports" element={<Reports />} />

          {/* Users */}
          <Route path="/users" element={<Users />} />

          {/* Communications */}
          <Route path="/communications" element={<Communications />} />
          <Route path="/communications/broadcasts" element={<Broadcasts />} />
          <Route
            path="/communications/voice-messages"
            element={<VoiceMessages />}
          />
          <Route
            path="/communications/announcements"
            element={<Announcements />}
          />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
