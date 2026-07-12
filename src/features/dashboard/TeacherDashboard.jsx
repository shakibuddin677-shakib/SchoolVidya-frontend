import { useMemo } from "react";
import { useSelector } from "react-redux";
import { CalendarClock, Loader2, Medal, TrendingUp } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import SectionCard from "../../components/ui/SectionCard";
import { useGetTimetableByTeacherQuery } from "../timetable/timetableApi";
import { useGetSectionsQuery } from "../classes/sectionsApi";
import { useGetExamPerformanceReportQuery, useGetStudentProgressQuery } from "../reports/reportsApi";

const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

// Percentage ke hisaab se pill ka color - poore dashboard mein consistent
// teal/marigold/coral scale follow karta hai
const scoreColor = (pct) =>
  pct >= 90 ? "bg-teal text-white" : pct >= 75 ? "bg-marigold text-ink" : pct >= 50 ? "bg-slate-400 text-white" : "bg-coral text-white";

const barGradient = (pct) => (pct >= 75 ? "from-teal to-teal/70" : pct >= 40 ? "from-marigold to-marigold/70" : "from-coral to-coral/70");

function TeacherDashboard() {
  const { user } = useSelector((state) => state.auth);
  const teacherId = user?.profile?._id;

  const { data: timetableData, isLoading: ttLoading } = useGetTimetableByTeacherQuery(teacherId, { skip: !teacherId });
  // BUG FIX: "My Sections" pehle SIRF timetable se derive hota tha - agar
  // teacher ka timetable abhi khaali hai (koi period schedule nahi hua),
  // to widget "No sections assigned yet" dikhata tha, CHAHE teacher us
  // section ka CLASS TEACHER (homeroom) already assigned ho
  // (Section.classTeacherId - yeh field User ko refer karta hai).
  // Fix: sab sections fetch karo, aur dono jagah se union banao -
  // (1) jin sections mein yeh subject padhata hai (timetable se)
  // (2) jin sections ka yeh class-teacher hai (classTeacherId se)
  const { data: sectionsData } = useGetSectionsQuery();
  const { data: perfData } = useGetExamPerformanceReportQuery();

  const todaysClasses = (timetableData?.data || []).filter((p) => p.dayOfWeek === todayName);

  const mySections = useMemo(() => {
    const sectionMap = new Map();
    (timetableData?.data || []).forEach((p) => {
      if (p.sectionId?._id) sectionMap.set(p.sectionId._id, { name: p.sectionId.name, className: p.sectionId.classId?.name });
    });
    (sectionsData?.data || []).forEach((s) => {
      if (s.classTeacherId?._id === user?._id) sectionMap.set(s._id, { name: s.name, className: s.classId?.name });
    });
    return Array.from(sectionMap.entries());
  }, [timetableData, sectionsData, user?._id]);

  const mySectionIds = useMemo(() => mySections.map(([id]) => id), [mySections]);

  // Teacher ke apne subjects ke IDs - exam performance report ko isi se filter karte hain
  const mySubjectIds = (user?.profile?.subjects || []).map((s) => s._id || s);
  const mySubjectPerformance = (perfData?.data || []).filter((p) => mySubjectIds.includes(p._id));

  // Student Progress + Best Performers dono isi ek endpoint se aate hain -
  // sirf teacher ke apne sections tak seemit (mySectionIds)
  const { data: progressData, isLoading: progressLoading } = useGetStudentProgressQuery(mySectionIds, {
    skip: mySectionIds.length === 0,
  });
  const studentProgress = progressData?.data || [];

  // "Best Performers" - section-wise average (har section ke students ka
  // overall average nikaal ke, sabse zyada performing sections top pe)
  const sectionPerformance = useMemo(() => {
    const bySection = new Map();
    studentProgress.forEach((s) => {
      if (!s.sectionId) return;
      const key = s.sectionId;
      if (!bySection.has(key)) {
        bySection.set(key, { sectionId: key, className: s.className, sectionName: s.sectionName, total: 0, count: 0 });
      }
      const entry = bySection.get(key);
      entry.total += s.averagePercentage;
      entry.count += 1;
    });
    return Array.from(bySection.values())
      .map((e) => ({ ...e, averagePercentage: Math.round(e.total / e.count) }))
      .sort((a, b) => b.averagePercentage - a.averagePercentage)
      .slice(0, 5);
  }, [studentProgress]);

  // "Student Progress" - top individual students across teacher's sections
  const topStudents = studentProgress.slice(0, 6);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Teacher Dashboard</h1>
          <p className="text-sm text-slate-400">Dashboard / Teacher Dashboard</p>
        </div>

        <div className="relative overflow-hidden bg-teal rounded-2xl px-6 py-8 md:px-8">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="relative">
            <h2 className="font-display text-xl md:text-2xl font-bold text-white">Good Morning, {user?.name?.split(" ")[0]} </h2>
            <p className="text-white/70 text-sm mt-1">Have a great day teaching!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <SectionCard className="lg:col-span-2 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-ink flex items-center justify-center font-display font-bold text-marigold text-2xl shrink-0">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-mono text-slate-400">#{user?.profile?.employeeId}</p>
              <p className="font-display font-bold text-lg text-ink">{user?.name}</p>
              <p className="text-sm text-slate-400">{user?.profile?.qualification}</p>
              <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start mt-2">
                {(user?.profile?.subjects || []).map((s) => (
                  <span key={s._id || s.name} className="text-[11px] bg-marigold-soft text-marigold px-2 py-0.5 rounded-md font-medium">
                    {s.name}{s.classId?.name ? ` — ${s.classId.name}` : ""}
                  </span>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title={`Today (${todayName})`} action={<CalendarClock size={16} className="text-slate-400" />}>
            {ttLoading ? (
              <Loader2 className="animate-spin text-teal mx-auto my-6" />
            ) : (
              <div className="space-y-2">
                {todaysClasses.slice(0, 3).map((c) => (
                  <div key={c._id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-ink">{c.subjectId?.name}</p>
                      <p className="text-xs text-slate-400">{c.sectionId?.name}</p>
                    </div>
                    <span className="text-[11px] font-mono text-teal">{c.startTime}–{c.endTime}</span>
                  </div>
                ))}
                {todaysClasses.length === 0 && <p className="text-center text-xs text-slate-400 py-6">No classes today</p>}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SectionCard title="Student Performance" action={<TrendingUp size={16} className="text-slate-400" />}>
            {progressLoading ? (
              <Loader2 className="animate-spin text-teal mx-auto my-6" />
            ) : (
              <div className="space-y-4">
                {sectionPerformance.map((s) => (
                  <div key={s.sectionId} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-ink flex items-center justify-center font-display font-bold text-marigold text-xs shrink-0">
                      {s.className?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink mb-1.5 truncate">
                        {s.className}{s.sectionName ? `, ${s.sectionName}` : ""}
                      </p>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${barGradient(s.averagePercentage)}`}
                          style={{ width: `${s.averagePercentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-500 shrink-0 w-9 text-right">
                      {s.averagePercentage}%
                    </span>
                  </div>
                ))}
                {sectionPerformance.length === 0 && (
                  <p className="text-center text-sm text-slate-400 py-6">No exam results recorded yet</p>
                )}
              </div>
            )}
          </SectionCard>

          <SectionCard title="My Subject Performance" action={<span className="text-[10px] text-slate-400">School-wide avg</span>}>
            <div className="space-y-4">
              {mySubjectPerformance.map((p) => (
                <div key={p._id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-ink font-medium">
                      {p.subjectName}{p.className ? <span className="text-slate-400 font-normal"> — {p.className}</span> : ""}
                    </span>
                    <span className="text-slate-400 font-mono text-xs">{p.averageMarks}% avg</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-marigold rounded-full" style={{ width: `${p.averageMarks}%` }} />
                  </div>
                </div>
              ))}
              {mySubjectPerformance.length === 0 && <p className="text-center text-sm text-slate-400 py-6">No exam results recorded yet</p>}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Student Progress" action={<span className="text-[10px] text-slate-400">Top performers</span>}>
          {progressLoading ? (
            <Loader2 className="animate-spin text-teal mx-auto my-6" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {topStudents.map((s, idx) => (
                <div
                  key={s.studentId}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-teal-soft flex items-center justify-center font-display font-bold text-teal text-sm shrink-0">
                    {s.name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{s.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {s.className}, {s.sectionName}
                    </p>
                  </div>
                  {idx < 2 && (
                    <Medal size={16} className={idx === 0 ? "text-marigold shrink-0" : "text-slate-300 shrink-0"} />
                  )}
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${scoreColor(s.averagePercentage)}`}>
                    {Math.round(s.averagePercentage)}%
                  </span>
                </div>
              ))}
              {topStudents.length === 0 && (
                <p className="text-center text-sm text-slate-400 py-6 col-span-full">No exam results recorded yet</p>
              )}
            </div>
          )}
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}

export default TeacherDashboard;
