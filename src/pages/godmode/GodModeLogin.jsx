import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authFacade } from "../../facades";
import { Mail, Loader2, Zap, AlertCircle, Lock, Eye, EyeOff } from "lucide-react";

const GodModeLogin = () => {
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
      const result = await authFacade.loginGodMode(email.trim(), password);
      const { user, accessToken, refreshToken } = result;
      login(user, accessToken, refreshToken);
      navigate("/god/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Access denied.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden font-sans">
      {/* Subtle red gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-black to-red-950/20" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,0,0.3) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="max-w-sm w-full px-6 z-10 relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full mb-4">
            <Zap size={14} className="text-red-500" />
            <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Root Access</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">
            GOD MODE
          </h1>
          <p className="text-red-500/50 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
            Restricted Entry Point
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-red-950/20 backdrop-blur-xl rounded-2xl border border-red-900/30 shadow-2xl shadow-red-950/20 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-red-400/60 uppercase tracking-widest ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={16} className="text-red-900 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-black/50 border border-red-900/40 rounded-xl text-white placeholder:text-red-900/60 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all"
                  placeholder="root@system.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-red-400/60 uppercase tracking-widest ml-1">Passkey</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-red-900 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3 bg-black/50 border border-red-900/40 rounded-xl text-white placeholder:text-red-900/60 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-red-900 hover:text-red-500 transition-colors"
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-red-800 hover:bg-red-700 text-white font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 border border-red-700/50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin mx-auto text-red-300" size={18} />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Zap size={16} />
                  Authenticate
                </span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-red-900/40 text-[10px] font-bold tracking-widest uppercase mt-8">
          Unauthorized access is logged &amp; reported
        </p>
      </div>
    </div>
  );
};

export default GodModeLogin;
