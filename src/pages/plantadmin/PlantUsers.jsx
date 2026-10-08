import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Users, Search, X, Mail, ShieldCheck, MapPin, Layout } from "lucide-react";
import { toast } from "sonner";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/rf/Loader";
import ConfirmModal from "../../components/modals/ConfirmModal";
import { getDisplayRoleLabel, getSiteUnitLabel } from "../../utils/uiTerminology";

const PlantUsers = () => {
  const { user } = useAuth();
  const userIndustry = user?.organizationId?.industry || user?.organizationIndustry || "";
  const [resolvedIndustry, setResolvedIndustry] = useState(userIndustry);
  const siteUnitLabel = getSiteUnitLabel(resolvedIndustry || userIndustry);
  const isServiceSector = siteUnitLabel === "Branch";
  const managerLabel = getDisplayRoleLabel("ENERGY_MANAGER", resolvedIndustry || userIndustry);
  const managerLabelPlural = managerLabel === "Office Admin" ? "Office Admins" : "Energy Managers";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    facilityId: "",
    dataEntryStyle: "category",
  });
  const [error, setError] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchOrganizationIndustry = async () => {
      const orgId = user?.organizationId?._id || user?.organizationId;
      if (!orgId) return;

      try {
        const res = await api.get(`/api/organizations/${orgId}`);
        const org = res.data?.data || res.data;
        if (org?.industry) {
          setResolvedIndustry(org.industry);
        }
      } catch (error) {
        console.error("Error fetching organization industry:", error);
      }
    };

    fetchOrganizationIndustry();
  }, [user?.organizationId]);

  const fetchData = async () => {
    try {
      const facilityId = user?.facilityAssignments?.[0]?.facilityId;
      const [usersRes] = await Promise.all([api.get(`/api/users?organizationId=${user?.organizationId}${facilityId ? `&facilityId=${facilityId}` : ""}`)]);
      const usersData = usersRes.data?.data?.users || usersRes.data?.data || usersRes.data || [];
      const energyManagers = Array.isArray(usersData) ? usersData.filter((u) => u.role === "ENERGY_MANAGER") : [];
      setUsers(energyManagers);
    } catch (error) {
      console.error("Error fetching data:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...formData, role: "ENERGY_MANAGER", organizationId: user?.organizationId };
      if (user?.facilityAssignments?.[0]?.facilityId) {
        payload.facilityId = user.facilityAssignments[0].facilityId;
      }
      if (editingUser) {
        if (!payload.password) delete payload.password;
        await api.put(`/api/users/${editingUser._id}`, payload);
        toast.success("User updated successfully!");
      } else {
        await api.post("/api/users/register", payload);
        toast.success("User created successfully!");
      }
      fetchData();
      closeModal();
    } catch (error) {
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
      const facilityId = userData.facilityAssignments?.[0]?.facilityId?._id || userData.facilityAssignments?.[0]?.facilityId || "";
      setFormData({ username: userData.username || "", email: userData.email || "", password: "", facilityId: facilityId, dataEntryStyle: userData.dataEntryStyle || "category" });
    } else {
      setEditingUser(null);
      const defaultFacility = user?.facilityAssignments?.[0]?.facilityId || "";
      setFormData({ username: "", email: "", facilityId: defaultFacility, dataEntryStyle: "category" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ username: "", email: "", facilityId: "", dataEntryStyle: "category" });
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

  const filteredUsers = users.filter((u) => u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-green-200 to-green-700 p-3 rounded-xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{managerLabelPlural}</h1>
            <p className="text-md text-gray-500">{isServiceSector ? "Local-level" : `${siteUnitLabel}-level`} data management users</p>
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
            Add {managerLabel}
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="py-20 text-center">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-md font-medium text-gray-900">No {managerLabelPlural.toLowerCase()} found</h3>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or add a new {managerLabel.toLowerCase()}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">{managerLabel} Details</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">Assigned {siteUnitLabel}</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">Status</th>
                  <th className="px-6 py-4 text-right text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-100/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-200 to-green-700 flex items-center justify-center text-white text-sm font-medium">
                          {u.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-md font-medium text-gray-900">{u.username}</span>
                          <span className="text-xs text-gray-500">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-md text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {u.facilities?.[0]?.facilityId?.facilityName || u.facilityAssignments?.[0]?.facilityId?.facilityName || "Global Access"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${
                          u.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                        {u.status || "active"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">{editingUser ? `Edit ${managerLabel}` : `Create New ${managerLabel}`}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-medium">{error}</div>}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider ml-1">Username</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider ml-1">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                      placeholder={isServiceSector ? "officeadmin@company.com" : "manager@company.com"}
                      required
                    />
                  </div>
                </div>

                {isServiceSector && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider ml-1">Data Entry Style</label>
                    <div className="relative">
                      <Layout className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={formData.dataEntryStyle}
                        onChange={(e) => setFormData({ ...formData, dataEntryStyle: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 outline-none transition-all appearance-none"
                        required
                      >
                        <option value="category">Category View (Sidebar categories)</option>
                        <option value="scope">Scope View (Scope 1, 2, 3 Tabs)</option>
                      </select>
                    </div>
                    <p className="mt-1 ml-1 text-[10px] text-gray-400">Choose how the office admin navigates data entry modules.</p>
                  </div>
                )}

                {editingUser && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider ml-1">Security</label>
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={resettingPassword}
                      className="w-full flex justify-center items-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {resettingPassword ? "Sending..." : "Generate New Password & Send Email"}
                    </button>
                    <p className="mt-1 ml-1 text-[10px] text-gray-400">This will invalidate the current password and email a reset link to the user.</p>
                  </div>
                )}
                {!editingUser && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-sm text-blue-700">🔑 A secure password will be auto-generated and emailed to the user.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-50">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95">
                  {editingUser ? "Save Changes" : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default PlantUsers;
