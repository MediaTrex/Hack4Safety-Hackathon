import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const notifications = [
  {
    id: 1,
    type: "sos",
    title: "New SOS Alert Received",
    message: "Family trapped due to flood in Butwal-11, Rupandehi.",
    time: "2 min ago",
    priority: "high",
    isRead: false,
    redirectTo: "/sos-alerts",
    icon: "",
  },

  {
    id: 2,
    type: "rescue",
    title: "Rescue Team Reached Location",
    message: "Butwal Rescue APF Team has reached the victim location.",
    time: "5 min ago",
    priority: "medium",
    isRead: false,
    redirectTo: "/rescue-teams",
    icon: "",
  },

  {
    id: 3,
    type: "incident",
    title: "New Incident Report Created",
    message: "Landslide reported near Tansen Highway, Palpa.",
    time: "10 min ago",
    priority: "medium",
    isRead: true,
    redirectTo: "/incidents",
    icon: "",
  },

  {
    id: 4,
    type: "operation",
    title: "Operation Assigned",
    message: "Flood Rescue Operation assigned to Butwal Rescue Unit 3.",
    time: "15 min ago",
    priority: "high",
    isRead: false,
    redirectTo: "/operations",
    icon: "",
  },

  {
    id: 5,
    type: "team",
    title: "Team Status Updated",
    message: "Palpa Rescue Team marked status as 'On The Way'.",
    time: "18 min ago",
    priority: "low",
    isRead: true,
    redirectTo: "/rescue-teams",
    icon: "",
  },

  {
    id: 6,
    type: "heatmap",
    title: "AI Risk Alert",
    message: "High flood risk detected around Tinau River corridor.",
    time: "22 min ago",
    priority: "high",
    isRead: false,
    redirectTo: "/ai-heatmaps",
    icon: "",
  },

  {
    id: 7,
    type: "traffic",
    title: "Traffic Congestion Alert",
    message: "Heavy traffic reported on Siddhartha Highway.",
    time: "45 min ago",
    priority: "low",
    isRead: true,
    redirectTo: "/traffic-analytics",
    icon: "",
  },

  {
    id: 8,
    type: "report",
    title: "Daily Incident Report Generated",
    message: "Daily disaster response report is ready for review.",
    time: "2 hr ago",
    priority: "low",
    isRead: true,
    redirectTo: "/reports",
    icon: "",
  },
];

export default function Topbar({ title, subtitle }) {
  const navigate = useNavigate();

  const [language, setLanguage] = useState("en");
  const [allNotifications, setAllNotifications] = useState(notifications);

  const [showNotifications, setShowNotifications] = useState(false);

  const now = new Date();

  const dateStr = now.toLocaleDateString("en-US", {
    timeZone: "Asia/Kathmandu",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const timeStr = now.toLocaleTimeString("en-US", {
    timeZone: "Asia/Kathmandu",
    hour: "2-digit",
    minute: "2-digit",
  });

  const removeNotification = (id) => {
    setAllNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const markAsRead = (id) => {
    setAllNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    );
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    navigate(notification.redirectTo);
  };

  const unreadCount = allNotifications.filter((item) => !item.isRead).length;

  return (
    <div className="h-[70px] bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
      <div className="py-1">
        <h1 className="text-[18px] font-bold text-gray-700 leading-tight tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {/* Sleek date/time pill */}
        <div className="flex items-center gap-2 text-[11px] text-gray-600 bg-gray-50 rounded-full px-4 py-1.5 border border-gray-200 shadow-sm">
          <svg
            className="w-3.5 h-3.5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{dateStr}</span>
          <span className="text-gray-500 mx-0.5">·</span>
          <svg
            className="w-3.5 h-3.5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium text-gray-600">{timeStr}</span>
        </div>

        {/* Language dropdown */}
        <div className="relative flex items-center gap-1.5 bg-gray-50 rounded-full px-3.5 py-1.5 border border-gray-200 text-[11px] text-gray-600 cursor-pointer hover:bg-gray-300 hover:border-gray-200 transition-all shadow-sm">
          <svg
            className="w-3.5 h-3.5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>

          <span>{language === "en" ? "English" : "नेपाली"}</span>

          <svg
            className="w-3 h-3 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          >
            <option value="en">English</option>
            <option value="ne">Nepali</option>
          </select>
        </div>

        {/* Notification bell */}

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-full hover:bg-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-gray-500"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-1 w-[320px] bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-700">Notifications</h3>

                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-[450px] overflow-y-auto">
                {allNotifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No notifications available
                  </div>
                ) : (
                  allNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-all ${
                        !notification.isRead ? "bg-blue-50" : "bg-white"
                      }`}
                    >
                      <div className="flex justify-between gap-3">
                        <div className="flex gap-3 flex-1">
                          <div className="text-xl">{notification.icon}</div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm text-gray-800">
                                {notification.title}
                              </h4>

                              {!notification.isRead && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>

                            <p className="text-xs text-gray-500 mt-1">
                              {notification.message}
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] text-gray-400">
                                {notification.time}
                              </span>

                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                  notification.priority === "high"
                                    ? "bg-red-100 text-red-600"
                                    : notification.priority === "medium"
                                      ? "bg-orange-100 text-orange-600"
                                      : "bg-green-100 text-green-600"
                                }`}
                              >
                                {notification.priority}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 border-t bg-gray-50">
                <button
                  onClick={() => navigate("/notifications")}
                  className="w-full text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      
    </div>
  );
}
