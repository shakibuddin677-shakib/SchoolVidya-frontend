import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Wallet, ClipboardList, CalendarClock, CalendarCheck, AlertCircle, Loader2, Bus, BookOpen, Utensils, Home as HomeIcon, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import DashboardLayout from "../../components/layout/DashboardLayout";
import SectionCard from "../../components/ui/SectionCard";
import ProgressRing from "../../components/ui/ProgressRing";
import { useGetAttendanceByStudentQuery } from "../attendance/attendanceApi";
import { useGetFeeStatusByStudentQuery } from "../fees/feesApi";
import { useGetResultsByStudentQuery } from "../exams/resultsApi";
import { useGetExamsQuery } from "../exams/examsApi";
import { useGetTimetableBySectionQuery } from "../timetable/timetableApi";
import { useGetHomeworkBySectionQuery } from "../homework/homeworkApi";

const today = new Date();
const todayName = today.toLocaleDateString("en-US", { weekday: "long" });

// Fee type ke naam se best-match icon chunte hain - "Transport" -> Bus, "Mess/Canteen" -> Utensils, waghera.
const feeTypeIcon = (feeType = "") => {
  const t = feeType.toLowerCase();
  if (t.includes("transport") || t.includes("bus")) return Bus;
  if (t.includes("book") || t.includes("library")) return BookOpen;
  if (t.includes("exam")) return ClipboardList;
  if (t.includes("mess") || t.includes("canteen") || t.includes("food")) return Utensils;
  if (t.includes("hostel") || t.includes("boarding")) return HomeIcon;
  return Wallet;
};

// Har row ko ek alag soft color de dete hain (index ke hisaab se cycle) - reference design ki tarah har fee type ka apna icon-circle color
const feeColorPalette = [
  "bg-teal-soft text-teal",
  "bg-marigold-soft text-marigold",
  "bg-coral-soft text-coral",
  "bg-slate-100 text-slate-500",
];

// Custom tooltip - subject, exam name, marks/maxMarks aur grade sab ek jagah, dashboard ki design language (rounded, soft shadow) follow karta hai
function PerformanceTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-ink text-white rounded-xl px-3.5 py-2.5 shadow-lg text-xs min-w-[140px]">
      <p className="font-display font-semibold text-sm mb-0.5">{d.subject}</p>
      <p className="text-white/50 text-[10px] mb-1.5">{d.examName}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="text-white/70">Marks</span>
        <span className="font-mono font-semibold">
          {d.marksObtained}/{d.maxMarks}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-white/70">Percentage</span>
        <span className="font-mono font-semibold text-marigold">{d.percentage}%</span>
      </div>
      {d.grade && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-white/70">Grade</span>
          <span className="font-semibold">{d.grade}</span>
        </div>
      )}
    </div>
  );
}

