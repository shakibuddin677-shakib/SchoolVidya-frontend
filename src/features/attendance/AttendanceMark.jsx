import { useState, useEffect } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import { useGetClassesQuery } from "../classes/classesApi";
import { useGetSectionsQuery } from "../classes/sectionsApi";
import { useGetStudentsQuery } from "../students/studentsApi";
import { useGetAttendanceBySectionQuery, useMarkAttendanceMutation } from "./attendanceApi";

const statusOptions = [
  { key: "present", label: "P", accent: "bg-teal text-white" },
  { key: "absent", label: "A", accent: "bg-coral text-white" },
  { key: "late", label: "L", accent: "bg-marigold text-ink" },
  { key: "halfday", label: "H", accent: "bg-slate-300 text-white" },
];

function AttendanceMark() {
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState({}); // { [studentProfileId]: status }

  const { data: classesData } = useGetClassesQuery();
  const { data: sectionsData } = useGetSectionsQuery({ classId }, { skip: !classId });
  const { data: studentsData, isLoading: studentsLoading } = useGetStudentsQuery(
    { classId, sectionId, limit: 100 },
    { skip: !sectionId }
  );
  const { data: existingAttendance } = useGetAttendanceBySectionQuery({ sectionId, date }, { skip: !sectionId || !date });
  const [markAttendance, { isLoading: submitting }] = useMarkAttendanceMutation();

  // Jab bhi students ya existing attendance data badle, records state ko
  // "sync" karo - agar us din ke liye already marks hain, unhe prefill karo,
  // warna default "present" rakho
  useEffect(() => {
    if (!studentsData?.data) return;
    const initial = {};
    studentsData.data.forEach((s) => {
      const existing = existingAttendance?.data?.find((a) => a.studentId?._id === s.profile?._id);
      initial[s.profile?._id] = existing?.status || "present";
    });
    setRecords(initial);
  }, [studentsData, existingAttendance]);

  const setStatus = (studentProfileId, status) => setRecords((prev) => ({ ...prev, [studentProfileId]: status }));

  const handleSubmit = async () => {
    try {
      await markAttendance({
        classId,
        sectionId,
        date,
        records: Object.entries(records).map(([studentId, status]) => ({ studentId, status })),
      }).unwrap();
      toast.success("Attendance saved successfully");
    } catch (err) {
      toast.error(err.data?.message || "Failed to save attendance");
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Mark Attendance"
        breadcrumb="Dashboard / Attendance / Mark"
        actions={
          <>
            <div className="relative">
              <select
                value={classId}
                onChange={(e) => { setClassId(e.target.value); setSectionId(""); }}
                className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-9 py-2.5 text-sm text-slate-600"
              >
                <option value="">Select Class</option>
                {classesData?.data?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                disabled={!classId}
                className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-9 py-2.5 text-sm text-slate-600 disabled:opacity-50"
              >
                <option value="">Select Section</option>
                {sectionsData?.data?.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600"
            />
          </>
        }
      />

      {!sectionId && (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          Select a Class and Section to mark attendance.
        </div>
      )}

      {sectionId && studentsLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading students...
        </div>
      )}

      {sectionId && !studentsLoading && (
        <>
          <div className="bg-white rounded-2xl shadow-sm p-2">
            {(studentsData?.data || []).map((s) => (
              <div key={s._id} className="flex items-center justify-between px-4 py-3.5 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-marigold-soft flex items-center justify-center font-display font-semibold text-marigold text-sm">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{s.name}</p>
                    <p className="text-[11px] font-mono text-slate-400">Roll No: {s.profile?.rollNo}</p>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setStatus(s.profile?._id, opt.key)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition
                        ${records[s.profile?._id] === opt.key ? opt.accent : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {(studentsData?.data || []).length === 0 && (
              <p className="text-center text-sm text-slate-400 py-10">No students found in this section.</p>
            )}
          </div>

          <div className="flex justify-end mt-5">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-marigold text-ink text-sm font-semibold px-6 py-3 rounded-xl hover:brightness-95 disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Save Attendance
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default AttendanceMark;
