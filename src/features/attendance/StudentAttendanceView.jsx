import { useState } from "react";
import { useSelector } from "react-redux";
import { Loader2, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import SectionCard from "../../components/ui/SectionCard";
import ProgressRing from "../../components/ui/ProgressRing";
import { useGetAttendanceByStudentQuery } from "./attendanceApi";

const statusColor = { present: "bg-teal-soft text-teal", absent: "bg-coral-soft text-coral", late: "bg-marigold-soft text-marigold", halfday: "bg-slate-100 text-slate-500" };

function StudentAttendanceView() {
  const { user } = useSelector((state) => state.auth);
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  // user.profile._id - Student model ka _id, checkAuth/login response se milta hai
  const studentId = user?.profile?._id;
  const { data, isLoading, isError, error } = useGetAttendanceByStudentQuery(
    { studentId, month, year },
    { skip: !studentId }
  );

  const changeMonth = (delta) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 1) { newMonth = 12; newYear -= 1; }
    if (newMonth > 12) { newMonth = 1; newYear += 1; }
    setMonth(newMonth);
    setYear(newYear);
  };

  const monthName = new Date(year, month - 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <DashboardLayout>
      <PageHeader
        title="My Attendance"
        breadcrumb="Dashboard / Attendance"
        actions={
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <button onClick={() => changeMonth(-1)} className="text-slate-400 hover:text-ink"><ChevronLeft size={16} /></button>
            <span className="text-sm font-medium text-ink w-32 text-center">{monthName}</span>
            <button onClick={() => changeMonth(1)} className="text-slate-400 hover:text-ink"><ChevronRight size={16} /></button>
          </div>
        }
      />

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading attendance...
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load attendance"}</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <SectionCard title="Summary" className="flex flex-col items-center">
            <ProgressRing
              percentage={data?.summary?.attendancePercentage || 0}
              color="#2FB8AC"
              size={120}
              strokeWidth={12}
            />
            <div className="grid grid-cols-2 gap-3 w-full mt-4 text-center text-xs">
              <div><p className="font-display font-bold text-ink">{data?.summary?.present || 0}</p><p className="text-slate-400">Present</p></div>
              <div><p className="font-display font-bold text-ink">{data?.summary?.absent || 0}</p><p className="text-slate-400">Absent</p></div>
              <div><p className="font-display font-bold text-ink">{data?.summary?.late || 0}</p><p className="text-slate-400">Late</p></div>
              <div><p className="font-display font-bold text-ink">{data?.summary?.halfday || 0}</p><p className="text-slate-400">Halfday</p></div>
            </div>
          </SectionCard>

          <SectionCard title="Daily Record" className="lg:col-span-2">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {(data?.data || []).map((r) => (
                <div key={r._id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-50">
                  <span className="text-sm text-ink font-medium">
                    {new Date(r.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", weekday: "short" })}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusColor[r.status]}`}>
                    {r.status}
                  </span>
                </div>
              ))}
              {(data?.data || []).length === 0 && (
                <p className="text-center text-sm text-slate-400 py-10">No attendance records for this month.</p>
              )}
            </div>
          </SectionCard>
        </div>
      )}
    </DashboardLayout>
  );
}

export default StudentAttendanceView;
