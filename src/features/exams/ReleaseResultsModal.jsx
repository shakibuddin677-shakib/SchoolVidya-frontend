import { Loader2, CheckCircle2, AlertTriangle, Send, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../../components/ui/Modal";
import {
  useGetExamResultStatusQuery,
  useReleaseExamResultsMutation,
  useUnpublishExamResultsMutation,
} from "./examsApi";

// Ek exam ke saare subjects ka completion status dikhata hai, aur
// "Release Results" button SIRF tab enable karta hai jab har subject ke
// saare students ke marks enter ho chuke hon. Isse pehle Students ko
// koi bhi marks nahi dikhte - chahe kisi subject ke marks kabhi ke
// enter ho chuke hon.
function ReleaseResultsModal({ exam, onClose }) {
  const { data, isLoading, isError, error } = useGetExamResultStatusQuery(exam._id, { skip: !exam });
  const [releaseResults, { isLoading: isReleasing }] = useReleaseExamResultsMutation();
  const [unpublishResults, { isLoading: isUnpublishing }] = useUnpublishExamResultsMutation();

  const status = data?.data;

  const handleRelease = async () => {
    try {
      const result = await releaseResults(exam._id).unwrap();
      toast.success(result.message || "Results released successfully");
      onClose();
    } catch (err) {
      toast.error(err.data?.message || "Failed to release results");
    }
  };

  const handleUnpublish = async () => {
    if (!window.confirm("Students won't be able to see these results anymore. Continue?")) return;
    try {
      await unpublishResults(exam._id).unwrap();
      toast.success("Results hidden from students");
      onClose();
    } catch (err) {
      toast.error(err.data?.message || "Failed to unpublish results");
    }
  };

  return (
    <Modal title={`Release Results — ${exam?.name}`} isOpen={Boolean(exam)} onClose={onClose}>
      {isLoading && (
        <div className="flex items-center justify-center py-10 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Checking subject-wise completion...
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-10 text-coral gap-2">
          <AlertTriangle size={24} />
          <p className="text-sm">{error?.data?.message || "Failed to load result status"}</p>
        </div>
      )}

      {!isLoading && !isError && status && (
        <>
          {status.isPublished && (
            <div className="flex items-center gap-2 bg-teal-soft text-teal text-xs font-medium px-3 py-2.5 rounded-xl mb-4">
              <CheckCircle2 size={15} />
              Already released{status.publishedAt ? ` on ${new Date(status.publishedAt).toLocaleDateString("en-GB")}` : ""} — students can currently see these marks.
            </div>
          )}

          <p className="text-xs font-semibold text-slate-500 mb-2">
            Subject-wise completion ({status.totalStudents} student{status.totalStudents === 1 ? "" : "s"} in this class)
          </p>

          <div className="space-y-2 mb-4">
            {status.subjects.map((s) => (
              <div
                key={s.examScheduleId}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm ${
                  s.isComplete ? "bg-teal-soft/40" : "bg-coral-soft/40"
                }`}
              >
                <span className="font-medium text-ink">{s.subjectName}</span>
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${s.isComplete ? "text-teal" : "text-coral"}`}>
                  {s.isComplete ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                  {s.resultsEntered} / {s.totalStudents} marked
                </span>
              </div>
            ))}

            {status.subjects.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-6">
                No subjects have been scheduled for this exam yet.
              </p>
            )}
          </div>

          {!status.overallComplete && status.subjects.length > 0 && (
            <p className="text-xs text-coral mb-4">
              Marks are still pending for some subjects above — enter every student's marks for every subject before you can release results.
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleRelease}
              disabled={!status.overallComplete || isReleasing || status.isPublished}
              className="flex-1 flex items-center justify-center gap-2 bg-marigold text-ink font-semibold text-sm py-3 rounded-xl hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isReleasing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {status.isPublished ? "Already Released" : "Release Results"}
            </button>

            {status.isPublished && (
              <button
                onClick={handleUnpublish}
                disabled={isUnpublishing}
                className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-ink font-semibold text-sm px-4 py-3 rounded-xl hover:bg-slate-50 disabled:opacity-50"
              >
                {isUnpublishing ? <Loader2 size={16} className="animate-spin" /> : <EyeOff size={16} />}
                Unpublish
              </button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}

export default ReleaseResultsModal;
