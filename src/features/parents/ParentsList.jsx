import { useState } from "react";
import { Plus, Loader2, AlertTriangle, Trash2 } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import FilterBar from "../../components/ui/FilterBar";
import Table from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import Modal from "../../components/ui/Modal";
import ExportMenu from "../../components/ui/ExportMenu";
import ParentForm from "./ParentForm";
import { useGetParentsQuery, useLazyGetParentsQuery, useDeleteParentMutation } from "./parentsApi";
import { exportToCSV, printAsReport } from "../../utils/exportUtils";

const exportColumns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "occupation", label: "Occupation" },
  { label: "Children", value: (p) => p.children?.map((c) => c.userId?.name).join("; ") },
];

function ParentsList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading, isError, error } = useGetParentsQuery({ page, limit: 10 });
  const [deleteParent] = useDeleteParentMutation();

  const [triggerExportFetch, { isFetching: exportLoading }] = useLazyGetParentsQuery();

  const fetchExportData = async () => {
    const result = await triggerExportFetch({ page: 1, limit: 1000 }).unwrap();
    return result?.data || [];
  };

  const handleExportCSV = async () => {
    const rows = await fetchExportData();
    exportToCSV("parents", exportColumns, rows);
  };

  const handleExportPrint = async () => {
    const rows = await fetchExportData();
    printAsReport({ title: "Parents List", rows, columns: exportColumns });
  };

  const filtered = (data?.data || []).filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await deleteParent(id).unwrap();
    } catch (err) {
      alert(err.data?.message || "Failed to delete parent");
    }
  };

  const columns = [
    {
      key: "name",
      label: "Parent",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-coral-soft flex items-center justify-center font-display font-semibold text-coral text-xs">
            {row.name.charAt(0)}
          </div>
          <span className="font-medium text-ink">{row.name}</span>
        </div>
      ),
    },
    { key: "email", label: "Email", render: (row) => row.email || "—" },
    { key: "phone", label: "Phone" },
    { key: "occupation", label: "Occupation", render: (row) => row.occupation || "—" },
    {
      key: "children",
      label: "Children",
      render: (row) => row.children?.map((c) => c.userId?.name).join(", ") || "—",
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <button onClick={() => handleDelete(row._id, row.name)} className="text-slate-300 hover:text-coral">
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Parents"
        breadcrumb="Dashboard / Peoples / Parents"
        actions={
          <>
            <ExportMenu onCSV={handleExportCSV} onPrint={handleExportPrint} loading={exportLoading} />
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-marigold text-ink text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-95"
            >
              <Plus size={16} /> Add Parent
            </button>
          </>
        }
      />

      <Modal title="Add New Parent" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <ParentForm onClose={() => setShowAddModal(false)} />
      </Modal>

      <FilterBar search={search} onSearchChange={setSearch} placeholder="Search parents..." />

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading parents...
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load parents"}</p>
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

export default ParentsList;
