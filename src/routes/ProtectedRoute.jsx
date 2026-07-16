import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

// allowedRoles - jaise ["admin"] ya ["admin", "teacher"] children - jo dashboard/page protect karna hai
function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  // App load hote hi checkAuth chal raha hota hai - tab tak kuch mat dikhao
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-teal" size={28} />
      </div>
    );
  }

  // Login hi nahi hai - login page pe bhejo
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Login hai lekin role allowed nahi (jaise Student, Admin route khol raha ho)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
