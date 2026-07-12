import { useState } from "react";
import { useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Loader2, AlertTriangle, Check } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import { useGetSubmissionsByHomeworkQuery, useGradeSubmissionMutation } from "./homeworkSubmissionApi";

const statusVariant = { submitted: "success", late: "warning", graded: "neutral" };

function SubmissionsView() {
  const { homeworkId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading, isError, error } = useGetSubmissionsByHomeworkQuery(homeworkId);
  const [gradeSubmission] = useGradeSubmissionMutation();
  const [grading, setGrading] = useState({}); // { [submissionId]: { marksAwarded, feedback } }

  const handleGradeChange = (id, field, value) =>
    setGrading((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const handleSaveGrade = async (id) => {
    try {
      await gradeSubmission({
        id,
        marksAwarded: Number(grading[id]?.marksAwarded),
        feedback: grading[id]?.feedback || "",
      }).unwrap();
      toast.success("Graded successfully");
    } catch (err) {
      toast.error(err.data?.message || "Failed to save grade");
    }
  };

  return (
    <DashboardLayout>
      <Link to={`/${user?.role}/homework`} className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-teal mb-3">
        <ArrowLeft size={14} /> Back to Homework
      </Link>

      <PageHeader title="Submissions" breadcrumb="Dashboard / Homework / Submissions" />

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading submissions...
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load submissions"}</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="bg-white rounded-2xl shadow-sm p-2">
          {(data?.data || []).map((sub) => (
            <div key={sub._id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-marigold-soft flex items-center justify-center font-display font-semibold text-marigold text-sm shrink-0">
                  {sub.studentId?.rollNo?.charAt(0) || "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">Roll No: {sub.studentId?.rollNo}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant[sub.status]}>{sub.status}</Badge>
                    <a href={sub.attachment?.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-teal">
                      <ExternalLink size={11} /> View file
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {sub.status === "graded" ? (
                  <div className="text-right">
                    <span className="text-sm font-semibold text-teal">
                      {sub.marksAwarded} / {sub.homeworkId?.totalMarks ?? "-"} marks
                    </span>
                    {sub.feedback && (
                      <p className="text-xs text-slate-400 mt-0.5 max-w-[220px] truncate" title={sub.feedback}>
                        "{sub.feedback}"
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <input
                      type="number"
                      min="0"
                      max={sub.homeworkId?.totalMarks}
                      placeholder={`/ ${sub.homeworkId?.totalMarks ?? 100}`}
                      defaultValue={grading[sub._id]?.marksAwarded}
                      onChange={(e) => handleGradeChange(sub._id, "marksAwarded", e.target.value)}
                      className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center outline-none focus:border-teal"
                    />
                    <input
                      type="text"
                      placeholder="Feedback"
                      defaultValue={grading[sub._id]?.feedback}
                      onChange={(e) => handleGradeChange(sub._id, "feedback", e.target.value)}
                      className="w-32 border border-slate-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-teal"
                    />
                    <button
                      onClick={() => handleSaveGrade(sub._id)}
                      className="w-8 h-8 flex items-center justify-center bg-marigold text-ink rounded-lg hover:brightness-95 shrink-0"
                    >
                      <Check size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {(data?.data || []).length === 0 && (
            <p className="text-center text-sm text-slate-400 py-16">No submissions yet.</p>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default SubmissionsView;
