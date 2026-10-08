import React, { useState } from "react";
import { ShieldAlert, KeyRound, AlertCircle, Eye, EyeOff } from "lucide-react";
import api from "../../utils/api";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import Cookies from "js-cookie";

const ForcePasswordResetModal = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);

        if (password.length < minLength) return "Password must be at least 8 characters long.";
        if (!hasUpper) return "Password must contain an uppercase letter.";
        if (!hasLower) return "Password must contain a lowercase letter.";
        if (!hasNumber) return "Password must contain a number.";
        if (!hasSpecial) return "Password must contain a special character.";

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.newPassword !== formData.confirmPassword) {
            setError("New password and confirm password do not match.");
            return;
        }

        if (formData.oldPassword === formData.newPassword) {
            setError("New password cannot be the same as the old password.");
            return;
        }

        const validationError = validatePassword(formData.newPassword);
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            await api.post("/api/auth/change-password", {
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword,
            });

            toast.success("Password successfully updated. Please check your dashboard.");

            // Update local state to remove the modal requirement without needing a full re-login
            const userStr = Cookies.get("user");
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    user.requiresPasswordChange = false;
                    // Trigger context update with existing tokens from cookies
                    login(user, Cookies.get("accessToken"), Cookies.get("refreshToken"));
                } catch (e) {
                    console.error("Failed to parse user cookie", e);
                }
            }

        } catch (err) {
            setError(err.response?.data?.message || "Failed to update password. Please check your current password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-8 duration-500">

                {/* Header */}
                <div className="bg-emerald-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] bg-[length:24px_24px]"></div>

                    <div className="relative text-white flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 ring-4 ring-emerald-500/30 backdrop-blur-sm">
                            <ShieldAlert className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Update Required</h2>
                        <p className="text-emerald-50 text-sm opacity-90 leading-relaxed max-w-[280px]">
                            For your security, you must change your auto-generated password before accessing your dashboard.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Current Password */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                                Current Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <KeyRound className="w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <input
                                    type={showOldPassword ? "text" : "password"}
                                    required
                                    value={formData.oldPassword}
                                    onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                                    placeholder="The password from your email"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                                >
                                    {showOldPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                                New Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <KeyRound className="w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    required
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                                    placeholder="New secure password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                                >
                                    {showNewPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm New Password */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                                Confirm New Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <KeyRound className="w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                                    placeholder="Repeat new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                                >
                                    {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Password Rules Feedback */}
                        <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500 space-y-2 border border-slate-100">
                            <p className="font-semibold text-slate-700">Password requirements:</p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li className={formData.newPassword.length >= 8 ? 'text-emerald-600' : ''}>At least 8 characters</li>
                                <li className={/[A-Z]/.test(formData.newPassword) ? 'text-emerald-600' : ''}>One uppercase letter</li>
                                <li className={/[a-z]/.test(formData.newPassword) ? 'text-emerald-600' : ''}>One lowercase letter</li>
                                <li className={/[0-9]/.test(formData.newPassword) ? 'text-emerald-600' : ''}>One number</li>
                                <li className={/[^A-Za-z0-9]/.test(formData.newPassword) ? 'text-emerald-600' : ''}>One special character</li>
                            </ul>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative group overflow-hidden bg-emerald-600 text-white rounded-2xl p-4 font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-emerald-500/25 mt-2"
                        >
                            <div className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Updating Password...</span>
                                    </>
                                ) : (
                                    <span>Secure My Account</span>
                                )}
                            </div>

                            {/* Button hover effect */}
                            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 flex transform -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] opacity-50 z-0"></div>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForcePasswordResetModal;
