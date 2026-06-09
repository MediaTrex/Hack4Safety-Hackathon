// import Topbar from "../components/Topbar";
// import LiveMapComponent from "../components/LiveMapComponent";
// import MapStats from "../components/MapStats";
// import QuickActions from "../components/QuickActions";

// function LiveMap() {
//   return (
//     <div className="p-6 bg-slate-100 min-h-screen">
//       <Topbar title="Live Situation Map" />

//       <div className="grid grid-cols-4 gap-6 mt-6">
//         {/* Map Section */}
//         <div className="col-span-3 bg-white rounded-xl shadow p-4">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-semibold">Real-Time Situation Map</h2>

//             <div className="flex gap-2">
//               <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
//                 All
//               </button>

//               <button className="border px-4 py-2 rounded-lg">Incidents</button>

//               <button className="border px-4 py-2 rounded-lg">
//                 SOS Alerts
//               </button>

//               <button className="border px-4 py-2 rounded-lg">
//                 Rescue Teams
//               </button>
//             </div>
//           </div>

//           <LiveMapComponent />
//         </div>

//         {/* Right Side */}
//         <div>
//           <MapStats />

//           <QuickActions />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default LiveMap;
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function LiveMap() {
  const [filter, setFilter] = useState("All");

  const clickAction = (msg) => {
    alert(msg);
  };

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-4 gap-5">
        {/* LEFT */}
        <div className="col-span-3">
          <div className="flex gap-4 mb-5">
            {["All", "Incidents", "SOS Alerts", "Rescue Teams"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-10 py-4 rounded-2xl border text-xl
                ${filter === item ? "bg-blue-600 text-white" : "bg-white"}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="rounded-3xl overflow-hidden shadow">
            <MapContainer
              center={[27.7, 85.3]}
              zoom={7}
              style={{ height: "700px" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <Marker position={[27.7, 85.3]}>
                <Popup>Kathmandu</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        {/* RIGHT */}

        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-8 shadow">
            <h1 className="font-bold text-3xl mb-5">Map Statistics</h1>

            {[
              ["Active Incidents", 24, "text-blue-600"],
              ["SOS Alerts", 18, "text-red-600"],
              ["Rescue Teams", 32, "text-purple-600"],
              ["Shelters", 45, "text-green-600"],
              ["Hospitals", 28, "text-cyan-600"],
            ].map((x) => (
              <div className="flex justify-between py-4 text-xl" key={x[0]}>
                <span>{x[0]}</span>

                <span className={x[2] + " font-bold"}>{x[1]}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-8 shadow">
            <h1 className="font-bold text-3xl mb-5">Quick Actions</h1>

            <button
              onClick={() => clickAction("Incident Added")}
              className="w-full bg-blue-600 text-white rounded-xl p-4 mb-4"
            >
              Add Incident
            </button>

            <button
              onClick={() => clickAction("Alert Broadcast")}
              className="w-full bg-red-500 text-white rounded-xl p-4 mb-4"
            >
              Broadcast Alert
            </button>

            <button
              onClick={() => clickAction("Rescue Assigned")}
              className="w-full bg-green-500 text-white rounded-xl p-4"
            >
              Assign Rescue Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveMap;