import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { toast } from "sonner";
import { Search, Plus, RefreshCcw, Trash2, Shield, UserCog, X, ChevronDown } from "lucide-react";

const ALL_ROLES = ["GOD_MODE", "PLATFORM_ADMIN", "MAINTAINER", "ORG_ADMIN", "PLANT_ADMIN", "ENERGY_MANAGER", "AUDITOR"];

const STATUSES = ["active", "inactive", "suspended"];

const roleBadgeColor = (role) => {
  const colors = {
    GOD_MODE: "bg-red-900 text-red-200",
    PLATFORM_ADMIN: "bg-red-100 text-red-800",
    MAINTAINER: "bg-cyan-100 text-cyan-800",
    ORG_ADMIN: "bg-blue-100 text-blue-800",
    PLANT_ADMIN: "bg-green-100 text-green-800",
    ENERGY_MANAGER: "bg-orange-100 text-orange-800",
    AUDITOR: "bg-gray-100 text-gray-800",
  };
  return colors[role] || "bg-gray-100 text-gray-800";
};

const statusColor = (status) => {
  if (status === "active") return "bg-green-100 text-green-700";
  if (status === "suspended") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
};

const GodModeUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [roleChangeUser, setRoleChangeUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [createForm, setCreateForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "ORG_ADMIN",
    organizationId: "",
  });

  const fetchUsers = async (searchQuery = "", role = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (role) params.set("role", role);
      const res = await api.get(`/api/god/users?${params.toString()}`);
      setUsers(res.data?.data?.users || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(search, roleFilter);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createForm.username || !createForm.password || !createForm.role) {
      toast.error("Username, password, and role are required");
      return;
    }
    setActionLoading("create");
    try {
      await api.post("/api/god/users", {
        ...createForm,
        organizationId: createForm.organizationId || undefined,
      });
      toast.success("User created successfully");
      setShowCreateModal(false);
      setCreateForm({ username: "", email: "", password: "", role: "ORG_ADMIN", organizationId: "" });
      fetchUsers(search, roleFilter);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeRole = async (userId) => {
    if (!newRole) return;
    setActionLoading(userId);
    try {
      await api.patch(`/api/god/users/${userId}/role`, { role: newRole });
      toast.success(`Role changed to ${newRole}`);
      setRoleChangeUser(null);
      setNewRole("");
      fetchUsers(search, roleFilter);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change role");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    setActionLoading(userId);
    try {
      await api.patch(`/api/god/users/${userId}/status`, { status: nextStatus });
      toast.success(`Status changed to ${nextStatus}`);
      fetchUsers(search, roleFilter);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId, username) => {
    if (!confirm(`Delete user "${username}"? This action is irreversible.`)) return;
    setActionLoading(userId);
    try {
      await api.delete(`/api/god/users/${userId}`);
      toast.success("User deleted");
      fetchUsers(search, roleFilter);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-6 h-6 text-red-600" />
            <h1 className="text-2xl font-bold">All System Users (God Mode)</h1>
          </div>
          <p className="text-sm text-gray-500">
            {users.length} user{users.length !== 1 ? "s" : ""} loaded
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchUsers(search, roleFilter)} className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
            <Plus className="w-4 h-4" /> Create User
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username, email..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            fetchUsers(search, e.target.value);
          }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">All Roles</option>
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
          Search
        </button>
      </form>

      {/* Users Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Username</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Organization</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{u.username}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.email || "—"}</td>
                    <td className="px-4 py-3">
                      {roleChangeUser === u._id ? (
                        <div className="flex items-center gap-1">
                          <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="border rounded px-1.5 py-1 text-xs">
                            <option value="">Select</option>
                            {ALL_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleChangeRole(u._id)}
                            disabled={!newRole || actionLoading === u._id}
                            className="text-xs px-2 py-1 bg-green-600 text-white rounded disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setRoleChangeUser(null);
                              setNewRole("");
                            }}
                            className="text-xs px-1.5 py-1 bg-gray-200 text-gray-700 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setRoleChangeUser(u._id);
                            setNewRole(u.role);
                          }}
                          className={`text-xs px-2 py-1 rounded-full font-medium ${roleBadgeColor(u.role)} hover:opacity-80 cursor-pointer`}
                          title="Click to change role"
                        >
                          {u.role}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(u._id, u.status)}
                        disabled={actionLoading === u._id}
                        className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(u.status)} hover:opacity-80 cursor-pointer disabled:opacity-50`}
                        title="Click to toggle status"
                      >
                        {u.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.organizationId?.name || u.organizationId?.companyName || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(u._id, u.username)}
                        disabled={actionLoading === u._id}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Create User (God Mode)</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization ID (optional)</label>
                <input
                  type="text"
                  value={createForm.organizationId}
                  onChange={(e) => setCreateForm({ ...createForm, organizationId: e.target.value })}
                  placeholder="MongoDB ObjectId"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={actionLoading === "create"} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50">
                  {actionLoading === "create" ? "Creating..." : "Create User"}
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GodModeUsers;
