import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Loader2, AlertTriangle, Trophy, ChevronDown, Printer } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import SectionCard from "../../components/ui/SectionCard";
import schoolLogo from "../../assets/school-logo.png";
import { useGetResultsByStudentQuery, useGetClassRankingQuery } from "./resultsApi";
import { useGetAttendanceByStudentQuery } from "../attendance/attendanceApi";
import { calculateAttendancePercentageForRange } from "../../utils/attendanceUtils";
import Marksheet from "./Marksheet";

const rankBadgeClass = (rank) => {
  if (rank === 1) return "bg-marigold text-ink";
  if (rank === 2) return "bg-slate-300 text-ink";
  if (rank === 3) return "bg-[#c98a4b] text-white";
  return "bg-slate-100 text-slate-500";
};

function StudentResultsView() {
  const { user } = useSelector((state) => state.auth);
  const profile = user?.profile;
  const studentId = profile?._id;

  const { data, isLoading, isError, error } = useGetResultsByStudentQuery(studentId, { skip: !studentId });

  // Har result se distinct (published) exams nikaalo - inhi mein se ek chunke uska poora marksheet + ranking dikhta hai
  const examOptions = useMemo(() => {
    const map = new Map();
    (data?.data || []).forEach((r) => {
      const exam = r.examScheduleId?.examId;
      if (exam?._id && !map.has(exam._id)) map.set(exam._id, exam);
    });
    return Array.from(map.values());
  }, [data]);

  const [selectedExamId, setSelectedExamId] = useState("");

  // Jaise hi exam options aayein, sabse pehla exam default select kar do
  if (!selectedExamId && examOptions.length > 0) {
    setSelectedExamId(examOptions[0]._id);
  }

  // Chuni hui exam ke sirf isi student ke subject-wise results, sorted
  const examResults = useMemo(() => {
    return (data?.data || [])
      .filter((r) => r.examScheduleId?.examId?._id === selectedExamId)
      .sort((a, b) => (a.examScheduleId?.subjectId?.name || "").localeCompare(b.examScheduleId?.subjectId?.name || ""));
  }, [data, selectedExamId]);

  const selectedExam = examResults[0]?.examScheduleId?.examId;

  const { data: rankingData, isFetching: rankingLoading } = useGetClassRankingQuery(
    { examId: selectedExamId },
    { skip: !selectedExamId }
  );
  const myRankEntry = rankingData?.data?.find((s) => s.studentId === studentId);

  // pehle yahan poori lifetime attendance % use ho rahi thi (jo har exam ke liye same dikhti thi).
  const { data: attendanceData } = useGetAttendanceByStudentQuery({ studentId }, { skip: !studentId });
  const attendancePercentage = calculateAttendancePercentageForRange(
    attendanceData?.data,
    selectedExam?.startDate,
    selectedExam?.endDate
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="My Results"
        breadcrumb="Dashboard / Examinations / Results"
        actions={
          examOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-medium text-slate-600 outline-none focus:border-teal cursor-pointer"
                >
                  {examOptions.map((e) => (
                    <option key={e._id} value={e._id}>{e.name}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {selectedExamId && (
                <Link
                  to={`/student/results/${selectedExamId}/marksheet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-teal text-white text-xs font-semibold px-3 py-2 rounded-xl hover:brightness-95"
                >
                  <Printer size={13} /> Print / Download
                </Link>
              )}
            </div>
          )
        }
      />

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading results...
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load results"}</p>
        </div>
      )}

      {!isLoading && !isError && examResults.length > 0 && (
        <Marksheet
          schoolLogo={schoolLogo}
          exam={selectedExam}
          examResults={examResults}
          profile={profile}
          user={user}
          myRank={myRankEntry}
          totalParticipants={rankingData?.data?.length}
          attendancePercentage={attendancePercentage}
        />
      )}

      {!isLoading && !isError && examOptions.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-20">No results published yet.</p>
      )}

      {examOptions.length > 0 && (
        <div className="mt-5">
          <SectionCard
            title="Class Ranking"
            action={<Trophy size={16} className="text-marigold" />}
          >
            {myRankEntry && (
              <div className="flex items-center justify-between bg-teal-soft rounded-xl px-4 py-3 mb-4">
                <p className="text-sm font-semibold text-teal">Your Rank</p>
                <p className="font-display text-xl font-bold text-teal">#{myRankEntry.rank}</p>
              </div>
            )}

            {rankingLoading ? (
              <div className="flex items-center justify-center py-10 text-slate-400">
                <Loader2 className="animate-spin mr-2" size={18} /> Loading ranking...
              </div>
            ) : (
              <div className="space-y-1.5">
                {(rankingData?.data || []).map((s) => (
                  <div
                    key={s.studentId}
                    className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-colors ${
                      s.studentId === studentId ? "bg-teal-soft" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0 ${rankBadgeClass(s.rank)}`}>
                      {s.rank}
                    </div>
                    <div className="w-9 h-9 rounded-full bg-ink flex items-center justify-center font-display font-bold text-marigold text-xs shrink-0">
                      {s.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">
                        {s.name} {s.studentId === studentId && <span className="text-teal">(You)</span>}
                      </p>
                      <p className="text-xs text-slate-400">Roll No: {s.rollNo}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-ink">{s.percentage}%</p>
                      <p className="text-[11px] text-slate-400">{s.totalObtained}/{s.totalMax}</p>
                    </div>
                  </div>
                ))}
                {(rankingData?.data || []).length === 0 && (
                  <p className="text-center text-sm text-slate-400 py-10">Ranking not available yet</p>
                )}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </DashboardLayout>
  );
}

export default StudentResultsView;
