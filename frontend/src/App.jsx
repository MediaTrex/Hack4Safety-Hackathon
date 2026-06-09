// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import DashboardLayout from "./layouts/DashboardLayout";
// import RescueTeams from "./pages/RescueTeams";
// import Operations from "./pages/Operations";
// import Dashboard from "./pages/Dashboard";
// import LiveMap from "./pages/LiveMap";
// import Incidents from "./pages/Incidents";
// import SOSAlerts from "./pages/SOSAlerts";
// // import RescueTeams from "./pages/RescueTeams";
// // import Operations from "./pages/Operations";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route element={<DashboardLayout />}>
//           <Route path="/" element={<Dashboard />} />

//           <Route path="/live-map" element={<LiveMap />} />

//           <Route path="/incidents" element={<Incidents />} />

//           <Route path="/sos-alerts" element={<SOSAlerts />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import LiveMap from "./pages/LiveMap";
import Incidents from "./pages/Incidents";
import SOSAlerts from "./pages/SOSAlerts";
import RescueTeams from "./pages/RescueTeams";
import Operations from "./pages/Operations";
import Heatmaps from "./pages/Heatmaps";
import CrowdAnalytics from "./pages/CrowdAnalytics";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />

          <Route path="/live-map" element={<LiveMap />} />

          <Route path="/incidents" element={<Incidents />} />

          <Route path="/sos-alerts" element={<SOSAlerts />} />

          <Route path="/rescue-teams" element={<RescueTeams />} />

          <Route path="/operations" element={<Operations />} />

          <Route path="/heatmaps" element={<Heatmaps />} />

          <Route path="/crowd-analytics" element={<CrowdAnalytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
