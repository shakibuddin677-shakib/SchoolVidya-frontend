import { useState } from "react";
import { ChevronDown, Plus, Trash2, Loader2, AlertTriangle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Modal from "../../components/ui/Modal";
import ExportMenu from "../../components/ui/ExportMenu";
import TimetableForm from "./TimetableForm";
import { useGetSectionsQuery } from "../classes/sectionsApi";
import { useGetTimetableBySectionQuery, useDeletePeriodMutation } from "./timetableApi";
import { exportToCSV, printAsReport } from "../../utils/exportUtils";

const exportColumns = [
  { key: "dayOfWeek", label: "Day" },
  { label: "Time", value: (p) => `${p.startTime}–${p.endTime}` },
  { label: "Subject", value: (p) => p.subjectId?.name },
  { label: "Teacher", value: (p) => p.teacherId?.name },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const accents = ["bg-marigold-soft text-marigold", "bg-teal-soft text-teal", "bg-coral-soft text-coral", "bg-slate-100 text-slate-600"];

function TimetableView() {
  const [sectionId, setSectionId] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: sectionsData } = useGetSectionsQuery({});
  const { data, isLoading, isError, error } = useGetTimetableBySectionQuery(sectionId, { skip: !sectionId });
  const [deletePeriod] = useDeletePeriodMutation();

  const selectedSection = sectionsData?.data?.find((s) => s._id === sectionId);

  // Backend flat list ko day ke hisaab se group karte hain, taaki grid mein dikha sakein
  const periodsByDay = days.reduce((acc, day) => {
    acc[day] = (data?.data || []).filter((p) => p.dayOfWeek === day);
    return acc;
  }, {});

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this period?")) return;
    try {
      await deletePeriod(id).unwrap();
    } catch {
      alert("Failed to delete period");
    }
  };

  // Export - jo bhi section select hai, usi ka poora timetable, Monday se Saturday tak sorted (raw data ka order guaranteed nahi hota)
  const exportRows = days.flatMap((day) => periodsByDay[day] || []);
  const sectionLabel = selectedSection ? `${selectedSection.classId?.name}, ${selectedSection.name}` : "";

  const handleExportCSV = () => exportToCSV(`timetable-${sectionLabel || "section"}`, exportColumns, exportRows);
  const handleExportPrint = () =>
    printAsReport({ title: "Timetable", subtitle: sectionLabel, rows: exportRows, columns: exportColumns });

  return (
    <DashboardLayout>
      <PageHeader
        title="Timetable"
        breadcrumb="Dashboard / Academic / Timetable"
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
            <ExportMenu onCSV={handleExportCSV} onPrint={handleExportPrint} disabled={!sectionId || exportRows.length === 0} />
            <button
              disabled={!sectionId}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-marigold text-ink text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-95 disabled:opacity-40"
            >
              <Plus size={16} /> Add Period
            </button>
          </>
        }
      />

      {sectionId && (
        <Modal title="Add Period" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
          <TimetableForm sectionId={sectionId} classId={selectedSection?.classId?._id} onClose={() => setShowAddModal(false)} />
        </Modal>
      )}

      {!sectionId && (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          Select a section above to view its timetable.
        </div>
      )}

      {sectionId && isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading timetable...
        </div>
      )}

      {sectionId && isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load timetable"}</p>
        </div>
      )}

      {sectionId && !isLoading && !isError && (
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-cols-6 gap-3 min-w-[900px]">
            {days.map((day) => (
              <div key={day}>
                <p className="text-sm font-display font-semibold text-ink mb-2 text-center">{day}</p>
                <div className="space-y-2">
                  {periodsByDay[day].length === 0 && (
                    <p className="text-[11px] text-slate-300 text-center py-4">No periods</p>
                  )}
                  {periodsByDay[day].map((period, i) => (
                    <div key={period._id} className={`rounded-xl p-3 relative group ${accents[i % accents.length]}`}>
                      <button
                        onClick={() => handleDelete(period._id)}
                        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                      <p className="text-[11px] font-mono opacity-70 mb-1">{period.startTime}–{period.endTime}</p>
                      <p className="text-sm font-semibold">{period.subjectId?.name}</p>
                      <p className="text-xs opacity-70">{period.teacherId?.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default TimetableView;
