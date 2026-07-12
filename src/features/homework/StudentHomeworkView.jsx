import { useState } from "react";
import { useSelector } from "react-redux";
import { Paperclip, Loader2, AlertTriangle, Upload, Check } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { useGetHomeworkBySectionQuery } from "./homeworkApi";
import { useGetSubmissionsByStudentQuery, useSubmitHomeworkMutation } from "./homeworkSubmissionApi";

const statusVariant = { submitted: "success", late: "warning", graded: "neutral" };

function StudentHomeworkView() {
  const { user } = useSelector((state) => state.auth);
  const sectionId = user?.profile?.sectionId?._id;
  const studentId = user?.profile?._id;

  const [submitModalFor, setSubmitModalFor] = useState(null);
  const [file, setFile] = useState(null);
  const [submitHomework, { isLoading: submitting }] = useSubmitHomeworkMutation();

  const { data: homeworkData, isLoading, isError, error } = useGetHomeworkBySectionQuery(sectionId, { skip: !sectionId });
  const { data: submissionsData } = useGetSubmissionsByStudentQuery(studentId, { skip: !studentId });

  const getSubmission = (homeworkId) => submissionsData?.data?.find((s) => s.homeworkId?._id === homeworkId);

  const handleSubmit = async () => {
    if (!file) return toast.error("Please choose a file first");
    const formData = new FormData();
    formData.append("homeworkId", submitModalFor);
    formData.append("studentId", studentId);
    formData.append("attachment", file);

    try {
      await submitHomework(formData).unwrap();
      toast.success("Homework submitted successfully");
      setSubmitModalFor(null);
      setFile(null);
    } catch (err) {
      toast.error(err.data?.message || "Failed to submit");
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Homework" breadcrumb="Dashboard / Homework" />

      <Modal title="Submit Homework" isOpen={!!submitModalFor} onClose={() => setSubmitModalFor(null)}>
        <label className="flex items-center gap-2 border border-dashed border-slate-300 rounded-xl px-3 py-4 text-sm text-slate-500 cursor-pointer hover:border-teal mb-4">
          <Upload size={16} />
          {file ? file.name : "Click to choose your answer file"}
          <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
        </label>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-marigold text-ink font-semibold text-sm py-3 rounded-xl hover:brightness-95 disabled:opacity-60"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Submit
        </button>
      </Modal>

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading homework...
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load homework"}</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {(homeworkData?.data || []).map((h) => {
            const submission = getSubmission(h._id);
            return (
              <div key={h._id} className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-[11px] uppercase tracking-wide text-marigold font-semibold">{h.subjectId?.name}</p>
                <p className="text-sm font-semibold text-ink mt-0.5">{h.title}</p>
                {h.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{h.description}</p>}
                <p className="text-xs text-slate-400 mt-2">Due {new Date(h.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</p>

                {h.attachment?.url && (
                  <a href={h.attachment.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-teal mt-2">
                    <Paperclip size={11} /> Worksheet
                  </a>
                )}

                <div className="mt-4 pt-3 border-t border-slate-50">
                  {submission ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <Badge variant={statusVariant[submission.status]}>{submission.status}</Badge>
                        {/* BUG FIX: pehle sirf raw "marksAwarded" dikhta tha
                            (bina total ke), aur "feedback" bilkul dikhta hi
                            nahi tha - Teacher ki SubmissionsView mein dono
                            already the, Student wali view mein kabhi add
                            nahi hue the */}
                        {submission.marksAwarded != null && (
                          <span className="text-xs font-semibold text-teal">
                            {submission.marksAwarded} / {submission.homeworkId?.totalMarks ?? "-"} marks
                          </span>
                        )}
                      </div>
                      {submission.feedback && (
                        <p className="text-xs text-slate-400 mt-2 bg-slate-50 rounded-lg px-2.5 py-2">
                          "{submission.feedback}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setSubmitModalFor(h._id)}
                      className="w-full bg-slate-100 text-ink text-xs font-semibold py-2 rounded-lg hover:bg-slate-200"
                    >
                      Submit Homework
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {(homeworkData?.data || []).length === 0 && (
            <p className="text-center text-sm text-slate-400 py-16 col-span-full">No homework assigned yet.</p>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default StudentHomeworkView;
