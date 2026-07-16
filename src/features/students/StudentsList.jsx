import { useState } from "react";
import { Plus, Eye, Pencil, Trash2, Loader2, AlertTriangle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import FilterBar from "../../components/ui/FilterBar";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import Modal from "../../components/ui/Modal";
import ClassFilter from "../../components/ui/ClassFilter";
import ExportMenu from "../../components/ui/ExportMenu";
import StudentForm from "./StudentForm";
import StudentProfileView from "./StudentProfileView";
import { useGetStudentsQuery, useLazyGetStudentsQuery, useDeleteStudentMutation } from "./studentsApi";
import { exportToCSV, printAsReport } from "../../utils/exportUtils";

// Export CSV/PDF mein columns yehi honge - "value" function se nested field (jaise s.profile.rollNo) nikaalte hain
const exportColumns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { label: "Roll No", value: (s) => s.profile?.rollNo },
  { label: "Admission No", value: (s) => s.profile?.admissionNo },
  { label: "Class", value: (s) => s.profile?.classId?.name },
  { label: "Section", value: (s) => s.profile?.sectionId?.name },
  { label: "Gender", value: (s) => s.profile?.gender },
  {
    label: "Admission Date",
    value: (s) => (s.profile?.admissionDate ? new Date(s.profile.admissionDate).toLocaleDateString("en-GB") : ""),
  },
];

function StudentsList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  // "All Classes" filter button existed in the UI but had no onClick, no dropdown, and wasn't wired to the query at all - it did nothing.
  const [classId, setClassId] = useState("");
  // "View" and "Edit" buttons existed in the UI but had no onClick at all - they did nothing.
  const [viewingStudentId, setViewingStudentId] = useState(null); // -> opens read-only profile modal
  const [editingStudent, setEditingStudent] = useState(null); // -> opens StudentForm in edit mode

  // ek hi hook call se data, loading aur error teeno mil jaate hain
  const { data, isLoading, isFetching, isError, error } = useGetStudentsQuery({ page, limit: 8, classId: classId || undefined });
  const [deleteStudent] = useDeleteStudentMutation();

  // Export sirf current page nahi, CURRENT FILTER ke saare students exports karta hai - isliye ek alag lazy (on-demand) fetch, high limit ke saath
  const [triggerExportFetch, { isFetching: exportLoading }] = useLazyGetStudentsQuery();

  const fetchExportData = async () => {
    const result = await triggerExportFetch({ page: 1, limit: 1000, classId: classId || undefined }).unwrap();
    return result?.data || [];
  };

  const handleExportCSV = async () => {
    const rows = await fetchExportData();
    exportToCSV("students", exportColumns, rows);
  };

  const handleExportPrint = async () => {
    const rows = await fetchExportData();
    printAsReport({ title: "Students List", rows, columns: exportColumns });
  };

  const handleClassChange = (id) => {
    setClassId(id);
    setPage(1); // filter badalte hi pehle page pe wapas jao
  };

  // Backend abhi "search" query param support nahi karta - isliye filtering fetched page ke andar hi ho rahi hai (client-side).
  const filtered = (data?.data || []).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.profile?.rollNo?.includes(search)
  );

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await deleteStudent(id).unwrap();
    } catch {
      alert("Failed to delete student");
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Students"
        breadcrumb="Dashboard / Peoples / Students"
        actions={
          <>
            <ExportMenu onCSV={handleExportCSV} onPrint={handleExportPrint} loading={exportLoading} />
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-marigold text-ink text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-95"
            >
              <Plus size={16} /> Add Student
            </button>
          </>
        }
      />

      <Modal title="Add New Student" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <StudentForm onClose={() => setShowAddModal(false)} />
      </Modal>

      <Modal title="Student Profile" isOpen={Boolean(viewingStudentId)} onClose={() => setViewingStudentId(null)}>
        <StudentProfileView studentId={viewingStudentId} />
      </Modal>

      <Modal title="Edit Student" isOpen={Boolean(editingStudent)} onClose={() => setEditingStudent(null)}>
        <StudentForm student={editingStudent} onClose={() => setEditingStudent(null)} />
      </Modal>

      <FilterBar search={search} onSearchChange={setSearch} placeholder="Search by name or roll no...">
        <ClassFilter value={classId} onChange={handleClassChange} />
      </FilterBar>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading students...
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load students"}</p>
        </div>
      )}

      {/* Success state */}
      {!isLoading && !isError && (
        <>
          <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 ${isFetching ? "opacity-50" : ""}`}>
            {filtered.map((s) => (
              <div key={s._id} className="bg-white rounded-2xl p-5 shadow-sm relative">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[11px] font-mono text-slate-400">{s.profile?.admissionNo}</span>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === s._id ? null : s._id)}
                      className="text-slate-400 hover:text-ink px-1"
                    >
                      •••
                    </button>
                    {openMenu === s._id && (
                      <div className="absolute right-0 top-6 bg-white shadow-lg rounded-xl border border-slate-100 py-1.5 w-36 z-10">
                        <button
                          onClick={() => {
                            setViewingStudentId(s._id);
                            setOpenMenu(null);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          onClick={() => {
                            setEditingStudent(s);
                            setOpenMenu(null);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s._id, s.name)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-coral hover:bg-coral-soft"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-marigold-soft flex items-center justify-center font-display font-bold text-marigold shrink-0 overflow-hidden">
                    {s.avatar?.url ? (
                      <img src={s.avatar.url} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      s.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink truncate">{s.name}</p>
                    <p className="text-xs text-slate-400">
                      {s.profile?.classId?.name}, {s.profile?.sectionId?.name}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 rounded-xl py-3 mb-4">
                  <div>
                    <p className="text-xs font-semibold text-ink">{s.profile?.rollNo}</p>
                    <p className="text-[10px] text-slate-400">Roll No</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink capitalize">{s.profile?.gender}</p>
                    <p className="text-[10px] text-slate-400">Gender</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink">
                      {s.profile?.admissionDate
                        ? new Date(s.profile.admissionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </p>
                    <p className="text-[10px] text-slate-400">Joined</p>
                  </div>
                </div>

                <Badge variant="success">Active</Badge>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-16">No students found.</p>
          )}

          <Pagination page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />
        </>
      )}
    </DashboardLayout>
  );
}

export default StudentsList;
