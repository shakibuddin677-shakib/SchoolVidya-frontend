import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ClipboardList, Trash2, Loader2, AlertTriangle, Send, CheckCircle2 } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Table from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import Modal from "../../components/ui/Modal";
import ExamForm from "./ExamForm";
import ReleaseResultsModal from "./ReleaseResultsModal";
import { useGetExamsQuery, useDeleteExamMutation } from "./examsApi";

function ExamsList() {
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [releasingExam, setReleasingExam] = useState(null);

  const { data, isLoading, isError, error } = useGetExamsQuery();
  const [deleteExam] = useDeleteExamMutation();

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This will not delete its schedules automatically.`)) return;
    try {
      await deleteExam(id).unwrap();
    } catch (err) {
      alert(err.data?.message || "Failed to delete exam");
    }
  };

  const columns = [
    { key: "name", label: "Exam", render: (row) => <span className="font-semibold text-ink">{row.name}</span> },
    { key: "className", label: "Class", render: (row) => row.classId?.name || "—" },
    { key: "term", label: "Term" },
    { key: "startDate", label: "Start Date", render: (row) => new Date(row.startDate).toLocaleDateString("en-GB") },
    { key: "endDate", label: "End Date", render: (row) => new Date(row.endDate).toLocaleDateString("en-GB") },
    {
      key: "resultStatus",
      label: "Results",
      render: (row) =>
        row.isPublished ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-teal bg-teal-soft px-2.5 py-1 rounded-full w-fit">
            <CheckCircle2 size={12} /> Released
          </span>
        ) : (
          <span className="text-xs text-slate-400">Not released</span>
        ),
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <div className="flex items-center gap-4">
          <Link to={`${row._id}/schedule`} className="flex items-center gap-1.5 text-xs font-medium text-teal">
            <ClipboardList size={14} /> Schedule
          </Link>
          <button
            onClick={() => setReleasingExam(row)}
            className="flex items-center gap-1.5 text-xs font-medium text-marigold"
          >
            <Send size={13} /> {row.isPublished ? "Manage Release" : "Release Results"}
          </button>
          <button onClick={() => handleDelete(row._id, row.name)} className="text-slate-400 hover:text-coral">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Examinations"
        breadcrumb="Dashboard / Examinations"
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-marigold text-ink text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-95"
          >
            <Plus size={16} /> Add Exam
          </button>
        }
      />

      <Modal title="Add New Exam" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <ExamForm onClose={() => setShowAddModal(false)} />
      </Modal>

      {releasingExam && (
        <ReleaseResultsModal exam={releasingExam} onClose={() => setReleasingExam(null)} />
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading exams...
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load exams"}</p>
        </div>
      )}
      {!isLoading && !isError && (
        <>
          <Table columns={columns} data={data?.data || []} />
          <Pagination page={page} totalPages={1} onPageChange={setPage} />
        </>
      )}
    </DashboardLayout>
  );
}

export default ExamsList;
