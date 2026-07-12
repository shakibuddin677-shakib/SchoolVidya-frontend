import { useState } from "react";
import { Plus, Mail, Loader2, AlertTriangle, Trash2, Pencil } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import FilterBar from "../../components/ui/FilterBar";
import Pagination from "../../components/ui/Pagination";
import Modal from "../../components/ui/Modal";
import ExportMenu from "../../components/ui/ExportMenu";
import TeacherForm from "./TeacherForm";
import { useGetTeachersQuery, useLazyGetTeachersQuery, useDeleteTeacherMutation } from "./teachersApi";
import { exportToCSV, printAsReport } from "../../utils/exportUtils";

const exportColumns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { label: "Employee ID", value: (t) => t.profile?.employeeId },
  { label: "Qualification", value: (t) => t.profile?.qualification },
  { label: "Subjects", value: (t) => (t.profile?.subjects || []).map((s) => s.name).join("; ") },
];

function TeachersList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const { data, isLoading, isError, error } = useGetTeachersQuery({ page, limit: 9 });
  const [deleteTeacher] = useDeleteTeacherMutation();

  const [triggerExportFetch, { isFetching: exportLoading }] = useLazyGetTeachersQuery();

  const fetchExportData = async () => {
    const result = await triggerExportFetch({ page: 1, limit: 1000 }).unwrap();
    return result?.data || [];
  };

  const handleExportCSV = async () => {
    const rows = await fetchExportData();
    exportToCSV("teachers", exportColumns, rows);
  };

  const handleExportPrint = async () => {
    const rows = await fetchExportData();
    printAsReport({ title: "Teachers List", rows, columns: exportColumns });
  };

  const filtered = (data?.data || []).filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await deleteTeacher(id).unwrap();
    } catch {
      alert("Failed to delete teacher");
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Teachers"
        breadcrumb="Dashboard / Peoples / Teachers"
        actions={
          <>
            <ExportMenu onCSV={handleExportCSV} onPrint={handleExportPrint} loading={exportLoading} />
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-marigold text-ink text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-95"
            >
              <Plus size={16} /> Add Teacher
            </button>
          </>
        }
      />

      <Modal title="Add New Teacher" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <TeacherForm onClose={() => setShowAddModal(false)} />
      </Modal>

      <Modal title="Edit Teacher" isOpen={Boolean(editingTeacher)} onClose={() => setEditingTeacher(null)}>
        {editingTeacher && (
          <TeacherForm teacher={editingTeacher} onClose={() => setEditingTeacher(null)} />
        )}
      </Modal>

      <FilterBar search={search} onSearchChange={setSearch} placeholder="Search teachers..." />

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading teachers...
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load teachers"}</p>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <div key={t._id} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-slate-400">{t.profile?.employeeId}</span>
                  <div className="flex items-center gap-2.5">
                    <button onClick={() => setEditingTeacher(t)} className="text-slate-300 hover:text-teal">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(t._id, t.name)} className="text-slate-300 hover:text-coral">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-teal-soft flex items-center justify-center font-display font-bold text-teal shrink-0 overflow-hidden">
                    {t.avatar?.url ? (
                      <img src={t.avatar.url} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                      t.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink truncate">{t.name}</p>
                    <p className="text-xs text-slate-400 truncate">{t.profile?.qualification || "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <Mail size={13} /> {t.email}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(t.profile?.subjects || []).length > 0 ? (
                    t.profile.subjects.map((s) => (
                      <span key={s._id || s.name} className="text-[11px] bg-marigold-soft text-marigold px-2 py-1 rounded-md font-medium">
                        {s.name}{s.classId?.name ? ` — ${s.classId.name}` : ""}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-300">No subjects assigned</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && <p className="text-center text-sm text-slate-400 py-16">No teachers found.</p>}

          <Pagination page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />
        </>
      )}
    </DashboardLayout>
  );
}

export default TeachersList;
