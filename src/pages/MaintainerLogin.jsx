import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authFacade } from "../facades";
import { getDashboardRoute } from "../App";
import { Mail, Loader2, Wrench, AlertCircle, Lock, Eye, EyeOff } from "lucide-react";

const MaintainerLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await authFacade.loginMaintainer(email.trim(), password);
            const { user, accessToken, refreshToken } = result;
            login(user, accessToken, refreshToken);
            navigate(getDashboardRoute(user.role));
        } catch (error) {
            console.error("Login error:", error);
            setError(error.message || "Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden font-sans">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
            </div>

            <div className="max-w-md w-full px-6 z-10 relative">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
                        <Wrench size={16} className="text-blue-400" />
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Maintainer</span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase">
                        Carbon<span className="text-emerald-400">OS</span>
                    </h1>
                    <p className="text-slate-400 text-xs mt-2">Platform Configuration Portal</p>
                </div>

                {/* Login Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-8">
                    <h2 className="text-lg font-bold text-white mb-6">Maintainer Sign In</h2>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail size={16} className="text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                    placeholder="maintainer@carboncrunch.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={16} className="text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-blue-400 transition-colors"
                                >
                                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin mx-auto" size={18} />
                            ) : (
                                "Sign In as Maintainer"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <a href="/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                            &larr; Back to User Login
                        </a>
                    </div>
                </div>

                <p className="text-center text-slate-600 text-[10px] font-bold tracking-widest uppercase mt-8">
                    &copy; 2026 Carbon Crunch
                </p>
            </div>
        </div>
    );
};

export default MaintainerLogin;
