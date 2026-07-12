import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-4 text-center">
      <ShieldAlert size={48} className="text-coral mb-4" />
      <h1 className="font-display text-xl font-bold text-ink">Access Denied</h1>
      <p className="text-sm text-slate-400 mt-1 mb-5">You don't have permission to view this page.</p>
      <Link to="/login" className="text-sm font-semibold text-teal hover:underline">
        Back to Login
      </Link>
    </div>
  );
}

export default UnauthorizedPage;
