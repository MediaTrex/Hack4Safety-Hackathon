import { useState } from "react";
import {
  FaCog,
  FaMapMarkedAlt,
  FaBell,
  FaShieldAlt,
  FaLanguage,
  FaDatabase,
  FaCloudUploadAlt,
} from "react-icons/fa";

function Settings() {
  const menus = [
    { name: "General Settings", icon: <FaCog /> },
    { name: "Map Settings", icon: <FaMapMarkedAlt /> },
    { name: "Alert Settings", icon: <FaBell /> },
    { name: "Notification Settings", icon: <FaBell /> },
    { name: "Security Settings", icon: <FaShieldAlt /> },
    { name: "Language Settings", icon: <FaLanguage /> },
    { name: "Backup & Restore", icon: <FaCloudUploadAlt /> },
    { name: "API Integrations", icon: <FaDatabase /> },
  ];

  const [activeMenu, setActiveMenu] = useState("General Settings");

  const [formData, setFormData] = useState({
    organization: "Nepal Police",
    platform: "SAJAG AI",
    timezone: "(UTC+05:45) Kathmandu",
    dateFormat: "May 23, 2025",
    timeFormat: "12 Hour (AM/PM)",
    language: "English",
    itemsPerPage: "10",
  });

  const [platformSettings, setPlatformSettings] = useState({
    realtime: true,
    push: true,
    email: true,
    sms: false,
    offline: true,
    analytics: true,
    ai: true,
    backup: true,
  });

  const [retention, setRetention] = useState({
    incidents: "2 Years",
    activity: "1 Year",
    logs: "6 Months",
  });

  const saveSettings = () => {
    alert("Settings Saved Successfully");
  };

  const updateRetention = () => {
    alert("Retention Updated Successfully");
  };

  const toggleSetting = (key) => {
    setPlatformSettings({
      ...platformSettings,
      [key]: !platformSettings[key],
    });
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>

        <p className="text-gray-500">
          Manage system settings and configurations
        </p>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT MENU */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-2xl border p-3">
            <div className="space-y-2">
              {menus.map((menu) => (
                <button
                  key={menu.name}
                  onClick={() => setActiveMenu(menu.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                    activeMenu === menu.name
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {menu.icon}
                  {menu.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER FORM */}
        <div className="col-span-12 lg:col-span-5">
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="text-xl font-semibold mb-5">{activeMenu}</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">
                  Organization Name
                </label>

                <input
                  value={formData.organization}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      organization: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-4 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">Platform Name</label>

                <input
                  value={formData.platform}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      platform: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-4 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">Time Zone</label>

                <select
                  className="w-full border rounded-lg px-4 py-2 mt-1"
                  value={formData.timezone}
                >
                  <option>(UTC+05:45) Kathmandu</option>
                  <option>UTC</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-500">Date Format</label>

                <select className="w-full border rounded-lg px-4 py-2 mt-1">
                  <option>May 23, 2025</option>
                  <option>23/05/2025</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-500">Time Format</label>

                <select className="w-full border rounded-lg px-4 py-2 mt-1">
                  <option>12 Hour (AM/PM)</option>
                  <option>24 Hour</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-500">
                  Default Language
                </label>

                <select className="w-full border rounded-lg px-4 py-2 mt-1">
                  <option>English</option>
                  <option>Nepali</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-500">Items Per Page</label>

                <select className="w-full border rounded-lg px-4 py-2 mt-1">
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
              </div>

              <button
                onClick={saveSettings}
                className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* TOGGLES */}
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="text-xl font-semibold mb-5">Platform Settings</h2>

            {[
              ["Enable Real-time Updates", "realtime"],
              ["Enable Push Notifications", "push"],
              ["Enable Email Notifications", "email"],
              ["Enable SMS Alerts", "sms"],
              ["Enable Offline Mode", "offline"],
              ["Enable Data Analytics", "analytics"],
              ["Enable AI Predictions", "ai"],
              ["Enable Auto Backup", "backup"],
            ].map(([label, key]) => (
              <div key={key} className="flex justify-between items-center py-2">
                <span>{label}</span>

                <button
                  onClick={() => toggleSetting(key)}
                  className={`w-12 h-6 rounded-full relative transition ${
                    platformSettings[key] ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                      platformSettings[key] ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* DATA RETENTION */}
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="text-xl font-semibold mb-5">Data Retention</h2>

            <div className="space-y-4">
              <div>
                <label>Incident Data</label>

                <select
                  className="w-full border rounded-lg px-4 py-2 mt-1"
                  value={retention.incidents}
                  onChange={(e) =>
                    setRetention({
                      ...retention,
                      incidents: e.target.value,
                    })
                  }
                >
                  <option>2 Years</option>
                  <option>5 Years</option>
                </select>
              </div>

              <div>
                <label>User Activity Logs</label>

                <select
                  className="w-full border rounded-lg px-4 py-2 mt-1"
                  value={retention.activity}
                  onChange={(e) =>
                    setRetention({
                      ...retention,
                      activity: e.target.value,
                    })
                  }
                >
                  <option>1 Year</option>
                  <option>2 Years</option>
                </select>
              </div>

              <div>
                <label>System Logs</label>

                <select
                  className="w-full border rounded-lg px-4 py-2 mt-1"
                  value={retention.logs}
                  onChange={(e) =>
                    setRetention({
                      ...retention,
                      logs: e.target.value,
                    })
                  }
                >
                  <option>6 Months</option>
                  <option>12 Months</option>
                </select>
              </div>

              <button
                onClick={updateRetention}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
              >
                Update Retention
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

export default Settings;
>>>>>>> origin/master
