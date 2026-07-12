import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Printer, Loader2, AlertTriangle } from "lucide-react";
import schoolLogo from "../../assets/school-logo.png";
import { useGetResultsByStudentQuery, useGetClassRankingQuery } from "./resultsApi";
import { useGetAttendanceByStudentQuery } from "../attendance/attendanceApi";
import { calculateAttendancePercentageForRange } from "../../utils/attendanceUtils";
import Marksheet from "./Marksheet";

// Standalone printable page - "My Results" ke "Marksheet" button se naye
// tab mein khulta hai. Poora visual Marksheet.jsx (shared component) se
// aata hai - yahan sirf data-fetching + print/back toolbar hai
function MarksheetView() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const profile = user?.profile;
  const studentId = profile?._id;

  const { data, isLoading, isError, error } = useGetResultsByStudentQuery(studentId, { skip: !studentId });

  const examResults = useMemo(() => {
    return (data?.data || [])
      .filter((r) => r.examScheduleId?.examId?._id === examId)
      .sort((a, b) => (a.examScheduleId?.subjectId?.name || "").localeCompare(b.examScheduleId?.subjectId?.name || ""));
  }, [data, examId]);

  const exam = examResults[0]?.examScheduleId?.examId;

  const { data: rankingData } = useGetClassRankingQuery({ examId }, { skip: !exam?.isPublished });
  const myRank = rankingData?.data?.find((s) => s.studentId === studentId);

  // BUG FIX: pehle poori lifetime attendance % dikhti thi (har exam ke
  // liye same number) - ab SELECTED EXAM ke date-range tak simit % nikaalte hain
  const { data: attendanceData } = useGetAttendanceByStudentQuery({ studentId }, { skip: !studentId });
  const attendancePercentage = calculateAttendancePercentageForRange(
    attendanceData?.data,
    exam?.startDate,
    exam?.endDate
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-teal" size={28} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface gap-2 text-coral">
        <AlertTriangle size={28} />
        <p className="text-sm">{error?.data?.message || "Failed to load marksheet"}</p>
      </div>
    );
  }

  if (examResults.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface gap-3 text-center px-4">
        <AlertTriangle size={28} className="text-marigold" />
        <p className="text-sm text-slate-500">No published results found for this exam yet.</p>
        <button onClick={() => navigate("/student/results")} className="text-sm font-medium text-teal">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-6 px-4">
      <style>{`
        @media print {
          @page { margin: 10mm; }
          body { background: white !important; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto flex items-center justify-between mb-4 print:hidden">
        <button onClick={() => navigate("/student/results")} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-ink">
          <ArrowLeft size={16} /> Back to Results
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-teal text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-95"
        >
          <Printer size={16} /> Print / Download
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        <Marksheet
          schoolLogo={schoolLogo}
          exam={exam}
          examResults={examResults}
          profile={profile}
          user={user}
          myRank={myRank}
          totalParticipants={rankingData?.data?.length}
          attendancePercentage={attendancePercentage}
        />
      </div>
    </div>
  );
}

export default MarksheetView;
