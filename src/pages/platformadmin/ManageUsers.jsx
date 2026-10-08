import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Users, Mail, Building2, Shield, Factory } from "lucide-react";
import api from "../../utils/api";
import Loader from "../../components/rf/Loader";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
import { toast } from "sonner";
import { getDisplayRoleLabel, getSiteUnitLabel, isServiceSectorIndustry } from "../../utils/uiTerminology";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "ORG_ADMIN",
    organizationId: "",
    facilityId: "",
  });
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  const ROLES = [
    { value: "HEAD", label: "Head" },
    { value: "REGION_ADMIN", label: "Region Admin" },
    { value: "ORG_ADMIN", label: "Organization Admin" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, orgsRes, facilitiesRes] = await Promise.all([api.get("/api/users"), api.get("/api/organizations?page=1&limit=1000&sortBy=name&sortOrder=asc"), api.get("/api/facilities")]);

      console.log("Raw users response:", usersRes.data);
      console.log("Raw orgs response:", orgsRes.data);
      console.log("Raw facilities response:", facilitiesRes.data);

      // Handle different API response structures
      const usersData = usersRes.data?.data?.users || usersRes.data?.data || usersRes.data || [];

      let orgsData = [];
      if (Array.isArray(orgsRes.data)) {
        orgsData = orgsRes.data;
      } else if (Array.isArray(orgsRes.data?.data?.organizations)) {
        orgsData = orgsRes.data.data.organizations;
      } else if (Array.isArray(orgsRes.data?.data)) {
        orgsData = orgsRes.data.data;
      } else if (Array.isArray(orgsRes.data?.organizations)) {
        orgsData = orgsRes.data.organizations;
      }

      const facilitiesData = facilitiesRes.data?.data?.facilities || facilitiesRes.data?.data || facilitiesRes.data || [];

      console.log("Processed users:", usersData);
      console.log("Processed organizations:", orgsData);
      console.log("Processed facilities:", facilitiesData);

      setUsers(Array.isArray(usersData) ? usersData : []);
      setOrganizations(Array.isArray(orgsData) ? orgsData : []);
      setFacilities(Array.isArray(facilitiesData) ? facilitiesData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      console.error("Error response:", error.response?.data);
      setUsers([]);
      setOrganizations([]);
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...formData };
      if (editingUser) {
        // Don't send password if not changed
        if (!payload.password) delete payload.password;
        await api.put(`/api/users/${editingUser._id}`, payload);
      } else {
        await api.post("/api/users/register", payload);
      }
      fetchData();
      closeModal();
    } catch (error) {
      setError(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/users/${deleteId}`);
      fetchData();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      setDeleteError(error.response?.data?.message || "Delete failed");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
    setDeleteError("");
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
        role: user.role || "ORG_ADMIN",
        organizationId: user.organizationId?._id || user.organizationId || "",
        facilityId: user.facilityId?._id || user.facilityId || "",
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        email: "",
        role: "ORG_ADMIN",
        organizationId: "",
        facilityId: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: "",
      email: "",
      role: "ORG_ADMIN",
      organizationId: "",
      facilityId: "",
    });
    setError("");
  };

  const handleResetPassword = async () => {
    if (!editingUser) return;
    try {
      setResettingPassword(true);
      await api.post(`/api/users/${editingUser._id}/reset-password`);
      toast.success("Password reset email sent to user!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setResettingPassword(false);
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      GOD_MODE: "bg-red-200 text-red-900",
      PLATFORM_ADMIN: "bg-orange-100 text-orange-800",
      MAINTAINER: "bg-cyan-100 text-cyan-800",
      ORG_ADMIN: "bg-blue-100 text-blue-800",
      REGION_ADMIN: "bg-indigo-100 text-indigo-800",
      HEAD: "bg-indigo-100 text-indigo-800",
      PLANT_ADMIN: "bg-purple-100 text-purple-800",
      ENERGY_MANAGER: "bg-green-100 text-green-800",
      AUDITOR: "bg-gray-100 text-gray-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const filteredUsers = users.filter((user) => user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredFacilities = formData.organizationId
    ? facilities.filter((f) => {
        const orgId = f.organizationId?._id || f.organizationId;
        return orgId === formData.organizationId;
      })
    : facilities;

  const selectedOrganization = organizations.find((org) => org._id === formData.organizationId);
  const selectedOrgIndustry = selectedOrganization?.industry || "";
  const isServiceSectorOrg = isServiceSectorIndustry(selectedOrgIndustry);
  const siteUnitLabel = getSiteUnitLabel(selectedOrgIndustry);
  const creatableRoles = isServiceSectorOrg ? ROLES : ROLES.filter((role) => role.value === "ORG_ADMIN");

  const getUserIndustry = (user) => {
    const userOrg = user?.organizationId;
    if (typeof userOrg === "object") {
      return userOrg?.industry || "";
    }
    const userOrgId = String(userOrg || "");
    const matchedOrg = organizations.find((org) => String(org._id || "") === userOrgId);
    return matchedOrg?.industry || "";
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 mb-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-green-200 to-green-700 p-3 rounded-xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Users</h1>
            <p className="text-md text-gray-500">Manage all users (Organization Admins) in the system</p>
          </div>
        </div>

        <div className="flex  items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 transition-all min-w-[280px]"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-200"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Table */}
      <TooltipProvider>
        {/* Table Section */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full text-left border-collapse">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">User Identity</th>

                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">Contact Info</th>

                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">Role & Access</th>

                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">Organization</th>

                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                          <Users className="w-8 h-8 text-gray-300" />
                        </div>

                        <h3 className="text-md font-medium text-gray-900">No users found</h3>

                        <p className="text-sm text-gray-400 mt-1">Try adding a new user to the system</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50/80 transition-colors group">
                      {/* Username Column with Avatar */}

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                            {(user.username || "UN").substring(0, 2).toUpperCase()}
                          </div>

                          <span className="text-sm font-medium text-gray-900 group-hover:text-green-700 transition-colors">{user.username}</span>
                        </div>
                      </td>

                      {/* Email Column */}

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </td>

                      {/* Role Column */}

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                          {getDisplayRoleLabel(user.role, getUserIndustry(user))}
                        </span>
                      </td>

                      {/* Organization Column */}

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-sm">{user.organizationId?.name || "N/A"}</span>
                        </div>

                        {user.facilityId && <div className="flex items-center gap-2 text-gray-400 text-xs mt-1 pl-5">{user.facilityId.facilityName || siteUnitLabel}</div>}
                      </td>

                      {/* Actions Column */}

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={() => openModal(user)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                <Edit className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>

                            <TooltipContent>
                              <p>Edit User</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={() => handleDelete(user._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>

                            <TooltipContent>
                              <p>Delete User</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </TooltipProvider>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop with Blur */}
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={closeModal} />
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden relative z-10 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{editingUser ? "Edit User" : "New User"}</h2>
                <p className="text-sm text-gray-500 mt-1">{editingUser ? "Update user account details" : "Create a new user account"}</p>
              </div>
              <button onClick={closeModal} className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            {/* Form Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-8 py-6">
              {error && (
                <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} id="user-form">
                <div className="space-y-6">
                  {/* Account Information */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">Account Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          placeholder="Enter username"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          placeholder="user@example.com"
                          required
                        />
                      </div>
                      {editingUser && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Security</label>
                          <button
                            type="button"
                            onClick={handleResetPassword}
                            disabled={resettingPassword}
                            className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            <Shield className="w-4 h-4" />
                            {resettingPassword ? "Sending..." : "Generate New Password & Send Email"}
                          </button>
                          <p className="mt-2 text-xs text-gray-400">This will invalidate the current password and email a reset link to the user.</p>
                        </div>
                      )}
                      {!editingUser && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                          <p className="text-sm text-blue-700">🔑 A secure password will be auto-generated and emailed to the user.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Role & Organization */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">Role & Organization</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          required
                        >
                          {creatableRoles.map((role) => (
                            <option key={role.value} value={role.value}>
                              {getDisplayRoleLabel(role.value, selectedOrgIndustry)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.organizationId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              organizationId: e.target.value,
                              facilityId: "",
                            })
                          }
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          required
                        >
                          <option value="">Select an organization</option>
                          {organizations.map((org) => (
                            <option key={org._id} value={org._id}>
                              {org.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {(formData.role === "PLANT_ADMIN" || formData.role === "ENERGY_MANAGER") && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{siteUnitLabel}</label>
                          <select
                            value={formData.facilityId}
                            onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          >
                            <option value="">Select a {siteUnitLabel.toLowerCase()} (optional)</option>
                            {filteredFacilities.map((facility) => (
                              <option key={facility._id} value={facility._id}>
                                {facility.facilityName || facility.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="user-form"
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-200 transition-all active:scale-95"
              >
                {editingUser ? "Update User" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={cancelDelete} />
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative z-10 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            {deleteError && (
              <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5" />
                <span className="text-sm font-medium">{deleteError}</span>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={cancelDelete} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200">
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
