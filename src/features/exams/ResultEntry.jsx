import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { Check, Loader2, AlertTriangle, ArrowLeft, Lock } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import { useGetExamsQuery } from "./examsApi";
import { useGetSchedulesByExamQuery } from "./examSchedulesApi";
import { useGetResultsByScheduleQuery, useEnterResultsMutation } from "./resultsApi";
import { useGetStudentsQuery } from "../students/studentsApi";

const gradeColor = { "A+": "text-teal", A: "text-teal", B: "text-marigold", C: "text-marigold", F: "text-coral" };

function ResultEntry() {
  const { examId, scheduleId } = useParams();
  const [marks, setMarks] = useState({}); // { [studentProfileId]: number }

  const { data: examsData } = useGetExamsQuery();
  const exam = examsData?.data?.find((e) => e._id === examId);

  const { data: schedulesData } = useGetSchedulesByExamQuery(examId);
  const schedule = schedulesData?.data?.find((s) => s._id === scheduleId);

  const { user } = useSelector((state) => state.auth);
  const teacherSubjectIds = (user?.profile?.subjects || []).map((s) => s._id || s);
  const isAllowed = user?.role === "admin" || teacherSubjectIds.includes(schedule?.subjectId?._id);

  const { data: studentsData, isLoading: studentsLoading } = useGetStudentsQuery(
    { classId: exam?.classId?._id, limit: 100 },
    { skip: !exam?.classId?._id }
  );
  const { data: existingResults } = useGetResultsByScheduleQuery(scheduleId);
  const [enterResults, { isLoading: submitting }] = useEnterResultsMutation();

  // Existing marks (agar pehle se entered hain) prefill karo
  useEffect(() => {
    if (!studentsData?.data) return;
    const initial = {};
    studentsData.data.forEach((s) => {
      const existing = existingResults?.data?.find((r) => r.studentId?._id === s.profile?._id);
      initial[s.profile?._id] = existing?.marksObtained ?? "";
    });
    setMarks(initial);
  }, [studentsData, existingResults]);

  const handleChange = (studentProfileId, value) => setMarks((prev) => ({ ...prev, [studentProfileId]: value }));

  const handleSubmit = async () => {
    try {
      await enterResults({
        examScheduleId: scheduleId,
        marks: Object.entries(marks)
          .filter(([, v]) => v !== "")
          .map(([studentId, marksObtained]) => ({ studentId, marksObtained: Number(marksObtained) })),
      }).unwrap();
      toast.success("Results saved — grades calculated automatically");
    } catch (err) {
      toast.error(err.data?.message || "Failed to save results");
    }
  };

  const getExistingGrade = (studentProfileId) =>
    existingResults?.data?.find((r) => r.studentId?._id === studentProfileId)?.grade;

  return (
    <DashboardLayout>
      <Link to={`/${user?.role}/exams/${examId}/schedule`} className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-teal mb-3">
        <ArrowLeft size={14} /> Back to Schedule
      </Link>

      <PageHeader
        title={schedule ? `${schedule.subjectId?.name} — Enter Marks` : "Enter Results"}
        breadcrumb={`Dashboard / Examinations / ${exam?.name || ""} / Results`}
        actions={<span className="text-sm text-slate-400">Max Marks: <span className="font-semibold text-ink">{schedule?.maxMarks}</span></span>}
      />

      {schedule && !isAllowed && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
          <Lock size={28} />
          <p className="text-sm">You're not assigned to teach this subject, so you can't enter marks for it.</p>
        </div>
      )}

      {(!schedule || isAllowed) && studentsLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading students...
        </div>
      )}

      {schedule && isAllowed && !studentsLoading && (
        <>
          <div className="bg-white rounded-2xl shadow-sm p-2">
            {(studentsData?.data || []).map((s) => (
              <div key={s._id} className="flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-marigold-soft flex items-center justify-center font-display font-semibold text-marigold text-sm">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{s.name}</p>
                    <p className="text-[11px] font-mono text-slate-400">Roll No: {s.profile?.rollNo}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getExistingGrade(s.profile?._id) && (
                    <span className={`text-xs font-bold ${gradeColor[getExistingGrade(s.profile?._id)] || "text-slate-400"}`}>
                      {getExistingGrade(s.profile?._id)}
                    </span>
                  )}
                  <input
                    type="number"
                    min={0}
                    max={schedule?.maxMarks || 100}
                    value={marks[s.profile?._id] ?? ""}
                    onChange={(e) => handleChange(s.profile?._id, e.target.value)}
                    placeholder="Marks"
                    className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm text-center outline-none focus:border-teal"
                  />
                </div>
              </div>
            ))}
            {(studentsData?.data || []).length === 0 && (
              <p className="text-center text-sm text-slate-400 py-10">No students found for this class.</p>
            )}
          </div>

          <div className="flex justify-end mt-5">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-marigold text-ink text-sm font-semibold px-6 py-3 rounded-xl hover:brightness-95 disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Save Results
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default ResultEntry;
