import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Paperclip, Users, ChevronDown, Loader2, AlertTriangle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Modal from "../../components/ui/Modal";
import HomeworkForm from "./HomeworkForm";
import { useGetSectionsQuery } from "../classes/sectionsApi";
import { useGetHomeworkBySectionQuery } from "./homeworkApi";

function HomeworkList() {
  const [sectionId, setSectionId] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: sectionsData } = useGetSectionsQuery({});
  const { data, isLoading, isError, error } = useGetHomeworkBySectionQuery(sectionId, { skip: !sectionId });

  return (
    <DashboardLayout>
      <PageHeader
        title="Homework"
        breadcrumb="Dashboard / Academic / Homework"
        actions={
          <>
            <div className="relative">
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-9 py-2.5 text-sm text-slate-600"
              >
                <option value="">Select Section</option>
                {sectionsData?.data?.map((s) => (
                  <option key={s._id} value={s._id}>{s.classId?.name}, {s.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-marigold text-ink text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-95"
            >
              <Plus size={16} /> Assign Homework
            </button>
          </>
        }
      />

      <Modal title="Assign Homework" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <HomeworkForm onClose={() => setShowAddModal(false)} />
      </Modal>

      {!sectionId && (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          Select a section to view assigned homework.
        </div>
      )}

      {sectionId && isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading homework...
        </div>
      )}
      {sectionId && isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load homework"}</p>
        </div>
      )}

      {sectionId && !isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {(data?.data || []).map((h) => (
            <Link key={h._id} to={`${h._id}/submissions`} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow block">
              <p className="text-[11px] uppercase tracking-wide text-marigold font-semibold">{h.subjectId?.name}</p>
              <p className="text-sm font-semibold text-ink truncate mt-0.5">{h.title}</p>
              <p className="text-xs text-slate-400 mb-3">Due {new Date(h.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><Users size={12} /> View submissions</span>
                {h.attachment?.url && <span className="flex items-center gap-1"><Paperclip size={12} /> Attached</span>}
              </div>
            </Link>
          ))}
          {(data?.data || []).length === 0 && (
            <p className="text-center text-sm text-slate-400 py-16 col-span-full">No homework assigned to this section yet.</p>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default HomeworkList;
