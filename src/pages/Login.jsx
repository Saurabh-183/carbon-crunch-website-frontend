import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authFacade } from "../facades";
import { getDashboardRoute } from "../App";
import { User, Building2, Loader2, ShieldCheck, AlertCircle, Lock, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [organizationId, setOrganizationId] = useState("");
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
      const result = await authFacade.login(username.trim(), password, organizationId.trim());

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans selection:bg-emerald-100">

      {/* --- ANIMATED WAVES BACKGROUND --- */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute bottom-0 left-0 right-0 h-[50vh] flex items-end overflow-hidden">

          {/* Wave 1: Purple (Slowest, furthest back) */}
          <svg className="absolute bottom-0 w-[200%] h-full animate-wave-slow opacity-40 text-purple-200 fill-current" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>

          {/* Wave 2: Blue (Medium speed) */}
          <svg className="absolute bottom-0 w-[200%] h-full animate-wave-medium opacity-40 text-blue-200 fill-current" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>

          {/* Wave 3: Green/Emerald (Fastest, front) */}
          <svg className="absolute bottom-0 w-[200%] h-full animate-wave-fast opacity-30 text-emerald-200 fill-current" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,224L48,213.3C96,203,192,181,288,154.7C384,128,480,96,576,106.7C672,117,768,171,864,176C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>

        </div>
      </div>

      <div className="max-w-md w-full px-6 z-10 relative">

        {/* --- LOGO SECTION --- */}
        <div className="text-center mb-8">

          <h1 className="text-3xl font-black text-slate-800 tracking-widest uppercase drop-shadow-sm">
            Carbon<span className="text-emerald-600">OS</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
            Tally for ESG
          </p>
        </div>

        {/* --- LOGIN CARD --- */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_40px_rgba(0,0,0,0.05)] p-8 transition-all">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-800">Sign In</h2>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-100 shadow-sm">
              <ShieldCheck size={12} className="text-emerald-600" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Secure Access</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Identity</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={16} className="text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                  placeholder="Enter username"
                />
              </div>
            </div>

            {/* Organization ID Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Organization</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building2 size={16} className="text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="text"
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                  placeholder="ORG-XXXX"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" className="text-[10px] text-emerald-600 font-bold hover:underline">Forgot?</Link>
              </div>
              <div className="relative group">
                {/* Left Icon (Lock) */}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>

                {/* Input Field */}
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                  placeholder="••••••••"
                />

                {/* Right Toggle (Eye) */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            {/* Error Feedback */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50 group overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <Loader2 className="animate-spin text-emerald-400" size={18} />
                ) : (
                  <span>Login</span>
                )}
              </div>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            </button>
          </form>
        </div>

        {/* --- FOOTER --- */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 opacity-40">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Protocol v4.0</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Encrypted Endpoint</span>
          </div>
          <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">
            © 2026 Carbon Crunch
          </p>
        </div>
      </div>

      <style>{`
        @keyframes wave {
          0% { transform: translateX(0); }
          50% { transform: translateX(-25%); }
          100% { transform: translateX(0); }
        }
        .animate-wave-slow {
          animation: wave 15s ease-in-out infinite;
        }
        .animate-wave-medium {
          animation: wave 10s ease-in-out infinite reverse;
        }
        .animate-wave-fast {
          animation: wave 6s ease-in-out infinite;
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Login;