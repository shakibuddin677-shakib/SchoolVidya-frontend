import { Loader2, AlertTriangle, Bell } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import { useGetActiveNoticesQuery } from "./noticesApi";

// Shared by Student aur Teacher dono - backend khud role ke hisaab se
// relevant notices filter karke deta hai (getActiveNotices)
function ActiveNoticesView() {
  const { data, isLoading, isError, error } = useGetActiveNoticesQuery();

  return (
    <DashboardLayout>
      <PageHeader title="Notice Board" breadcrumb="Dashboard / Notice Board" />

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading notices...
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load notices"}</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-4">
          {(data?.data || []).map((n) => (
            <div key={n._id} className="bg-white rounded-2xl p-5 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-marigold-soft flex items-center justify-center shrink-0">
                <Bell size={18} className="text-marigold" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-ink mb-1">{n.title}</h3>
                <p className="text-sm text-slate-500 mb-2">{n.description}</p>
                <p className="text-[11px] font-mono text-slate-400">
                  {new Date(n.publishDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  {n.createdBy?.name && ` · ${n.createdBy.name}`}
                </p>
              </div>
            </div>
          ))}
          {(data?.data || []).length === 0 && (
            <p className="text-center text-sm text-slate-400 py-20">No notices right now.</p>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default ActiveNoticesView;
