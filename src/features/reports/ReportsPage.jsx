import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Loader2 } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import SectionCard from "../../components/ui/SectionCard";
import StatCard from "../../components/ui/StatCard";
import ProgressRing from "../../components/ui/ProgressRing";
import ClassFilter from "../../components/ui/ClassFilter";
import { GraduationCap, UserRound, Layers, BookOpen } from "lucide-react";
import {
  useGetDashboardStatsQuery,
  useGetAttendanceReportQuery,
  useGetFeeCollectionReportQuery,
  useGetExamPerformanceReportQuery,
} from "./reportsApi";

function ReportsPage() {
  // yeh do filters ALAG-ALAG hain, ek doosre se independent - Fee Collection card apna filter khud handle karta hai, Exam Performance apna.
  const [feeClassId, setFeeClassId] = useState("");
  const [examClassId, setExamClassId] = useState("");

  const { data: statsData, isLoading: statsLoading } = useGetDashboardStatsQuery();
  // Attendance yahan hamesha "Overall" (sab classes) rehta hai - iske liye filter nahi maanga gaya, isliye no classId
  const { data: attendanceData, isLoading: attLoading } = useGetAttendanceReportQuery();
  const { data: feeData, isLoading: feeLoading } = useGetFeeCollectionReportQuery(feeClassId || undefined);
  const { data: examData, isLoading: examLoading } = useGetExamPerformanceReportQuery(examClassId || undefined);

  const stats = statsData?.data;
  const fee = feeData?.data;

  // Sab classes ka average attendance %
  const overallAttendancePct = attendanceData?.data?.length
    ? Math.round(
        attendanceData.data.reduce((sum, c) => sum + c.attendancePercentage, 0) /
          attendanceData.data.length
      )
    : 0;

  return (
    <DashboardLayout>
      <PageHeader title="Reports & Analytics" breadcrumb="Dashboard / Reports" />

      {statsLoading ? (
        <div className="flex items-center justify-center py-10 text-slate-400"><Loader2 className="animate-spin mr-2" size={20} /> Loading...</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={GraduationCap} label="Total Students" value={(stats?.totalStudents || 0).toLocaleString()} accent="marigold" />
          <StatCard icon={UserRound} label="Total Teachers" value={stats?.totalTeachers || 0} accent="teal" />
          <StatCard icon={Layers} label="Total Classes" value={stats?.totalClasses || 0} accent="coral" />
          <StatCard icon={BookOpen} label="Total Subjects" value={stats?.totalSubjects || 0} accent="ink" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <SectionCard title="Overall Attendance" className="flex flex-col items-center justify-center">
          {attLoading ? (
            <Loader2 className="animate-spin text-teal" />
          ) : (
            <>
              <ProgressRing percentage={overallAttendancePct} color="#2FB8AC" size={120} />
              <p className="text-[11px] text-slate-400 mt-3 text-center">Average across all classes (all-time)</p>
            </>
          )}
        </SectionCard>

        <SectionCard title="Attendance by Class" className="lg:col-span-2">
          {attLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-400"><Loader2 className="animate-spin" /></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={attendanceData?.data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="className" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eee" }} />
                <Bar dataKey="attendancePercentage" fill="#2FB8AC" radius={[8, 8, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <p className="text-[11px] text-slate-400 text-center mt-2">All-time average, per class</p>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <SectionCard
          title="Fee Collection"
          className="lg:col-span-3 flex flex-col items-center justify-center"
          action={<ClassFilter value={feeClassId} onChange={setFeeClassId} />}
        >
          {feeLoading ? (
            <Loader2 className="animate-spin text-marigold" />
          ) : (
            <>
              <ProgressRing
                percentage={fee?.collectionPercentage || 0}
                value={`${fee?.collectionPercentage || 0}%`}
                color="#F2B705"
                size={130}
              />
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-4 text-center text-xs">
                <div>
                  <p className="font-display font-bold text-ink">₹{(fee?.totalCollected || 0).toLocaleString()}</p>
                  <p className="text-slate-400">Collected</p>
                </div>
                <div>
                  <p className="font-display font-bold text-coral">₹{(fee?.totalPending || 0).toLocaleString()}</p>
                  <p className="text-slate-400">Pending</p>
                </div>
              </div>
            </>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Exam Performance by Subject"
        action={<ClassFilter value={examClassId} onChange={setExamClassId} />}
      >
        {examLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400"><Loader2 className="animate-spin" /></div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={examData?.data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="subjectName" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eee" }} />
                <Bar dataKey="averageMarks" fill="#F2B705" radius={[8, 8, 0, 0]} barSize={30} name="Average" />
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {(examData?.data || []).map((s) => (
                <div key={s._id} className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xs font-semibold text-ink truncate">{s.subjectName}</p>
                  <p className="text-[11px] text-teal">High: {s.highestMarks}</p>
                  <p className="text-[11px] text-coral">Low: {s.lowestMarks}</p>
                </div>
              ))}
            </div>
          </>
        )}
        {!examLoading && (examData?.data || []).length === 0 && (
          <p className="text-center text-sm text-slate-400 py-10">No exam results recorded yet.</p>
        )}
      </SectionCard>
    </DashboardLayout>
  );
}

export default ReportsPage;
