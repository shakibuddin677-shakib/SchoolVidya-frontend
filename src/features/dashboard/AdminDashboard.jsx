import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, UserRound, BookOpen, Layers, Plus, Wallet, CalendarClock, ClipboardList, Library, BarChart3, Loader2, Award, Star } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import SectionCard from "../../components/ui/SectionCard";
import ProgressRing from "../../components/ui/ProgressRing";
import ClassFilter from "../../components/ui/ClassFilter";
import { useGetDashboardStatsQuery, useGetFeeCollectionReportQuery, useGetAttendanceReportQuery, useGetBestTeachersQuery, useGetStudentProgressQuery } from "../reports/reportsApi";
import { useGetExamsQuery } from "../exams/examsApi";
import { useGetActiveNoticesQuery } from "../notices/noticesApi";

const quickLinks = [
  { label: "Attendance", icon: CalendarClock, path: "/admin/attendance", accent: "teal" },
  { label: "Fees", icon: Wallet, path: "/admin/fees", accent: "marigold" },
  { label: "Library", icon: Library, path: "/admin/library", accent: "coral" },
  { label: "Reports", icon: BarChart3, path: "/admin/reports", accent: "ink" },
];
const accentClasses = { teal: "bg-teal-soft text-teal", marigold: "bg-marigold-soft text-marigold", coral: "bg-coral-soft text-coral", ink: "bg-slate-100 text-ink" };

// Rank badge - top 3 medal colors (gold/silver/bronze), baaki plain numbered circle
const rankBadgeClass = (rank) => {
  if (rank === 0) return "bg-marigold text-ink"; // gold
  if (rank === 1) return "bg-slate-300 text-ink"; // silver
  if (rank === 2) return "bg-[#c98a4b] text-white"; // bronze
  return "bg-slate-100 text-slate-500";
};

const scorePillClass = (pct) =>
  pct >= 90 ? "bg-teal-soft text-teal" : pct >= 75 ? "bg-marigold-soft text-marigold" : pct >= 50 ? "bg-slate-100 text-slate-500" : "bg-coral-soft text-coral";

