import {
  FaTachometerAlt,
  FaMapMarkedAlt,
  FaExclamationTriangle,
  FaUsers,
  FaClipboardList,
  FaFire,
  FaTrafficLight,
  FaBoxOpen,
  FaChartBar,
  FaUserShield,
  FaComments,
  FaCog,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
function Sidebar() {
  return (
    <div className="w-72 min-h-screen bg-[#0B1E46] text-white">
      {/* Logo Section */}
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
          </div>

          <div>
            <h1 className="font-bold text-xl">SAJAG AI</h1>

            <p className="text-sm text-blue-200">Command Center</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="p-4">
        <p className="text-gray-400 text-sm mb-3">MAIN NAVIGATION</p>
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `p-3 rounded-lg flex items-center gap-3 ${
                  isActive ? "bg-blue-700" : "hover:bg-blue-800"
                }`
              }
            >
              <FaTachometerAlt />
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/live-map"
              className={({ isActive }) =>
                `p-3 rounded-lg flex items-center gap-3 ${
                  isActive ? "bg-blue-700" : "hover:bg-blue-800"
                }`
              }
            >
              <FaMapMarkedAlt />
              Live Map
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/incidents"
              className="p-3 rounded-lg flex items-center gap-3 hover:bg-blue-800"
            >
              <FaExclamationTriangle />
              Incidents
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/sos-alerts"
              className="p-3 rounded-lg flex items-center gap-3 hover:bg-blue-800"
            >
              <FaFire />
              SOS Alerts
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/rescue-teams"
              className="p-3 rounded-lg flex items-center gap-3 hover:bg-blue-800"
            >
              <FaUsers />
              Rescue Teams
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/operations"
              className="p-3 rounded-lg flex items-center gap-3 hover:bg-blue-800"
            >
              <FaClipboardList />
              Operations
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/heatmaps"
              className="p-3 rounded-lg flex items-center gap-3 hover:bg-blue-800"
            >
              <FaFire />
              Heatmaps
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/traffic"
              className="p-3 rounded-lg flex items-center gap-3 hover:bg-blue-800"
            >
              <FaTrafficLight />
              Traffic Analytics
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/resources"
              className="p-3 rounded-lg flex items-center gap-3 hover:bg-blue-800"
            >
              <FaBoxOpen />
              Resources
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/reports"
              className="p-3 rounded-lg flex items-center gap-3 hover:bg-blue-800"
            >
              <FaChartBar />
              Reports
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/users"
              className="p-3 rounded-lg flex items-center gap-3 hover:bg-blue-800"
            >
              <FaUserShield />
              Users
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/communication"
              className="p-3 rounded-lg flex items-center gap-3 hover:bg-blue-800"
            >
              <FaComments />
              Communication
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/settings"
              className="p-3 rounded-lg flex items-center gap-3 hover:bg-blue-800"
            >
              <FaCog />
              Settings
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
