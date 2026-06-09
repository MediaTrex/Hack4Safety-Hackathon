import { FaBell } from "react-icons/fa";

function Topbar({ title }) {
  // ✅ Define functions outside of return
  const handleLanguage = () => {
    alert("Language Changed");
  };

  const handleNotifications = () => {
    alert("Notifications");
  };

  return (
    <div className="bg-white px-8 py-5 border-b">
      <div className="flex justify-between items-center">
        {/* Left side: Title and subtitle */}
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-gray-500">
            Real-time overview of disaster response operations
          </p>
        </div>

        {/* Right side: Buttons */}
        <div className="flex gap-4 items-center">
          <button
            onClick={handleNotifications}
            className="text-yellow-500 text-2xl"
          >
            <FaBell />
          </button>

          <button
            className="bg-gray-100 px-4 py-2 rounded"
            onClick={handleLanguage}
          >
            English
          </button>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
