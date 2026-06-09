// import { Outlet } from "react-router-dom";
// import Sidebar from "../components/Sidebar";

// function DashboardLayout() {
//   return (
//     <div className="flex bg-[#F1F5F9]">
//       <Sidebar />

//       <div className="flex-1 min-h-screen">
//         <Outlet />
//       </div>
//     </div>
//   );
// }

// export default DashboardLayout;
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FaBell } from "react-icons/fa";
import { useState } from "react";

function DashboardLayout() {
  const [notifications, setNotifications] = useState([
    "New SOS Alert Received",
    "Rescue Team RT-004 Updated",
    "Flood Incident Added",
  ]);

  const [showBell, setShowBell] = useState(false);

  return (
    <div className="flex bg-[#F1F5F9] min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white h-16 shadow-sm flex justify-end items-center px-8 relative">
          <button onClick={() => setShowBell(!showBell)} className="relative">
            <FaBell className="text-2xl text-gray-700 cursor-pointer" />

            {notifications.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs px-1">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showBell && (
            <div className="absolute top-14 right-6 bg-white shadow-lg rounded-lg w-72 p-4 z-50">
              <h3 className="font-bold mb-3">Notifications</h3>

              <div className="space-y-2">
                {notifications.map((item, i) => (
                  <div key={i} className="p-2 bg-gray-100 rounded">
                    {item}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setNotifications([])}
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded"
              >
                Clear Notifications
              </button>
            </div>
          )}
        </div>

        {/* Pages Render Here */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
