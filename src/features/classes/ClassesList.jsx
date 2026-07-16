import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, AlertTriangle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import FilterBar from "../../components/ui/FilterBar";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import Modal from "../../components/ui/Modal";
import ClassForm from "./ClassForm";
import { useGetClassesQuery, useDeleteClassMutation } from "./classesApi";

function ClassesList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  // Edit (Pencil) button existed but had no onClick - it did nothing.
  const [editingClass, setEditingClass] = useState(null);

  const { data, isLoading, isError, error } = useGetClassesQuery({ page, limit: 10 });
  const [deleteClass] = useDeleteClassMutation();

  const filtered = (data?.data || []).filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This will not delete its sections/subjects automatically.`)) return;
    try {
      await deleteClass(id).unwrap();
    } catch (err) {
      alert(err.data?.message || "Failed to delete class");
    }
  };

  const columns = [
    { key: "name", label: "Class", render: (row) => <span className="font-semibold text-ink">{row.name}</span> },
    { key: "academicYear", label: "Academic Year" },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <div className="flex items-center gap-3">
          <button onClick={() => setEditingClass(row)} className="text-slate-400 hover:text-teal">
            <Pencil size={15} />
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
        title="Classes"
        breadcrumb="Dashboard / Academic / Classes"
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-marigold text-ink text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-95"
          >
            <Plus size={16} /> Add Class
          </button>
        }
      />

      <Modal title="Add New Class" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <ClassForm onClose={() => setShowAddModal(false)} />
      </Modal>

      <Modal title="Edit Class" isOpen={Boolean(editingClass)} onClose={() => setEditingClass(null)}>
        <ClassForm classItem={editingClass} onClose={() => setEditingClass(null)} />
      </Modal>

      <FilterBar search={search} onSearchChange={setSearch} placeholder="Search classes..." />

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading classes...
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load classes"}</p>
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

export default ClassesList;
