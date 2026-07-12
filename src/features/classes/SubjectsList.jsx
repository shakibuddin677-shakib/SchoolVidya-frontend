import { useState } from "react";
import { Plus, Trash2, Loader2, AlertTriangle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import FilterBar from "../../components/ui/FilterBar";
import Table from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import Modal from "../../components/ui/Modal";
import SubjectForm from "./SubjectForm";
import { useGetSubjectsQuery, useDeleteSubjectMutation } from "./subjectsApi";

function SubjectsList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading, isError, error } = useGetSubjectsQuery({ page, limit: 15 });
  const [deleteSubject] = useDeleteSubjectMutation();

  const filtered = (data?.data || []).filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await deleteSubject(id).unwrap();
    } catch (err) {
      alert(err.data?.message || "Failed to delete subject");
    }
  };

  const columns = [
    { key: "name", label: "Subject", render: (row) => <span className="font-semibold text-ink">{row.name}</span> },
    { key: "code", label: "Code", render: (row) => <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-md">{row.code}</span> },
    { key: "className", label: "Class", render: (row) => row.classId?.name || "—" },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <button onClick={() => handleDelete(row._id, row.name)} className="text-slate-400 hover:text-coral">
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Subjects"
        breadcrumb="Dashboard / Academic / Subjects"
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-marigold text-ink text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-95"
          >
            <Plus size={16} /> Add Subject
          </button>
        }
      />

      <Modal title="Add New Subject" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <SubjectForm onClose={() => setShowAddModal(false)} />
      </Modal>

      <FilterBar search={search} onSearchChange={setSearch} placeholder="Search subjects..." />

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading subjects...
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load subjects"}</p>
        </div>
      )}
      {!isLoading && !isError && (
        <>
          <Table columns={columns} data={filtered} />
          <Pagination page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />
        </>
      )}
    </DashboardLayout>
  );
}

export default SubjectsList;
