import { useState } from "react";
import { Plus, Trash2, Loader2, AlertTriangle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import ExportMenu from "../../components/ui/ExportMenu";
import NoticeForm from "./NoticeForm";
import { useGetAllNoticesQuery, useDeleteNoticeMutation } from "./noticesApi";
import { exportToCSV, printAsReport } from "../../utils/exportUtils";

const audienceVariant = { all: "neutral", students: "success", teachers: "warning" };

const exportColumns = [
  { key: "title", label: "Title" },
  { key: "description", label: "Description" },
  { key: "targetAudience", label: "Audience" },
  { label: "Published", value: (n) => new Date(n.publishDate).toLocaleDateString("en-GB") },
  { label: "Expiry", value: (n) => (n.expiryDate ? new Date(n.expiryDate).toLocaleDateString("en-GB") : "") },
  { label: "Created By", value: (n) => n.createdBy?.name },
];

function NoticesList() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { data, isLoading, isError, error } = useGetAllNoticesQuery();
  const [deleteNotice] = useDeleteNoticeMutation();

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await deleteNotice(id).unwrap();
    } catch (err) {
      alert(err.data?.message || "Failed to delete notice");
    }
  };

  const isExpired = (n) => n.expiryDate && new Date(n.expiryDate) < new Date();

  const handleExportCSV = () => exportToCSV("notices", exportColumns, data?.data || []);
  const handleExportPrint = () => printAsReport({ title: "Notice Board", rows: data?.data || [], columns: exportColumns });

  return (
    <DashboardLayout>
      <PageHeader
        title="Notice Board"
        breadcrumb="Dashboard / Announcements / Notice Board"
        actions={
          <>
            <ExportMenu onCSV={handleExportCSV} onPrint={handleExportPrint} disabled={(data?.data || []).length === 0} />
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-marigold text-ink text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-95"
            >
              <Plus size={16} /> Create Notice
            </button>
          </>
        }
      />

      <Modal title="Create Notice" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <NoticeForm onClose={() => setShowAddModal(false)} />
      </Modal>

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading notices...
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load notices"}</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-4">
          {(data?.data || []).map((n) => (
            <div key={n._id} className={`bg-white rounded-2xl p-5 shadow-sm ${isExpired(n) ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-display font-semibold text-ink">{n.title}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={audienceVariant[n.targetAudience]}>{n.targetAudience}</Badge>
                  {isExpired(n) && <Badge variant="danger">Expired</Badge>}
                  <button onClick={() => handleDelete(n._id, n.title)} className="text-slate-400 hover:text-coral">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-3">{n.description}</p>
              <p className="text-[11px] font-mono text-slate-400">
                Published {new Date(n.publishDate).toLocaleDateString("en-GB")} by {n.createdBy?.name}
              </p>
            </div>
          ))}
          {(data?.data || []).length === 0 && <p className="text-center text-sm text-slate-400 py-16">No notices published yet.</p>}
        </div>
      )}
    </DashboardLayout>
  );
}

export default NoticesList;
