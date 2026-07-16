import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Menu, Bell, LogOut, MapPin, Camera, Loader2, X } from "lucide-react";
import schoolLogo from "../../assets/school-logo.png";
import { updateAvatar } from "../../features/auth/authSlice";

// onMenuClick - mobile pe hamburger dabane se Sidebar khulti hai onLogout - profile ke paas wale logout icon se call hota hai
function Topbar({ onMenuClick, userName = "User", role = "", onLogout }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);
  const [showPanel, setShowPanel] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [preview, setPreview] = useState(null);

  const avatarUrl = user?.avatar?.url;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setPreview(URL.createObjectURL(file));
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setUploadError("");
    try {
      await dispatch(updateAvatar({ userId: user._id, file })).unwrap();
    } catch (err) {
      setUploadError(err || "Upload failed");
    } finally {
      setUploading(false);
      setPreview(null);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-100 h-16 flex items-center justify-between px-4 md:px-6 gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button onClick={onMenuClick} className="md:hidden text-ink shrink-0">
          <Menu size={22} />
        </button>

        {/* Jahan pehle search box tha, wahan ab logo + school name + address - premium look ke liye logo + gradient accent bar + do-line layout. */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <img src={schoolLogo} alt="School Logo" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-contain shrink-0" />
          <span className="hidden sm:block w-[3px] h-8 rounded-full bg-gradient-to-b from-marigold to-coral shrink-0" />
          <div className="min-w-0">
            <p className="font-display font-bold text-ink text-[15px] sm:text-base leading-tight truncate">
              School<span className="text-marigold">Vidya</span> Academy
            </p>
            <p className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 truncate mt-0.5">
              <MapPin size={11} className="shrink-0 text-slate-300" />
              <span className="truncate">Vill+Post – Maskedih, Ps – Chalkusha, Dist – Hazaribagh, Jharkhand – 825109</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5 shrink-0">
        <button className="relative text-slate-500 hover:text-ink">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-coral rounded-full" />
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200 relative">
          <button
            onClick={() => setShowPanel((p) => !p)}
            className="w-9 h-9 rounded-full bg-teal-soft flex items-center justify-center font-display font-semibold text-teal text-sm shrink-0 overflow-hidden hover:ring-2 hover:ring-teal/30 transition-shadow"
            title="Update profile photo"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              userName.charAt(0)
            )}
          </button>
          <div className="hidden md:block leading-tight">
            <p className="text-sm font-semibold text-ink">{userName}</p>
            <p className="text-xs text-slate-400">{role}</p>
          </div>
          <button onClick={onLogout} title="Logout" className="text-slate-400 hover:text-coral ml-1">
            <LogOut size={18} />
          </button>

          {/* Profile photo panel - avatar click karne se khulta hai */}
          {showPanel && (
            <div className="absolute right-0 top-12 bg-white shadow-lg rounded-2xl border border-slate-100 p-4 w-56 z-30">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-ink">Profile Photo</p>
                <button onClick={() => setShowPanel(false)} className="text-slate-300 hover:text-ink">
                  <X size={14} />
                </button>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-teal-soft flex items-center justify-center font-display font-bold text-teal text-2xl overflow-hidden relative">
                  {preview || avatarUrl ? (
                    <img src={preview || avatarUrl} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    userName.charAt(0)
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-ink/50 flex items-center justify-center">
                      <Loader2 size={18} className="animate-spin text-white" />
                    </div>
                  )}
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 text-xs font-semibold text-teal hover:text-teal/80 disabled:opacity-50"
                >
                  <Camera size={13} /> {avatarUrl ? "Change Photo" : "Upload Photo"}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

                {uploadError && <p className="text-[11px] text-coral text-center">{uploadError}</p>}
                <p className="text-[10px] text-slate-400 text-center">JPG or PNG, up to 5MB</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
