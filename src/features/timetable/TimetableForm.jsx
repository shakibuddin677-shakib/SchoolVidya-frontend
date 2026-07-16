import { useState } from "react";
import toast from "react-hot-toast";
import FormField, { inputClass } from "../../components/ui/FormField";
import { useGetSubjectsQuery } from "../classes/subjectsApi";
import { useGetTeachersQuery } from "../teachers/teachersApi";
import { useCreatePeriodMutation } from "./timetableApi";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// sectionId + classId already known (Section select ho chuka hai TimetableView mein) - isliye yahan sirf day/subject/teacher/time poochte hain
function TimetableForm({ sectionId, classId, onClose }) {
  const [form, setForm] = useState({ dayOfWeek: "Monday", subjectId: "", teacherId: "", startTime: "", endTime: "" });
  const { data: subjectsData } = useGetSubjectsQuery({ classId }, { skip: !classId });
  const { data: teachersData } = useGetTeachersQuery({ limit: 100 });
  const [createPeriod, { isLoading }] = useCreatePeriodMutation();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPeriod({ ...form, sectionId }).unwrap();
      toast.success("Period added to timetable");
      onClose();
    } catch (err) {
      toast.error(err.data?.message || "Failed to add period");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Day">
        <select name="dayOfWeek" value={form.dayOfWeek} onChange={handleChange} className={inputClass}>
          {days.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </FormField>

      <FormField label="Subject">
        <select required name="subjectId" value={form.subjectId} onChange={handleChange} className={inputClass}>
          <option value="">Select Subject</option>
          {subjectsData?.data?.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Teacher">
        <select required name="teacherId" value={form.teacherId} onChange={handleChange} className={inputClass}>
          <option value="">Select Teacher</option>
          {teachersData?.data?.map((t) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>
      </FormField>

      <div className="grid grid-cols-2 gap-x-3">
        <FormField label="Start Time">
          <input required type="time" name="startTime" value={form.startTime} onChange={handleChange} className={inputClass} />
        </FormField>
        <FormField label="End Time">
          <input required type="time" name="endTime" value={form.endTime} onChange={handleChange} className={inputClass} />
        </FormField>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-marigold text-ink font-semibold text-sm py-3 rounded-xl hover:brightness-95 disabled:opacity-60"
      >
        {isLoading ? "Adding..." : "Add Period"}
      </button>
    </form>
  );
}

export default TimetableForm;
