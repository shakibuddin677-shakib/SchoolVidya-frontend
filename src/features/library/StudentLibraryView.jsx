import { useSelector } from "react-redux";
import { Loader2, AlertTriangle, BookMarked } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import { useGetIssuesByStudentQuery } from "./libraryApi";

function StudentLibraryView() {
  const { user } = useSelector((state) => state.auth);
  const studentId = user?.profile?._id;

  const { data, isLoading, isError, error } = useGetIssuesByStudentQuery(studentId, { skip: !studentId });

  return (
    <DashboardLayout>
      <PageHeader title="My Library" breadcrumb="Dashboard / Library" />

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading your books...
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load library records"}</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {(data?.data || []).map((issue) => (
            <div key={issue._id} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-marigold-soft flex items-center justify-center">
                  <BookMarked size={18} className="text-marigold" />
                </div>
                <Badge variant={issue.status === "returned" ? "neutral" : "warning"}>{issue.status}</Badge>
              </div>
              <p className="font-semibold text-ink text-sm mb-0.5">{issue.bookId?.title}</p>
              <p className="text-xs text-slate-400 mb-3">{issue.bookId?.author}</p>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Issued: {new Date(issue.issueDate).toLocaleDateString("en-GB")}</span>
                <span>Due: {new Date(issue.dueDate).toLocaleDateString("en-GB")}</span>
              </div>
              {issue.fineAmount > 0 && (
                <p className="text-xs text-coral font-semibold mt-2">Fine: ₹{issue.fineAmount}</p>
              )}
            </div>
          ))}
          {(data?.data || []).length === 0 && (
            <p className="text-center text-sm text-slate-400 py-16 col-span-full">No books issued yet.</p>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default StudentLibraryView;
