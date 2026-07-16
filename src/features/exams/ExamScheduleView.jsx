import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { Plus, PencilLine, Trash2, Loader2, AlertTriangle, ArrowLeft, Lock, Trophy, ChevronDown } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import SectionCard from "../../components/ui/SectionCard";
import ExamScheduleForm from "./ExamScheduleForm";
import { useGetExamsQuery } from "./examsApi";
import { useGetSchedulesByExamQuery, useDeleteExamScheduleMutation } from "./examSchedulesApi";
import { useGetClassRankingQuery } from "./resultsApi";
import { useGetSectionsQuery } from "../classes/sectionsApi";

const rankBadgeClass = (rank) => {
  if (rank === 1) return "bg-marigold text-ink";
  if (rank === 2) return "bg-slate-300 text-ink";
  if (rank === 3) return "bg-[#c98a4b] text-white";
  return "bg-slate-100 text-slate-500";
};

function ExamScheduleView() {
  const { examId } = useParams();
  const [showAddModal, setShowAddModal] = useState(false);
  const { user } = useSelector((state) => state.auth);

  // Admin har subject ke results enter kar sakta hai.
  const teacherSubjectIds = (user?.profile?.subjects || []).map((s) => s._id || s);
  const canEnterResultsFor = (subjectId) =>
    user?.role === "admin" || teacherSubjectIds.includes(subjectId);

  // Exam ka apna classId chahiye (Subject dropdown ko filter karne ke liye) - saari exams fetch karke isi ek ko dhoondh lete hain (chhota dataset hai)
  const { data: examsData } = useGetExamsQuery();
  const exam = examsData?.data?.find((e) => e._id === examId);

  const { data, isLoading, isError, error } = useGetSchedulesByExamQuery(examId);
  const [deleteSchedule] = useDeleteExamScheduleMutation();

  // Ranking sirf tab dikhti hai jab results release ho chuke hon - Class ke sections mein se ek chuno, phir usi section ki ranking aayegi
  const { data: sectionsData } = useGetSectionsQuery({ classId: exam?.classId?._id }, { skip: !exam?.classId?._id });
  const [rankingSectionId, setRankingSectionId] = useState("");
  const { data: rankingData, isFetching: rankingLoading } = useGetClassRankingQuery(
    { examId, sectionId: rankingSectionId },
    { skip: !exam?.isPublished || !rankingSectionId }
  );

  useEffect(() => {
    if (!rankingSectionId && sectionsData?.data?.length) {
      setRankingSectionId(sectionsData.data[0]._id);
    }
  }, [sectionsData, rankingSectionId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this paper from the schedule?")) return;
    try {
      await deleteSchedule(id).unwrap();
    } catch {
      alert("Failed to delete schedule");
    }
  };

  const columns = [
    { key: "subject", label: "Subject", render: (row) => <span className="font-semibold text-ink">{row.subjectId?.name}</span> },
    { key: "code", label: "Code", render: (row) => <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-md">{row.subjectId?.code}</span> },
    { key: "date", label: "Date", render: (row) => new Date(row.date).toLocaleDateString("en-GB") },
    { key: "maxMarks", label: "Max Marks" },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <div className="flex items-center gap-4">
          {canEnterResultsFor(row.subjectId?._id) ? (
            <Link to={`${row._id}/results`} className="flex items-center gap-1.5 text-xs font-medium text-teal">
              <PencilLine size={14} /> Enter Results
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-300" title="Not your assigned subject">
              <Lock size={12} /> Enter Results
            </span>
          )}
          <button onClick={() => handleDelete(row._id)} className="text-slate-400 hover:text-coral">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Link to={`/${user?.role}/exams`} className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-teal mb-3">
        <ArrowLeft size={14} /> Back to Exams
      </Link>

      <PageHeader
        title={exam ? `${exam.name} — ${exam.classId?.name}` : "Exam Schedule"}
        breadcrumb="Dashboard / Examinations / Schedule"
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-marigold text-ink text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-95"
          >
            <Plus size={16} /> Add Paper
          </button>
        }
      />

      <Modal title="Add Paper to Schedule" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <ExamScheduleForm examId={examId} classId={exam?.classId?._id} onClose={() => setShowAddModal(false)} />
      </Modal>

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading schedule...
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load schedule"}</p>
        </div>
      )}
      {!isLoading && !isError && <Table columns={columns} data={data?.data || []} />}

      {exam?.isPublished && (
        <div className="mt-5">
          <SectionCard
            title="Class Ranking"
            action={
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-marigold" />
                <div className="relative">
                  <select
                    value={rankingSectionId}
                    onChange={(e) => setRankingSectionId(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-medium text-ink outline-none focus:border-teal cursor-pointer"
                  >
                    {(sectionsData?.data || []).map((sec) => (
                      <option key={sec._id} value={sec._id}>Section {sec.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            }
          >
            {rankingLoading ? (
              <div className="flex items-center justify-center py-10 text-slate-400">
                <Loader2 className="animate-spin mr-2" size={18} /> Calculating ranking...
              </div>
            ) : (
              <div className="space-y-1.5">
                {(rankingData?.data || []).map((s) => (
                  <div key={s.studentId} className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0 ${rankBadgeClass(s.rank)}`}>
                      {s.rank}
                    </div>
                    <div className="w-9 h-9 rounded-full bg-ink flex items-center justify-center font-display font-bold text-marigold text-xs shrink-0">
                      {s.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{s.name}</p>
                      <p className="text-xs text-slate-400">Roll No: {s.rollNo}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-ink">{s.percentage}%</p>
                      <p className="text-[11px] text-slate-400">{s.totalObtained}/{s.totalMax}</p>
                    </div>
                  </div>
                ))}
                {(rankingData?.data || []).length === 0 && (
                  <p className="text-center text-sm text-slate-400 py-10">No results found for this section yet</p>
                )}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </DashboardLayout>
  );
}

export default ExamScheduleView;
