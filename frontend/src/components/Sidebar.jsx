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
  const navClass = ({ isActive }) =>
    `p-3 rounded-lg flex items-center gap-3 transition-all duration-200 ${
      isActive ? "bg-blue-700 text-white" : "text-white hover:bg-blue-800"
    }`;

  return (
    <div className="w-72 min-h-screen bg-[#0B1E46] text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-10 h-10 object-contain"
            />
          </div>

          <div>
            <h1 className="font-bold text-xl">SAJAG AI</h1>
            <p className="text-sm text-blue-200">Command Center</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-gray-400 text-sm mb-3">MAIN NAVIGATION</p>

        <ul className="space-y-2">
          <li>
            <NavLink to="/" className={navClass}>
              <FaTachometerAlt />
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink to="/live-map" className={navClass}>
              <FaMapMarkedAlt />
              Live Map
            </NavLink>
          </li>

          <li>
            <NavLink to="/incidents" className={navClass}>
              <FaExclamationTriangle />
              Incidents
            </NavLink>
          </li>

          <li>
            <NavLink to="/sos-alerts" className={navClass}>
              <FaFire />
              SOS Alerts
            </NavLink>
          </li>

          <li>
            <NavLink to="/rescue-teams" className={navClass}>
              <FaUsers />
              Rescue Teams
            </NavLink>
          </li>

          <li>
            <NavLink to="/operations" className={navClass}>
              <FaClipboardList />
              Operations
            </NavLink>
          </li>

          <li>
            <NavLink to="/heatmaps" className={navClass}>
              <FaFire />
              AI Predictive Heatmaps
            </NavLink>
          </li>

          <li>
            <NavLink to="/crowd-analytics" className={navClass}>
              <FaTrafficLight />
              Crowd Analytics
            </NavLink>
          </li>

          <li>
            <NavLink to="/traffic" className={navClass}>
              <FaTrafficLight />
              Traffic Analytics
            </NavLink>
          </li>

          <li>
            <NavLink to="/resources" className={navClass}>
              <FaBoxOpen />
              Resources
            </NavLink>
          </li>

          <li>
            <NavLink to="/reports" className={navClass}>
              <FaChartBar />
              Reports
            </NavLink>
          </li>

          <li>
            <NavLink to="/users" className={navClass}>
              <FaUserShield />
              Users
            </NavLink>
          </li>

          <li>
            <NavLink to="/communication" className={navClass}>
              <FaComments />
              Communications
            </NavLink>
          </li>

          <li>
            <NavLink to="/settings" className={navClass}>
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
