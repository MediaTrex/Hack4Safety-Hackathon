// EDITED:
// Removed NotificationBell
// Improved active tabs
// Better heatmap cards
// Better UI matching screenshot

import { useState } from "react";

function Heatmaps() {
  const [tab, setTab] = useState("Flood");

  const maps = {
    Flood:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=2070",
    Landslide:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=2070",
    Accident:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2070",
    Crowd:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2070",
  };

  return (
    <div>
      {/* Header */}

      <div className="mb-8">
        <div className="bg-blue-700 text-white px-4 py-2 rounded inline-block font-bold">
          7. AI PREDICTIVE HEATMAPS
        </div>

        <h1 className="text-3xl font-bold mt-3">AI Predictive Heatmaps</h1>

        <p className="text-gray-500">
          AI-powered risk prediction and heatmap visualization
        </p>
      </div>

      {/* Controls */}

      <div className="bg-white rounded-xl shadow p-4 mb-6 flex justify-end gap-3">
        <input type="date" className="border rounded-lg px-4 py-2" />

        <select className="border rounded-lg px-4 py-2">
          <option>Next 24 Hours</option>
          <option>Next 7 Days</option>
        </select>

        <button
          onClick={() => alert("Heatmap Downloaded")}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          Download
        </button>
      </div>

      {/* Tabs */}

      <div className="bg-white rounded-xl shadow p-4 mb-6 flex gap-6">
        {["Flood", "Landslide", "Accident", "Crowd"].map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`font-semibold px-4 py-2 rounded-lg ${
              tab === item
                ? "bg-blue-700 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {item === "Flood" && "Flood Risk"}
            {item === "Landslide" && "Landslide Risk"}
            {item === "Accident" && "Accident Hotspot"}
            {item === "Crowd" && "Crowd Density"}
          </button>
        ))}
      </div>

      {/* Heatmap */}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <img
          src={maps[tab]}
          alt={tab}
          className="w-full h-[500px] object-cover"
        />
      </div>

      {/* Summary */}

      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-red-500 text-3xl font-bold">8</h3>
          <p>High Risk Areas</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-yellow-500 text-3xl font-bold">14</h3>
          <p>Medium Risk Areas</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-green-500 text-3xl font-bold">23</h3>
          <p>Low Risk Areas</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-blue-600 text-3xl font-bold">87%</h3>
          <p>Model Accuracy</p>
        </div>
      </div>
    </div>
  );
}

export default Heatmaps;
