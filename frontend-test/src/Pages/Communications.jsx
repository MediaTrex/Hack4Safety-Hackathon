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

<<<<<<< HEAD
        {/* Right: Chat */}
        <div className="flex-1 bg-white rounded-xl shadow-card flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 pt-3 border-b flex-shrink-0">
            {['Messages','Broadcasts','Voice Messages','Announcements'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 text-sm transition border-b-2 ${activeTab === t ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t}</button>
            ))}
            <div className="ml-auto flex items-center gap-2 mb-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
                <input placeholder="Search messages..." className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none" />
              </div>
              <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
                <option>All Channels</option>
              </select>
              <button className="bg-[#1a3a6b] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#0f2347]">
                ＋ New Message
              </button>
            </div>
          </div>

          {/* Chat Header */}
          <div className="flex items-center gap-3 px-4 py-2 border-b bg-gray-50 flex-shrink-0">
            <div className={`w-8 h-8 rounded-full ${channel?.color || 'bg-blue-600'} flex items-center justify-center text-white text-xs font-bold relative`}>
              {channel?.name?.charAt(0)}
              {channel?.online && <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-white" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{channel?.name}</p>
              <p className="text-[10px] text-green-500">● Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.isOwn ? 'flex-row-reverse' : ''}`}>
                {!m.isOwn && (
                  <div className={`w-7 h-7 rounded-full ${channel?.color || 'bg-blue-600'} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                    {m.from.charAt(0)}
                  </div>
                )}
                <div className={`max-w-xs ${m.isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!m.isOwn && <p className="text-[10px] text-gray-500 mb-0.5">{m.from}</p>}
                  <div className={`px-3 py-2 rounded-xl text-xs ${m.isOwn ? 'bg-[#1a3a6b] text-white rounded-tr-none' : 'bg-gray-100 text-gray-700 rounded-tl-none'}`}>
                    {m.msg}
                  </div>
                  <p className="text-[9px] text-gray-400 mt-0.5">{m.time}</p>
=======
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
>>>>>>> origin/master
                </div>
              </div>
            ))}
          </div>

<<<<<<< HEAD
          {/* Input */}
          <div className="flex items-center gap-2 p-3 border-t flex-shrink-0">
            <input
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setNewMsg('')}
              placeholder="Type a message..."
              className="flex-1 text-sm border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            />
            <button className="text-xl">😊</button>
            <button onClick={() => setNewMsg('')} className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 text-sm">
              ➤
=======
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
>>>>>>> origin/master
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

export default Communications;
>>>>>>> origin/master
