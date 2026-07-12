import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { navConfig } from "./navConfig";
import schoolLogo from "../../assets/school-logo.png";

// role: "admin" | "teacher" | "student" - decide karta hai konsa nav dikhega
// isOpen/onClose: mobile pe drawer control karte hain (desktop pe hamesha visible)
function Sidebar({ role, isOpen, onClose }) {
  const sections = navConfig[role] || [];

  return (
    <>
      {/* Mobile overlay - sidebar khuli ho to background dim ho jaye, click se band ho */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-ink text-white flex flex-col z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* School logo + name - admin/teacher/student teeno dashboards mein
            yehi ek Sidebar shared hai, isliye yahan change karne se sab jagah
            apply ho jata hai.
            BUG FIX: pehle "truncate" tha jo poora naam "SchoolVidya Academy"
            fixed h-16 (64px) ke andar ADHA kaat deta tha ("School...").
            Ab height auto (min-h) hai aur text 2 lines tak WRAP ho sakta hai
            - naam kabhi bhi cut nahi hoga, chahe sidebar collapse/expand ho */}
        <div className="flex items-start justify-between gap-2 px-5 py-4 min-h-[64px] border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src={schoolLogo} alt="School Logo" className="w-10 h-10 rounded-full shrink-0 object-contain" />
            <span className="font-display font-bold text-[15px] leading-snug tracking-tight break-words">
              School<span className="text-marigold">Vidya</span> Academy
            </span>
          </div>
          <button onClick={onClose} className="md:hidden text-white/60 hover:text-white shrink-0 mt-0.5">
            <X size={20} />
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sections.map((section) => (
            <div key={section.section}>
              <p className="px-3 text-[11px] uppercase tracking-wider text-white/35 font-semibold mb-2">
                {section.section}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path.split("/").length === 2}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${isActive
                        ? "bg-marigold text-ink"
                        : "text-white/70 hover:bg-white/5 hover:text-white"}`
                    }
                  >
                    <item.icon size={18} strokeWidth={2} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
