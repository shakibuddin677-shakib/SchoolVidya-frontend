import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock, Loader2, ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import schoolLogo from "../../assets/school-logo.png";
import heroImage from "../../assets/hero.png";

function ResetPasswordPage() {
  const { token } = useParams(); // URL: /reset-password/:token - matches backend route param
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // Matches backend: PUT /api/auth/reset-password/:token { password }
      await axiosInstance.put(`/auth/reset-password/${token}`, { password });
      toast.success("Password reset successful — please log in");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset link is invalid or expired");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* Background photo + soft brand-colored overlay - same treatment as LoginPage for consistency */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink-soft/85 to-ink/90" />

      <div className="relative w-full max-w-sm">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-6">
          <img src={schoolLogo} alt="School Logo" className="w-20 h-20 rounded-full object-contain bg-white p-1.5 shadow-lg mb-3" />
          <h1 className="font-display text-2xl font-extrabold text-white">
            School<span className="text-marigold">Vidya</span> Academy
          </h1>
          <p className="text-xs text-slate-300 tracking-wide mt-0.5">School Management System</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-ink flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={24} className="text-marigold" strokeWidth={2.5} />
            </div>
            <h2 className="font-display text-xl font-bold text-ink">Reset Password</h2>
            <p className="text-sm text-slate-400 mt-1">Choose a new password for your account</p>
            <div className="w-10 h-1 bg-marigold rounded-full mx-auto mt-3" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">New Password</label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-3 focus-within:border-teal focus-within:ring-2 focus-within:ring-teal-soft transition-all">
                <Lock size={16} className="text-slate-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full outline-none text-sm bg-transparent"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-slate-400 shrink-0">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Confirm Password</label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-3 focus-within:border-teal focus-within:ring-2 focus-within:ring-teal-soft transition-all">
                <Lock size={16} className="text-slate-400 shrink-0" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full outline-none text-sm bg-transparent"
                />
                <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="text-slate-400 shrink-0">
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-ink to-ink-soft text-white font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 disabled:opacity-60 transition shadow-lg shadow-ink/20"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Reset Password"}
            </button>
          </form>

          <Link to="/login" className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 hover:text-teal mt-6 transition-colors">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>

        <p className="text-center text-xs text-slate-300 mt-6">© 2026 SchoolVidya Academy</p>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
