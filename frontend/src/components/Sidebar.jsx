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
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-[15px]
    ${isActive ? "bg-blue-700 text-white" : "text-gray-100 hover:bg-blue-800"}`;

  return (
    <div className="w-64 h-screen bg-[#0B1E46] text-white flex flex-col shrink-0 overflow-hidden">
      {/* Logo Section */}
      <div className="px-5 py-4 border-b border-blue-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-10 h-10 object-contain"
            />
          </div>

          <div>
            <h1 className="text-xl font-bold leading-none">SAJAG AI</h1>

            <p className="text-blue-200 text-sm mt-1">Command Center</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div
        className="flex-1 px-3 py-2 overflow-y-auto"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <p className="text-xs text-gray-400 mb-3 px-2 tracking-wide">
          MAIN NAVIGATION
        </p>

        <ul className="space-y-1">
          <li>
            <NavLink to="/" className={navClass}>
              <FaTachometerAlt size={15} />
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink to="/live-map" className={navClass}>
              <FaMapMarkedAlt size={15} />
              Live Map
            </NavLink>
          </li>

          <li>
            <NavLink to="/incidents" className={navClass}>
              <FaExclamationTriangle size={15} />
              Incidents
            </NavLink>
          </li>

          <li>
            <NavLink to="/sos-alerts" className={navClass}>
              <FaFire size={15} />
              SOS Alerts
            </NavLink>
          </li>

          <li>
            <NavLink to="/rescue-teams" className={navClass}>
              <FaUsers size={15} />
              Rescue Teams
            </NavLink>
          </li>

          <li>
            <NavLink to="/operations" className={navClass}>
              <FaClipboardList size={15} />
              Operations
            </NavLink>
          </li>

          <li>
            <NavLink to="/heatmaps" className={navClass}>
              <FaFire size={15} />
              AI Predictive Heatmaps
            </NavLink>
          </li>

          <li>
            <NavLink to="/crowd-analytics" className={navClass}>
              <FaTrafficLight size={15} />
              Crowd Analytics
            </NavLink>
          </li>

          {/* FIXED HERE */}
          <li>
            <NavLink to="/traffic-analytics" className={navClass}>
              <FaTrafficLight size={15} />
              Traffic Analytics
            </NavLink>
          </li>

          <li>
            <NavLink to="/resources" className={navClass}>
              <FaBoxOpen size={15} />
              Resources
            </NavLink>
          </li>

          <li>
            <NavLink to="/reports" className={navClass}>
              <FaChartBar size={15} />
              Reports
            </NavLink>
          </li>

          <li>
            <NavLink to="/users" className={navClass}>
              <FaUserShield size={15} />
              Users
            </NavLink>
          </li>

          <li>
            <NavLink to="/communications" className={navClass}>
              <FaComments size={15} />
              Communications
            </NavLink>
          </li>

          <li>
            <NavLink to="/settings" className={navClass}>
              <FaCog size={15} />
              Settings
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Hide Scrollbar */}
      <style>
        {`
          .overflow-y-auto::-webkit-scrollbar {
            width: 0px;
            display: none;
          }
        `}
      </style>
    </div>
  );
}

export default Sidebar;
