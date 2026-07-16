import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { logoutUser } from "../../features/auth/authSlice";

const roleLabels = { admin: "Administrator", teacher: "Teacher", student: "Student" };

// Ab role/userName props se nahi lete - seedha Redux (auth.user) se nikaal lete hain, kyunki wahi "source of truth" hai
function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-surface">
      <Sidebar role={user?.role} isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onMenuClick={() => setMobileOpen(true)}
          userName={user?.name || "User"}
          role={roleLabels[user?.role] || ""}
          onLogout={handleLogout}
        />
        <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