// Rank-wise leaderboard - "Best Performers" (teachers) aur "Star Students" dono isi ek component se banate hain, comfortably-sized readable rows ke saath
function RankedList({ title, icon: Icon, accent, items, renderName, renderSub, renderScore }) {
  return (
    <SectionCard title={title} action={<Icon size={16} className={`text-${accent}`} />}>
      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div
            key={item._id || idx}
            className="flex items-center gap-3.5 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0 ${rankBadgeClass(idx)}`}>
              {idx + 1}
            </div>
            <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center font-display font-bold text-marigold text-sm shrink-0">
              {renderName(item)?.charAt(0) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{renderName(item)}</p>
              <p className="text-xs text-slate-400 truncate">{renderSub(item)}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${scorePillClass(renderScore(item))}`}>
              {Math.round(renderScore(item))}%
            </span>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-sm text-slate-400 py-10">No data yet</p>}
      </div>
    </SectionCard>
  );
}

function AdminDashboard() {
  // "" = Overall (sab classes ka data), koi ID select karne par sirf usi class ka Fee Collection aur Attendance widgets pe filter lagta hai
  const [classId, setClassId] = useState("");

  // Matches backend GET /api/reports/dashboard-stats exactly
  const { data: statsData, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: feeData } = useGetFeeCollectionReportQuery(classId || undefined);
  const { data: attendanceData } = useGetAttendanceReportQuery(classId || undefined);
  const { data: examsData } = useGetExamsQuery();
  const { data: noticesData } = useGetActiveNoticesQuery();
  const { data: bestTeachersData } = useGetBestTeachersQuery();
  const { data: studentProgressData } = useGetStudentProgressQuery();

  const bestTeachers = (bestTeachersData?.data || []).slice(0, 5);
  const starStudents = (studentProgressData?.data || []).slice(0, 5);

  const stats = statsData?.data;

  // "Overall" chuna hai to sab classes ka average nikalte hain, specific class chuni hai to seedha usi ki entry
  const overallAttendancePct = attendanceData?.data?.length
    ? Math.round(attendanceData.data.reduce((sum, c) => sum + c.attendancePercentage, 0) / attendanceData.data.length)
    : 0;

  // Nearest 3 upcoming exams by start date
  const upcomingExams = [...(examsData?.data || [])]
    .filter((e) => new Date(e.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Admin Dashboard</h1>
            <p className="text-sm text-slate-400">Dashboard / Admin Dashboard</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/fees" className="flex items-center gap-2 bg-white border border-slate-200 text-ink text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-slate-50">
              <Wallet size={16} /> Fees Details
            </Link>
            <Link to="/admin/students" className="flex items-center gap-2 bg-marigold text-ink text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-95">
              <Plus size={16} /> Add Student
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden bg-ink rounded-2xl px-6 py-8 md:px-8">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-marigold/10" />
          <div className="absolute right-16 bottom-0 w-24 h-24 rounded-full bg-teal/10" />
          <div className="relative">
            <h2 className="font-display text-xl md:text-2xl font-bold text-white">Welcome Back, Admin </h2>
            <p className="text-white/50 text-sm mt-1">Have a good day at work — here's what's happening today.</p>
          </div>
        </div>

        {statsLoading ? (
          <div className="flex items-center justify-center py-10 text-slate-400"><Loader2 className="animate-spin mr-2" size={20} /> Loading stats...</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={GraduationCap} label="Total Students" value={(stats?.totalStudents || 0).toLocaleString()} accent="marigold" />
            <StatCard icon={UserRound} label="Total Teachers" value={stats?.totalTeachers || 0} accent="teal" />
            <StatCard icon={Layers} label="Total Classes" value={stats?.totalClasses || 0} accent="coral" />
            <StatCard icon={BookOpen} label="Total Subjects" value={stats?.totalSubjects || 0} accent="ink" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-400">Fee & Attendance Overview</h3>
          <ClassFilter value={classId} onChange={setClassId} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <SectionCard title="Fee Collection" className="lg:col-span-2 flex flex-col items-center justify-center">
            <ProgressRing
              percentage={feeData?.data?.collectionPercentage || 0}
              value={`₹${(feeData?.data?.totalCollected || 0).toLocaleString()}`}
              label={`of ₹${(feeData?.data?.totalDue || 0).toLocaleString()} due`}
              color="#F2B705"
              size={140}
            />
            <p className="text-xs text-coral mt-3">₹{(feeData?.data?.totalPending || 0).toLocaleString()} pending{classId ? "" : " overall"}</p>
          </SectionCard>

          <SectionCard title="Upcoming Exams" action={<Link to="/admin/exams" className="text-xs text-marigold font-medium">View All</Link>}>
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div key={exam._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-9 h-9 rounded-lg bg-coral-soft flex items-center justify-center shrink-0">
                    <ClipboardList size={16} className="text-coral" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink truncate">{exam.name}</p>
                    <p className="text-xs text-slate-400">{exam.classId?.name}</p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {new Date(exam.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              ))}
              {upcomingExams.length === 0 && <p className="text-center text-sm text-slate-400 py-6">No upcoming exams</p>}
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <SectionCard title="Overall Attendance" className="flex flex-col items-center">
            <ProgressRing percentage={overallAttendancePct} color="#2FB8AC" />
            <p className="text-[11px] text-slate-400 mt-3">
              {classId ? "Selected class (all-time)" : "Average across all classes (all-time)"}
            </p>
          </SectionCard>

          <SectionCard title="Notice Board" action={<Link to="/admin/notices" className="text-xs text-marigold font-medium">View All</Link>}>
            <div className="space-y-4">
              {(noticesData?.data || []).slice(0, 3).map((n) => (
                <div key={n._id} className="flex items-start justify-between border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                  <p className="text-sm font-medium text-ink pr-3">{n.title}</p>
                  <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                    {new Date(n.publishDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              ))}
              {(noticesData?.data || []).length === 0 && <p className="text-center text-sm text-slate-400 py-6">No active notices</p>}
            </div>
          </SectionCard>

          <SectionCard title="Quick Links">
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((q) => (
                <Link key={q.label} to={q.path} className={`flex flex-col items-center gap-1.5 rounded-xl p-3 text-sm font-medium text-center hover:brightness-95 ${accentClasses[q.accent]}`}>
                  <q.icon size={18} />
                  {q.label}
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <RankedList
            title="Best Performers"
            icon={Award}
            accent="teal"
            items={bestTeachers}
            renderName={(t) => t.name}
            renderSub={(t) => t.qualification || "Teacher"}
            renderScore={(t) => t.averageMarks}
          />
          <RankedList
            title="Star Students"
            icon={Star}
            accent="marigold"
            items={starStudents}
            renderName={(s) => s.name}
            renderSub={(s) => `${s.className || ""}${s.className && s.sectionName ? ", " : ""}${s.sectionName || ""}`}
            renderScore={(s) => s.averagePercentage}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;
