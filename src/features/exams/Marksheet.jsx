// Pure presentational Marksheet - koi data-fetching nahi karta, sirf props
// se milा hua data render karta hai. Isi component ko do jagah use karte hain:
// 1. MarksheetView.jsx - standalone printable full page
// 2. StudentResultsView.jsx - "My Results" page ke andar seedha inline dikhta hai

// App ke actual grading system se match karta hai (Result model ka
// pre-save hook — models/result.model.js)
const gradeScale = [
  { range: "90 - 100", grade: "A+", remark: "Outstanding" },
  { range: "75 - 89", grade: "A", remark: "Excellent" },
  { range: "60 - 74", grade: "B", remark: "Good" },
  { range: "40 - 59", grade: "C", remark: "Satisfactory" },
  { range: "0 - 39", grade: "F", remark: "Fail" },
];

const overallGrade = (pct) => {
  if (pct >= 90) return "A+";
  if (pct >= 75) return "A";
  if (pct >= 60) return "B";
  if (pct >= 40) return "C";
  return "F";
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function Marksheet({ schoolLogo, exam, examResults, profile, user, myRank, totalParticipants, attendancePercentage, className = "" }) {
  const totalMax = examResults.reduce((sum, r) => sum + (r.examScheduleId?.maxMarks || 0), 0);
  const totalObtained = examResults.reduce((sum, r) => sum + r.marksObtained, 0);
  const percentage = totalMax ? Math.round((totalObtained / totalMax) * 10000) / 100 : 0;
  const hasFailedSubject = examResults.some((r) => r.grade === "F");

  return (
    <div className={`bg-white rounded-2xl shadow-sm print:shadow-none print:rounded-none p-4 sm:p-6 md:p-8 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-ink pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <img src={schoolLogo} alt="School Logo" className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0" />
          <div className="min-w-0">
            <h1 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-ink truncate">
              School<span className="text-marigold">Vidya</span> Academy
            </h1>
            <p className="text-[11px] text-slate-500 max-w-xs">
              Vill+Post – Maskedih, Ps – Chalkusha, Dist – Hazaribagh, Jharkhand – 825109
            </p>
          </div>
        </div>
        <div className="w-full sm:w-auto shrink-0 border border-slate-200 rounded-xl overflow-hidden text-center sm:min-w-[200px]">
          <div className="bg-ink text-white text-xs font-bold tracking-wide py-1.5">MARKSHEET</div>
          <div className="px-3 py-2">
            <p className="text-[10px] text-slate-400 font-semibold">EXAM NAME</p>
            <p className="text-xs font-bold text-ink uppercase break-words">{exam?.name}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-1.5">EXAM DATE</p>
            <p className="text-[11px] text-ink">{fmtDate(exam?.startDate)} - {fmtDate(exam?.endDate)}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center my-3">
        <span className="bg-ink text-white text-xs font-bold px-4 py-1.5 rounded-lg">
          ACADEMIC YEAR: {profile?.classId?.academicYear || "—"}
        </span>
      </div>

      {/* 1. Student Information */}
      <SectionLabel n={1} title="Student Information" />
      <div className="flex flex-col sm:flex-row gap-4 border border-slate-200 rounded-xl p-4 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 flex-1 text-sm min-w-0">
          <InfoRow label="Student Name" value={user?.name} />
          <InfoRow label="Admission No." value={profile?.admissionNo} />
          <InfoRow label="Roll No." value={profile?.rollNo} />
          <InfoRow label="Class" value={profile?.classId?.name} />
          <InfoRow label="Section" value={profile?.sectionId?.name} />
          <InfoRow label="Date of Birth" value={fmtDate(profile?.dob)} />
          <InfoRow label="Gender" value={profile?.gender} className="capitalize" />
          <InfoRow label="Attendance" value={`${attendancePercentage ?? 0}%`} />
        </div>
        <div className="w-20 h-24 rounded-lg bg-slate-100 overflow-hidden shrink-0 self-center sm:self-start mx-auto">
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-display font-bold text-2xl text-slate-400">
              {user?.name?.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* 2. Subject Wise Marks */}
      <SectionLabel n={2} title="Subject Wise Marks" />
      <div className="overflow-x-auto mb-5 -mx-4 px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[560px] text-sm border border-slate-200 rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-ink text-white text-xs">
              <th className="py-2 px-3 text-left font-semibold">Sr.</th>
              <th className="py-2 px-3 text-left font-semibold">Subject</th>
              <th className="py-2 px-3 text-center font-semibold">Max Marks</th>
              <th className="py-2 px-3 text-center font-semibold">Marks Obtained</th>
              <th className="py-2 px-3 text-center font-semibold">Grade</th>
              <th className="py-2 px-3 text-center font-semibold">Result</th>
            </tr>
          </thead>
          <tbody>
            {examResults.map((r, idx) => (
              <tr key={r._id} className="border-t border-slate-100">
                <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                <td className="py-2 px-3 font-medium text-ink whitespace-nowrap">{r.examScheduleId?.subjectId?.name}</td>
                <td className="py-2 px-3 text-center text-slate-500">{r.examScheduleId?.maxMarks}</td>
                <td className="py-2 px-3 text-center font-bold text-teal">{r.marksObtained}</td>
                <td className="py-2 px-3 text-center font-semibold text-ink">{r.grade}</td>
                <td className={`py-2 px-3 text-center font-semibold ${r.grade === "F" ? "text-coral" : "text-teal"}`}>
                  {r.grade === "F" ? "Fail" : "Pass"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3 & 4. Summary + Grade Scale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <SectionLabel n={3} title="Summary" />
          <div className="border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
            <SummaryRow label="Total Maximum Marks" value={totalMax} />
            <SummaryRow label="Total Marks Obtained" value={totalObtained} bold />
            <SummaryRow label="Percentage" value={`${percentage}%`} bold />
            <SummaryRow label="Overall Grade" value={overallGrade(percentage)} bold />
            {myRank && <SummaryRow label="Rank" value={`${myRank.rank} / ${totalParticipants}`} bold />}
            <SummaryRow label="Result" value={hasFailedSubject ? "FAIL" : "PASS"} bold color={hasFailedSubject ? "text-coral" : "text-teal"} />
          </div>
        </div>
        <div>
          <SectionLabel n={4} title="Grade Scale" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px] text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="py-1.5 px-2.5 text-left font-semibold">Percentage</th>
                  <th className="py-1.5 px-2.5 text-left font-semibold">Grade</th>
                  <th className="py-1.5 px-2.5 text-left font-semibold">Remark</th>
                </tr>
              </thead>
              <tbody>
                {gradeScale.map((g) => (
                  <tr key={g.grade} className="border-t border-slate-100">
                    <td className="py-1.5 px-2.5">{g.range}</td>
                    <td className="py-1.5 px-2.5 font-semibold">{g.grade}</td>
                    <td className="py-1.5 px-2.5 text-slate-500">{g.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Teacher Remarks */}
      <SectionLabel n={5} title="Teacher Remarks" />
      <div className="border border-slate-200 rounded-xl p-4 mb-5 text-sm text-slate-400 italic">
        No remarks added for this exam.
      </div>

      {/* 6. Signatures */}
      <SectionLabel n={6} title="Signatures" />
      <div className="flex flex-wrap justify-between gap-6 border border-slate-200 rounded-xl p-4">
        <SignatureBlock label="Class Teacher" name={profile?.sectionId?.classTeacherId?.name} />
        <SignatureBlock label="Principal" name={null} />
      </div>

      <p className="text-[11px] text-slate-400 text-center mt-5">
        ★ This is a computer generated marksheet. No signature is required.
      </p>
    </div>
  );
}

function SectionLabel({ n, title }) {
  return (
    <div className="inline-block bg-ink text-white text-xs font-bold px-3 py-1.5 rounded-lg mb-2">
      {n}. {title.toUpperCase()}
    </div>
  );
}

function InfoRow({ label, value, className = "" }) {
  return (
    <p className="break-words">
      <span className="text-slate-400">{label}</span>
      <span className="text-ink font-medium"> : </span>
      <span className={`text-ink font-medium ${className}`}>{value || "—"}</span>
    </p>
  );
}

function SummaryRow({ label, value, bold, color }) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <span className="text-slate-500">{label}</span>
      <span className={`${bold ? "font-bold" : "font-medium"} ${color || "text-ink"}`}>{value}</span>
    </div>
  );
}

function SignatureBlock({ label, name }) {
  return (
    <div className="text-center min-w-[120px]">
      <div className="h-10" /> {/* physical signing ke liye khaali jagah */}
      <p className="border-t border-slate-300 pt-1 text-xs font-semibold text-ink">{name || label}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
    </div>
  );
}

export default Marksheet;
