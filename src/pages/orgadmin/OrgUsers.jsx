import React, { useState, useEffect } from "react";
import { Edit, Trash2, Users, Search, Shield } from "lucide-react";
import { toast } from "sonner";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import SectionHeader from "../../components/rf/Header";
import Loader from "../../components/rf/Loader";
import ConfirmModal from "../../components/modals/ConfirmModal";
import { getDisplayRoleLabel, getSiteUnitLabel, isServiceSectorIndustry } from "../../utils/uiTerminology";

const OrgUsers = () => {
  const { user } = useAuth();
  const organizationId = user?.organizationId?._id || user?.organizationId || "";
  const userIndustry = user?.organizationId?.industry || user?.organizationIndustry || "";
  const [resolvedIndustry, setResolvedIndustry] = useState(userIndustry);
  const industry = resolvedIndustry || userIndustry;
  const siteUnitLabel = getSiteUnitLabel(industry, "singular", user?.role);
  const siteUnitPluralLabel = getSiteUnitLabel(industry, "plural", user?.role);
  const isHeadRole = user?.role === "HEAD";
  const isRegionAdminRole = user?.role === "REGION_ADMIN";
  const isTopHierarchyRole = isHeadRole;
  const isServiceSector = isServiceSectorIndustry(industry);
  const managedRole = isHeadRole ? "REGION_ADMIN" : isRegionAdminRole ? "PLANT_ADMIN" : "PLANT_ADMIN";
  const usesBranchTerms = siteUnitLabel === "Branch";
  const plantAdminTitle = isHeadRole ? "Regional Manager" : isRegionAdminRole ? "Branch Admin" : usesBranchTerms ? "Branch Admin" : "Facility Admin";
  const plantAdminTitlePlural = isHeadRole ? "Regional Managers" : isRegionAdminRole ? "Branch Admins" : usesBranchTerms ? "Branch Admins" : "Facility Admins";
  const [users, setUsers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingUserFacilityId, setEditingUserFacilityId] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: managedRole,
    facilityId: "",
  });
  const [error, setError] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Roles that Org Admin can create
  const ROLES = [{ value: managedRole, label: plantAdminTitle }];

  useEffect(() => {
    fetchData();
  }, [organizationId]);

  useEffect(() => {
    const fetchOrganizationIndustry = async () => {
      if (!organizationId) return;

      try {
        const res = await api.get(`/api/organizations/${organizationId}`);
        const org = res.data?.data || res.data;
        if (org?.industry) {
          setResolvedIndustry(org.industry);
        }
      } catch (error) {
        console.error("Error fetching organization industry:", error);
      }
    };

    fetchOrganizationIndustry();
  }, [organizationId]);

  const fetchData = async () => {
    try {
      if (!organizationId) {
        setUsers([]);
        setFacilities([]);
        return;
      }

      const [usersRes, facilitiesRes] = await Promise.all([api.get(`/api/users?organizationId=${organizationId}`), api.get(`/api/facilities?organizationId=${organizationId}`)]);

      console.log("Users response:", usersRes.data);
      console.log("Facilities response:", facilitiesRes.data);

      // Handle different API response structures
      const usersData = usersRes.data?.data?.users || usersRes.data?.data || usersRes.data || [];
      const facilitiesData = facilitiesRes.data?.data?.facilities || facilitiesRes.data?.data || facilitiesRes.data || [];

      setUsers(Array.isArray(usersData) ? usersData : []);
      setFacilities(Array.isArray(facilitiesData) ? facilitiesData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setUsers([]);
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...formData,
        role: managedRole,
        organizationId,
      };

      if (editingUser) {
        // Don't send password if not changed
        if (!payload.password) delete payload.password;
        await api.put(`/api/users/${editingUser._id}`, payload);

        if (!isTopHierarchyRole && payload.facilityId) {
          await api.put(`/api/facilities/${payload.facilityId}`, {
            facilityHeads: [
              {
                name: payload.username,
                email: payload.email,
              },
            ],
          });
        }

        if (!isTopHierarchyRole && editingUserFacilityId && editingUserFacilityId !== payload.facilityId) {
          const previousFacility = facilities.find((facility) => facility._id === editingUserFacilityId);
          const previousHeadEmail = previousFacility?.facilityHeads?.[0]?.email;
          if (previousHeadEmail && previousHeadEmail === payload.email) {
            await api.put(`/api/facilities/${editingUserFacilityId}`, {
              facilityHeads: [],
            });
          }
        }
      } else {
        await api.post("/api/users/register", payload);
      }
      fetchData();
      closeModal();
    } catch (error) {
      console.error("Error:", error.response?.data);
      setError(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    setUserToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/api/users/${userToDelete}`);
      toast.success("User deleted successfully!");
      fetchData();
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const openModal = (userData = null) => {
    if (userData) {
      setEditingUser(userData);
      // Get facilityId from facilityAssignments if available
      const facilityId = userData.facilities?.[0]?.facilityId?._id || userData.facilities?.[0]?.facilityId || "";
      setEditingUserFacilityId(facilityId);
      setFormData({
        username: userData.username || "",
        email: userData.email || "",
        password: "",
        role: managedRole,
        facilityId: facilityId,
      });
    } else {
      setEditingUser(null);
      setEditingUserFacilityId("");
      setFormData({
        username: "",
        email: "",
        role: managedRole,
        facilityId: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setEditingUserFacilityId("");
    setFormData({
      username: "",
      email: "",
      role: managedRole,
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
      REGION_ADMIN: "bg-indigo-100 text-indigo-800",
      ORG_ADMIN: "bg-blue-100 text-blue-800",
      PLANT_ADMIN: "bg-purple-100 text-purple-800",
      ENERGY_MANAGER: "bg-green-100 text-green-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getRoleLabel = (role) => {
    if (isHeadRole && role === "REGION_ADMIN" && isServiceSector) {
      return "Regional Manager";
    }
    if (isRegionAdminRole && role === "PLANT_ADMIN" && isServiceSector) {
      return "Branch Admin";
    }
    return getDisplayRoleLabel(role, resolvedIndustry || userIndustry);
  };

  // Filter out ORG_ADMIN from the list (they shouldn't manage themselves)
  const filteredUsers = users
    .filter((u) => u.role === managedRole)
    .filter((u) => u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="flex mb-5 flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-green-200 to-green-700 p-3 rounded-xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{plantAdminTitlePlural}</h1>
            <p className="text-md text-gray-500">Manage {plantAdminTitlePlural.toLowerCase()} in your organization</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative border-green-500 max-w-2xl">
            <Search className="absolute left-3 top-1/2 border-green-500 -translate-y-1/2 text-gray-700 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-green-500 border-2 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all shadow-sm"
            />
          </div>
          <button onClick={() => openModal()} className="px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
            + Add {plantAdminTitle}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="py-20 text-center">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-md font-medium text-gray-900">No {plantAdminTitlePlural.toLowerCase()} found</h3>
              <p className="text-sm text-gray-400 mt-1">
                {isHeadRole
                  ? "Create Regional Manager users to manage regions."
                  : isRegionAdminRole
                    ? "Create Branch Admin users for each region."
                    : `Set a ${siteUnitLabel.toLowerCase()} head in ${siteUnitPluralLabel} to create one.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">Username</th>
                    <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">Email</th>
                    <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">Role</th>
                    <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">{isTopHierarchyRole ? "Organization" : siteUnitLabel}</th>
                    <th className="px-6 py-4 text-right text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-100/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-200 to-green-700 flex items-center justify-center text-gray-100 text-xs font-bold uppercase border border-gray-200">
                            {u.username?.charAt(0) || "U"}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            // Preserving your logic for getRoleBadge/Label, but wrapping in consistent style
                            getRoleBadge(u.role).includes("bg-")
                              ? getRoleBadge(u.role) // Assume your function returns full classes
                              : "bg-gray-100 text-gray-700 border-gray-200" // Fallback
                          }`}
                        >
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          {/* Optional: Add MapPin icon if desired, logic kept same */}
                          {isTopHierarchyRole
                            ? u.organizationId?.name || "-"
                            : u.facilities?.[0]?.facilityId?.facilityName || u.facilities?.[0]?.facilityId?.name || u.facilities?.[0]?.facilityName || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openModal(u)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(u._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit {plantAdminTitle}</h2>
            {error ? <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div> : null}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                {editingUser ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Security</label>
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={resettingPassword}
                      className="w-full flex justify-center items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <Shield className="w-4 h-4" />
                      {resettingPassword ? "Sending..." : "Generate New Password & Send Email"}
                    </button>
                    <p className="mt-2 text-xs text-gray-400">This will invalidate the current password and email a reset link to the user.</p>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700">🔑 A secure password will be auto-generated and emailed to the user.</p>
                  </div>
                )}

                {!isTopHierarchyRole && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned {siteUnitLabel} *</label>
                    <select
                      value={formData.facilityId}
                      onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Select {siteUnitLabel.toLowerCase()}</option>
                      {facilities.map((facility) => (
                        <option key={facility._id} value={facility._id}>
                          {facility.facilityName || facility.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Each {siteUnitLabel.toLowerCase()} can have only one admin.</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    {editingUser ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        processing={deleting}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        isDangerous
      />
    </div>
  );
};

export default OrgUsers;
