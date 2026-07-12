import { useSelector } from "react-redux";
import { CalendarClock, Loader2, AlertTriangle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import { useGetTimetableByTeacherQuery } from "./timetableApi";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const accents = ["bg-marigold-soft text-marigold", "bg-teal-soft text-teal", "bg-coral-soft text-coral", "bg-slate-100 text-slate-600"];

// Read-only "my weekly schedule" - Teacher ko section/class chunne ki zaroorat
// nahi, seedha unka apna poora hafte ka schedule (saari sections/classes
// milaakar) dikh jaata hai. Add/Delete yahan nahi hai - wo Admin-only hai.
function TeacherTimetableView() {
  const { user } = useSelector((state) => state.auth);
  const teacherId = user?.profile?._id;

  const { data, isLoading, isError, error } = useGetTimetableByTeacherQuery(teacherId, { skip: !teacherId });

  const periodsByDay = days.reduce((acc, day) => {
    acc[day] = (data?.data || []).filter((p) => p.dayOfWeek === day);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <PageHeader title="My Timetable" breadcrumb="Dashboard / Academic / Timetable" />

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading timetable...
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load timetable"}</p>
        </div>
      )}

      {!isLoading && !isError && (
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
                    <div key={period._id} className={`rounded-xl p-3 ${accents[i % accents.length]}`}>
                      <p className="text-[11px] font-mono opacity-70 mb-1">{period.startTime}–{period.endTime}</p>
                      <p className="text-sm font-semibold">{period.subjectId?.name}</p>
                      <p className="text-xs opacity-70">{period.sectionId?.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {(data?.data || []).length === 0 && (
            <p className="text-center text-sm text-slate-400 py-10">
              <CalendarClock className="mx-auto mb-2 text-slate-300" size={24} />
              No periods scheduled for you yet.
            </p>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default TeacherTimetableView;
