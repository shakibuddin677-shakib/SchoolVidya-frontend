import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, ArrowLeft, MailCheck, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import schoolLogo from "../../assets/school-logo.png";
import heroImage from "../../assets/hero.jpg";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Matches backend: POST /api/auth/forgot-password { email }
      await axiosInstance.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
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
              <KeyRound size={24} className="text-marigold" strokeWidth={2.5} />
            </div>
            <h2 className="font-display text-xl font-bold text-ink">Forgot Password?</h2>
            <p className="text-sm text-slate-400 mt-1">Enter your email and we'll send you a reset link</p>
            <div className="w-10 h-1 bg-marigold rounded-full mx-auto mt-3" />
          </div>

          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-teal-soft flex items-center justify-center mx-auto mb-4">
                <MailCheck size={26} className="text-teal" />
              </div>
              <p className="text-sm font-semibold text-ink mb-1">Check your email</p>
              <p className="text-xs text-slate-400">
                If an account exists for <span className="font-medium text-ink">{email}</span>, a reset link has been sent.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Email</label>
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-3 focus-within:border-teal focus-within:ring-2 focus-within:ring-teal-soft transition-all">
                  <Mail size={16} className="text-slate-400 shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full outline-none text-sm bg-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-ink to-ink-soft text-white font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 disabled:opacity-60 transition shadow-lg shadow-ink/20"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Send Reset Link"}
              </button>
            </form>
          )}

          <Link to="/login" className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 hover:text-teal mt-6 transition-colors">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>

        <p className="text-center text-xs text-slate-300 mt-6">© 2026 SchoolVidya Academy</p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
