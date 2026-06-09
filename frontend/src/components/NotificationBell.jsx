import { useState } from "react";
import { FaBell } from "react-icons/fa";

function NotificationBell() {
  const [show, setShow] = useState(false);

  const notifications = [
    "Flood Risk Alert - Kathmandu",
    "Landslide Warning - Pokhara",
    "Crowd Density High - Tinkune",
  ];

  return (
    <div className="relative">
      <button onClick={() => setShow(!show)}>
        <FaBell className="text-xl text-gray-700" />
      </button>

      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
        {notifications.length}
      </span>

      {show && (
        <div className="absolute right-0 mt-3 bg-white shadow-lg rounded-lg w-72 z-50">
          <div className="p-4 font-bold border-b">Notifications</div>

          {notifications.map((item, index) => (
            <div key={index} className="p-3 border-b hover:bg-gray-50">
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
