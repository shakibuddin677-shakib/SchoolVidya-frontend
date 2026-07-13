import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck, User, GraduationCap } from "lucide-react";
import toast from "react-hot-toast";
import { loginUser } from "./authSlice";
import schoolLogo from "../../assets/school-logo.png";
import heroImage from "../../assets/hero.png";

const roleRedirect = { admin: "/admin", teacher: "/teacher", student: "/student" };
const roleLabel = { admin: "Admin", teacher: "Teacher", student: "Student" };

// FEATURE: yeh tabs ab FUNCTIONAL hain - jo tab select hai, sirf usi role
// ka account us se login kar payega. Agar "Admin" select hai aur Teacher/
// Student ke credentials daale jaayein, to login reject ho jaata hai
// (neeche handleSubmit dekhein).
const roleTabs = [
  { key: "admin", label: "Admin", icon: ShieldCheck },
  { key: "teacher", label: "Teacher", icon: User },
  { key: "student", label: "Student", icon: GraduationCap },
];

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState("admin");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await dispatch(loginUser({ email, password })).unwrap();

      // FEATURE: role-gate - backend email/password se authenticate to kar
      // deta hai, lekin agar account ka asli role selected TAB se match
      // nahi karta, to hum login rok ke bata dete hain ki galat tab select
      // hai (session logout NAHI karte, sirf flash message dikhate hain)
      if (user.role !== activeTab) {
        toast.error(
          `This account is registered as a ${roleLabel[user.role] || user.role}, not ${roleLabel[activeTab]}. Please select the correct tab.`
        );
        return;
      }

      toast.success(`Welcome back, ${user.name}!`);
      navigate(roleRedirect[user.role] || "/");
    } catch (errMessage) {
      toast.error(errMessage || "Login failed");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* Background photo + soft brand-colored overlay so text stays readable */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink-soft/85 to-ink/90" />

      <div className="relative w-full max-w-md">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-6">
          <img src={schoolLogo} alt="School Logo" className="w-20 h-20 rounded-full object-contain bg-white p-1.5 shadow-lg mb-3" />
          <h1 className="font-display text-2xl font-extrabold text-white">
            School<span className="text-marigold">Vidya</span> Academy
          </h1>
          <p className="text-xs text-slate-300 tracking-wide mt-0.5">School Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl font-bold text-ink">Welcome Back!</h2>
            <p className="text-sm text-slate-400 mt-1">Sign in to continue to your account</p>
            <div className="w-10 h-1 bg-marigold rounded-full mx-auto mt-3" />
          </div>

          {/* Role tabs - ab functional hain, dekhein upar handleSubmit ka role-gate check */}
          <div className="grid grid-cols-3 gap-2 mb-5 bg-slate-50 p-1.5 rounded-2xl">
            {roleTabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === key ? "bg-ink text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <Icon size={17} className={activeTab === key ? "text-marigold" : "text-slate-400"} />
                {label}
              </button>
            ))}
          </div>

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

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Password</label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-3 focus-within:border-teal focus-within:ring-2 focus-within:ring-teal-soft transition-all">
                <Lock size={16} className="text-slate-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full outline-none text-sm bg-transparent"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-slate-400 shrink-0">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-teal focus:ring-teal accent-teal"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="font-medium text-teal hover:text-teal/80 transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-ink to-ink-soft text-white font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 disabled:opacity-60 transition shadow-lg shadow-ink/20"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : (
                <>
                  <Lock size={15} /> Login
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[11px] text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <p className="text-center text-xs text-slate-500">
            Don't have an account?{" "}
            <span className="font-semibold text-teal">Contact administrator</span>
          </p>
        </div>

        <p className="text-center text-xs text-slate-300 mt-6">© 2026 SchoolVidya Academy</p>
      </div>
    </div>
  );
}

export default LoginPage;
