import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FaBell } from "react-icons/fa";
import { useState } from "react";

function DashboardLayout() {
  const [showBell, setShowBell] = useState(false);

  const [notifications, setNotifications] = useState([
    "New SOS Alert Received",
    "Flood Warning Updated",
    "Operation Assigned",
  ]);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b flex justify-end items-center px-5 relative shrink-0">
          <button
            onClick={() => setShowBell(!showBell)}
            className="relative text-gray-600 hover:text-blue-600"
          >
            <FaBell size={18} />

            {notifications.length > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {showBell && (
            <div className="absolute top-14 right-4 w-72 bg-white rounded-xl shadow-lg border z-50">
              <div className="p-3 border-b font-medium">Notifications</div>

              {notifications.map((item, index) => (
                <div
                  key={index}
                  className="p-3 text-sm border-b hover:bg-slate-50"
                >
                  {item}
                </div>
              ))}

              <button
                onClick={() => setNotifications([])}
                className="w-full p-3 text-blue-600 text-sm"
              >
                Clear All
              </button>
            </div>
          )}
        </header>

        {/* Main */}
        <main className="flex-1 overflow-auto p-4 md:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
