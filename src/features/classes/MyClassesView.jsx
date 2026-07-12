import { useSelector } from "react-redux";
import { BookOpen, Loader2, AlertTriangle, Star } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import SectionCard from "../../components/ui/SectionCard";
import { useGetTimetableByTeacherQuery } from "../timetable/timetableApi";
import { useGetSectionsQuery } from "./sectionsApi";

// "My Classes" - un saari sections ki list jinse yeh Teacher juda hai:
// (1) jahan wo koi subject padhata hai (Timetable se pata chalta hai)
// (2) jis section ka wo CLASS TEACHER (homeroom in-charge) hai
// (TeacherDashboard ke "My Sections" widget wali hi union-logic yahan
// ek dedicated, poori list wale page ke roop mein hai)
function MyClassesView() {
  const { user } = useSelector((state) => state.auth);
  const teacherId = user?.profile?._id;

  const { data: timetableData, isLoading: ttLoading, isError, error } = useGetTimetableByTeacherQuery(teacherId, { skip: !teacherId });
  const { data: sectionsData, isLoading: sectionsLoading } = useGetSectionsQuery({});

  const isLoading = ttLoading || sectionsLoading;

  // sectionId -> { name, className, isClassTeacher, subjects: Set }
  const classMap = new Map();

  (timetableData?.data || []).forEach((p) => {
    const id = p.sectionId?._id;
    if (!id) return;
    const existing = classMap.get(id) || { name: p.sectionId?.name, className: "", isClassTeacher: false, subjects: new Set() };
    if (p.subjectId?.name) existing.subjects.add(p.subjectId.name);
    classMap.set(id, existing);
  });

  (sectionsData?.data || []).forEach((s) => {
    if (s.classTeacherId?._id === user?._id) {
      const existing = classMap.get(s._id) || { name: s.name, className: s.classId?.name || "", isClassTeacher: false, subjects: new Set() };
      existing.isClassTeacher = true;
      existing.className = s.classId?.name || existing.className;
      existing.name = s.name;
      classMap.set(s._id, existing);
    } else if (classMap.has(s._id)) {
      // Timetable se already mila hai - class ka naam bhi jod do
      classMap.get(s._id).className = s.classId?.name || "";
    }
  });

  const myClasses = Array.from(classMap.entries());

  return (
    <DashboardLayout>
      <PageHeader title="My Classes" breadcrumb="Dashboard / Academic / My Classes" />

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading your classes...
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load classes"}</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {myClasses.map(([id, info]) => (
            <SectionCard key={id}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-teal-soft flex items-center justify-center shrink-0">
                  <BookOpen size={18} className="text-teal" />
                </div>
                {info.isClassTeacher && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold bg-marigold-soft text-marigold px-2 py-1 rounded-md">
                    <Star size={11} /> Class Teacher
                  </span>
                )}
              </div>
              <p className="font-display font-bold text-lg text-ink">
                {info.className ? `${info.className} — ` : ""}{info.name}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Array.from(info.subjects).map((subj) => (
                  <span key={subj} className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium">
                    {subj}
                  </span>
                ))}
                {info.subjects.size === 0 && !info.isClassTeacher && (
                  <span className="text-[11px] text-slate-300">No subjects scheduled here yet</span>
                )}
              </div>
            </SectionCard>
          ))}

          {myClasses.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-16 col-span-full">
              No classes assigned to you yet.
            </p>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default MyClassesView;
