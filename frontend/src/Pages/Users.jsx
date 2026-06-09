import { FaEdit, FaEye, FaEllipsisH, FaPlus } from "react-icons/fa";

import { useState } from "react";

function Users() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All Roles");
  const [status, setStatus] = useState("All Status");

  const [users, setUsers] = useState([
    {
      id: "USR-001",
      name: "Inspector Sharma",
      role: "Administrator",
      status: "Active",
    },
    {
      id: "USR-002",
      name: "ASI Ramesh",
      role: "Rescue Team",
      status: "Active",
    },
    {
      id: "USR-003",
      name: "Citizen Ram",
      role: "Citizen",
      status: "Inactive",
    },
  ]);

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase());

    const matchRole = role === "All Roles" || u.role === role;

    const matchStatus = status === "All Status" || u.status === status;

    return matchSearch && matchRole && matchStatus;
  });

  const addUser = () => {
    const name = prompt("Enter User Name");

    if (!name) return;

    setUsers([
      ...users,
      {
        id: `USR-${String(users.length + 1).padStart(3, "0")}`,
        name,
        role: "Citizen",
        status: "Active",
      },
    ]);
  };

  return (
    <div className="space-y-5">
      {/* Top */}
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>

          <p className="text-gray-500 text-sm">Manage users and roles</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 border rounded-lg px-4"
          />

          <select
            className="h-10 border rounded-lg px-4"
            onChange={(e) => setRole(e.target.value)}
          >
            <option>All Roles</option>
            <option>Administrator</option>
            <option>Rescue Team</option>
            <option>Citizen</option>
          </select>

          <select
            className="h-10 border rounded-lg px-4"
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <button
            onClick={addUser}
            className="h-10 px-4 bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <FaPlus />
            Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          ["Total Users", "156", "text-blue-600"],
          ["Rescue Team", "65", "text-blue-600"],
          ["Administrators", "18", "text-blue-600"],
          ["Citizens", "73", "text-blue-600"],
          ["Active Users", "142", "text-green-600"],
        ].map((card) => (
          <div key={card[0]} className="bg-white border rounded-xl p-4">
            <p className="text-sm text-gray-500">{card[0]}</p>

            <h2 className={`text-3xl font-semibold ${card[2]}`}>{card[1]}</h2>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left">User ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-4 text-blue-600">{user.id}</td>

                <td>{user.name}</td>

                <td>
                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs">
                    {user.role}
                  </span>
                </td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                <td>
                  <div className="flex justify-center gap-4">
                    <FaEdit
                      onClick={() => alert(`Editing ${user.name}`)}
                      className="cursor-pointer text-blue-600"
                    />

                    <FaEye
                      onClick={() => alert(`Viewing ${user.name}`)}
                      className="cursor-pointer text-green-600"
                    />

                    <FaEllipsisH
                      onClick={() => alert(`More options for ${user.name}`)}
                      className="cursor-pointer"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
