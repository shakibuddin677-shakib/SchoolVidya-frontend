import { useState } from "react";
import { Plus, Trash2, Pencil, Loader2, AlertTriangle, ChevronDown } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Table from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import Modal from "../../components/ui/Modal";
import SectionForm from "./SectionForm";
import { useGetClassesQuery } from "./classesApi";
import { useGetSectionsQuery, useDeleteSectionMutation } from "./sectionsApi";

function SectionsList() {
  const [page, setPage] = useState(1);
  const [classFilter, setClassFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  const { data: classesData } = useGetClassesQuery();
  const { data, isLoading, isError, error } = useGetSectionsQuery({ classId: classFilter || undefined });
  const [deleteSection] = useDeleteSectionMutation();

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete Section ${name}?`)) return;
    try {
      await deleteSection(id).unwrap();
    } catch (err) {
      alert(err.data?.message || "Failed to delete section");
    }
  };

  const columns = [
    { key: "name", label: "Section", render: (row) => <span className="font-semibold text-ink">{row.name}</span> },
    { key: "className", label: "Class", render: (row) => row.classId?.name || "—" },
    { key: "academicYear", label: "Academic Year", render: (row) => row.classId?.academicYear || "—" },
    {
      key: "teacher",
      label: "Class Teacher",
      render: (row) => row.classTeacherId?.name || <span className="text-slate-300">Not assigned</span>,
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <div className="flex items-center gap-3">
          <button onClick={() => setEditingSection(row)} className="text-slate-400 hover:text-teal">
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
        title="Sections"
        breadcrumb="Dashboard / Academic / Sections"
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-marigold text-ink text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-95"
          >
            <Plus size={16} /> Add Section
          </button>
        }
      />

      <Modal title="Add New Section" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <SectionForm onClose={() => setShowAddModal(false)} />
      </Modal>

      <Modal title="Edit Section" isOpen={Boolean(editingSection)} onClose={() => setEditingSection(null)}>
        {editingSection && (
          <SectionForm section={editingSection} onClose={() => setEditingSection(null)} />
        )}
      </Modal>

      <div className="mb-4">
        <div className="relative inline-block">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-9 py-2.5 text-sm text-slate-600"
          >
            <option value="">All Classes</option>
            {classesData?.data?.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading sections...
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load sections"}</p>
        </div>
      )}
      {!isLoading && !isError && (
        <>
          <Table columns={columns} data={data?.data || []} />
          <Pagination page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />
        </>
      )}
    </DashboardLayout>
  );
}

export default SectionsList;
