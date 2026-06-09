import { useState } from "react";
import { FaPaperPlane, FaPlus, FaSearch, FaComments } from "react-icons/fa";

function Communications() {
  const channels = [
    "Control Room",
    "All Rescue Teams",
    "Butwal Unit 3",
    "Palpa Unit 1",
    "Kapilvastu Unit 2",
    "Traffic Control",
    "Medical Teams",
  ];

  const [selectedChannel, setSelectedChannel] = useState("Control Room");

  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "Control Room",
      text: "Heavy rainfall expected in Butwal area. All teams be alert.",
      time: "10:24 AM",
    },
    {
      sender: "Butwal Unit 3",
      text: "Received. We are on standby.",
      time: "10:25 AM",
    },
    {
      sender: "Palpa Unit 1",
      text: "Copy that. Moving to high alert.",
      time: "10:26 AM",
    },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      sender: "You",
      text: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);

    setMessage("");
  };

  const createNewMessage = () => {
    const msg = prompt("Enter broadcast message");

    if (!msg) return;

    setMessages([
      ...messages,
      {
        sender: "Control Room",
        text: msg,
        time: "Now",
      },
    ]);
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.text.toLowerCase().includes(search.toLowerCase()) ||
      msg.sender.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Communications
          </h1>

          <p className="text-sm text-gray-500">
            Real-time communication and announcements
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400 text-sm" />

            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9 pr-4 border rounded-lg text-sm outline-none"
            />
          </div>

          {/* Dropdown */}
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="h-10 border rounded-lg px-4 text-sm"
          >
            {channels.map((channel) => (
              <option key={channel}>{channel}</option>
            ))}
          </select>

          {/* New Message */}
          <button
            onClick={createNewMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg flex items-center gap-2 text-sm"
          >
            <FaPlus />
            New Message
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid lg:grid-cols-12 gap-4">
        {/* Channels */}
        <div className="lg:col-span-3 bg-white border rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-4">CHANNELS</h3>

          <div className="space-y-2">
            {channels.map((channel) => (
              <div
                key={channel}
                onClick={() => setSelectedChannel(channel)}
                className={`p-3 rounded-lg cursor-pointer text-sm flex items-center gap-3 ${
                  selectedChannel === channel
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                <FaComments />
                {channel}
              </div>
            ))}
          </div>
        </div>

        {/* Message List */}
        <div className="lg:col-span-4 bg-white border rounded-xl overflow-hidden">
          <div className="p-4 border-b font-medium">{selectedChannel}</div>

          <div className="max-h-[600px] overflow-y-auto">
            {filteredMessages.map((msg, index) => (
              <div key={index} className="p-4 border-b hover:bg-gray-50">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-sm">{msg.sender}</span>

                  <span className="text-xs text-gray-500">{msg.time}</span>
                </div>

                <p className="text-sm text-gray-600">{msg.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-5 bg-white border rounded-xl flex flex-col">
          <div className="p-4 border-b font-medium">{selectedChannel}</div>

          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {filteredMessages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[75%] px-4 py-3 rounded-xl text-sm ${
                  msg.sender === "You"
                    ? "bg-blue-600 text-white ml-auto"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <p>{msg.text}</p>

                <div
                  className={`text-xs mt-2 ${
                    msg.sender === "You" ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {msg.time}
                </div>
              </div>
            ))}
          </div>

          {/* Send Message */}
          <div className="border-t p-4 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 border rounded-lg px-4 py-2 text-sm outline-none"
            />

            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Communications;