function StudentDashboard() {
  const { user } = useSelector((state) => state.auth);
  const studentId = user?.profile?._id;
  const classId = user?.profile?.classId?._id;
  const sectionId = user?.profile?.sectionId?._id;

  const { data: attendanceData, isLoading: attLoading } = useGetAttendanceByStudentQuery(
    { studentId, month: today.getMonth() + 1, year: today.getFullYear() },
    { skip: !studentId }
  );
  const { data: feeData } = useGetFeeStatusByStudentQuery(studentId, { skip: !studentId });
  const { data: resultsData } = useGetResultsByStudentQuery(studentId, { skip: !studentId });
  const { data: examsData } = useGetExamsQuery({ classId }, { skip: !classId });
  const { data: timetableData } = useGetTimetableBySectionQuery(sectionId, { skip: !sectionId });
  const { data: homeworkData } = useGetHomeworkBySectionQuery(sectionId, { skip: !sectionId });

  const todaysClasses = (timetableData?.data || []).filter((p) => p.dayOfWeek === todayName);

  const upcomingExams = [...(examsData?.data || [])]
    .filter((e) => new Date(e.startDate) >= today)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 3);

  // Har result se distinct exams nikaalo, taaki filter dropdown bana sakein
  const examOptions = useMemo(() => {
    const map = new Map();
    (resultsData?.data || []).forEach((r) => {
      const exam = r.examScheduleId?.examId;
      if (exam?._id && !map.has(exam._id)) map.set(exam._id, exam);
    });
    return Array.from(map.values());
  }, [resultsData]);

  const [selectedExamId, setSelectedExamId] = useState("all");

  const filteredResults = (resultsData?.data || []).filter(
    (r) => selectedExamId === "all" || r.examScheduleId?.examId?._id === selectedExamId
  );

  // Results ko chart-friendly shape mein badalte hain - percentage per subject
  const performanceChart = filteredResults.map((r) => ({
    subject: r.examScheduleId?.subjectId?.name || "—",
    code: r.examScheduleId?.subjectId?.code || "",
    examName: r.examScheduleId?.examId?.name || "",
    marksObtained: r.marksObtained,
    maxMarks: r.examScheduleId?.maxMarks || 0,
    percentage: r.examScheduleId?.maxMarks
      ? Math.round((r.marksObtained / r.examScheduleId.maxMarks) * 100)
      : 0,
    grade: r.grade,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Student Dashboard</h1>
            <p className="text-sm text-slate-400">Dashboard / Student Dashboard</p>
          </div>
          <div className="flex gap-2">
            <a href="/student/results" className="flex items-center gap-2 bg-white border border-slate-200 text-ink text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-slate-50">
              <ClipboardList size={16} /> Exam Result
            </a>
            <a href="/student/fees" className="flex items-center gap-2 bg-marigold text-ink text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-95">
              <Wallet size={16} /> Pay Fees
            </a>
          </div>
        </div>

        <div className="relative overflow-hidden bg-ink rounded-2xl p-6 flex items-center gap-4">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-marigold/10" />
          <div className="relative w-16 h-16 rounded-2xl bg-marigold flex items-center justify-center font-display font-bold text-ink text-xl shrink-0">
            {user?.name?.charAt(0)}
          </div>
          <div className="relative">
            <p className="text-xs font-mono text-white/40">#{user?._id?.slice(-8)}</p>
            <p className="font-display font-bold text-white">{user?.name}</p>
            <p className="text-xs text-white/50">
              Class {user?.profile?.classId?.name}, {user?.profile?.sectionId?.name} • Roll No: {user?.profile?.rollNo}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <SectionCard title="Attendance — This Month" className="flex flex-col items-center">
            {attLoading ? <Loader2 className="animate-spin text-teal" /> : (
              <>
                <ProgressRing percentage={attendanceData?.summary?.attendancePercentage || 0} color="#2FB8AC" size={110} strokeWidth={11} />
                <div className="flex gap-4 mt-3 text-xs text-slate-500">
                  <span>Present: {attendanceData?.summary?.present || 0}</span>
                  <span>Absent: {attendanceData?.summary?.absent || 0}</span>
                  <span>Halfday: {attendanceData?.summary?.halfday || 0}</span>
                </div>
              </>
            )}
          </SectionCard>

          <SectionCard title="Fee Status" action={<AlertCircle size={16} className="text-coral" />}>
            <div className="flex flex-col items-center justify-center h-full py-2">
              <p className="font-display text-3xl font-bold text-coral">₹{(feeData?.summary?.totalPending || 0).toLocaleString()}</p>
              <p className="text-xs text-slate-400 mb-4">Pending out of ₹{(feeData?.summary?.totalDue || 0).toLocaleString()}</p>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal rounded-full"
                  style={{ width: `${feeData?.summary?.totalDue ? (feeData.summary.totalPaid / feeData.summary.totalDue) * 100 : 0}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">₹{(feeData?.summary?.totalPaid || 0).toLocaleString()} paid so far</p>
            </div>
          </SectionCard>

          <SectionCard title={`Today's Class (${todayName})`} action={<CalendarClock size={16} className="text-slate-400" />}>
            <div className="space-y-2">
              {todaysClasses.map((c) => (
                <div key={c._id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-ink">{c.subjectId?.name}</p>
                    <p className="text-[11px] font-mono text-slate-400">{c.startTime}–{c.endTime}</p>
                  </div>
                </div>
              ))}
              {todaysClasses.length === 0 && <p className="text-center text-xs text-slate-400 py-6">No classes today</p>}
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Fees Reminder"
          action={
            user?.profile?.classId?.academicYear && (
              <span className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                <CalendarClock size={12} className="text-slate-400" /> {user.profile.classId.academicYear} <ChevronDown size={12} className="text-slate-400" />
              </span>
            )
          }
        >
          <div className="space-y-1">
            {(feeData?.data || []).map((f, idx) => {
              const Icon = feeTypeIcon(f.feeType);
              const isDue = f.status !== "paid";
              return (
                <div key={f.feeStructureId} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${feeColorPalette[idx % feeColorPalette.length]}`}>
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink flex items-center gap-1.5">
                      {f.feeType}
                      {isDue && (
                        <span className="text-[10px] font-semibold text-coral flex items-center gap-0.5">
                          <span className="w-1 h-1 rounded-full bg-coral" /> Due
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      {isDue ? `₹${f.paidAmount.toLocaleString()} + ₹${f.pendingAmount.toLocaleString()}` : `₹${f.totalAmount.toLocaleString()}`}
                    </p>
                  </div>
                  {isDue ? (
                    <a
                      href="/student/fees"
                      className="text-xs font-semibold bg-teal text-white px-4 py-2 rounded-xl hover:brightness-95 shrink-0"
                    >
                      Pay now
                    </a>
                  ) : (
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-slate-400">Last Date</p>
                      <p className="text-xs font-medium text-ink">
                        {f.dueDate ? new Date(f.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            {(feeData?.data || []).length === 0 && (
              <p className="text-center text-sm text-slate-400 py-8">No fee structures for your class yet</p>
            )}
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <SectionCard
            title="Performance"
            className="lg:col-span-2"
            action={
              examOptions.length > 0 && (
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="text-xs font-medium text-ink bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-teal cursor-pointer"
                >
                  <option value="all">All Exams</option>
                  {examOptions.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              )
            }
          >
            {performanceChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={performanceChart} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barCategoryGap="28%">
                  <defs>
                    <linearGradient id="barHigh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2FB8AC" stopOpacity={1} />
                      <stop offset="100%" stopColor="#2FB8AC" stopOpacity={0.55} />
                    </linearGradient>
                    <linearGradient id="barMid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f2b705" stopOpacity={1} />
                      <stop offset="100%" stopColor="#f2b705" stopOpacity={0.55} />
                    </linearGradient>
                    <linearGradient id="barLow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e1526e" stopOpacity={1} />
                      <stop offset="100%" stopColor="#e1526e" stopOpacity={0.55} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#eef1f0" />
                  <XAxis
                    dataKey="subject"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickFormatter={(v) => `${v}%`}
                    width={36}
                  />
                  <Tooltip cursor={{ fill: "#f5f7f6" }} content={<PerformanceTooltip />} />
                  <Bar dataKey="percentage" radius={[8, 8, 0, 0]} maxBarSize={42}>
                    {performanceChart.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={
                          entry.percentage >= 75 ? "url(#barHigh)" : entry.percentage >= 40 ? "url(#barMid)" : "url(#barLow)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-slate-400 py-16">No results published yet</p>
            )}
          </SectionCard>

          <SectionCard title="Upcoming Exams" action={<CalendarCheck size={16} className="text-slate-400" />}>
            <div className="space-y-3">
              {upcomingExams.map((e) => (
                <div key={e._id} className="p-3 rounded-xl bg-slate-50">
                  <p className="text-sm font-semibold text-ink">{e.name}</p>
                  <p className="text-xs text-slate-400">{e.term}</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    {new Date(e.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </p>
                </div>
              ))}
              {upcomingExams.length === 0 && <p className="text-center text-xs text-slate-400 py-6">No upcoming exams</p>}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Homework" action={<a href="/student/homework" className="text-xs text-marigold font-medium">All Subjects</a>}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(homeworkData?.data || []).slice(0, 3).map((h) => (
              <div key={h._id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-marigold font-semibold">{h.subjectId?.name}</p>
                  <p className="text-sm font-medium text-ink truncate">{h.title}</p>
                  <p className="text-[11px] text-slate-400">Due {new Date(h.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</p>
                </div>
              </div>
            ))}
            {(homeworkData?.data || []).length === 0 && <p className="text-center text-sm text-slate-400 py-6 col-span-full">No homework assigned</p>}
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}

export default StudentDashboard;
