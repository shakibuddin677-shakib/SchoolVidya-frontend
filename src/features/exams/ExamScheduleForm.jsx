import { useState } from "react";
import toast from "react-hot-toast";
import FormField, { inputClass } from "../../components/ui/FormField";
import { useGetSubjectsQuery } from "../classes/subjectsApi";
import { useCreateExamScheduleMutation } from "./examSchedulesApi";

const initialState = { subjectId: "", date: "", maxMarks: 100 };

function ExamScheduleForm({ examId, classId, onClose }) {
  const [form, setForm] = useState(initialState);

  // Sirf isi class ke subjects dikhao dropdown mein
  const { data: subjectsData } = useGetSubjectsQuery({ classId }, { skip: !classId });
  const [createExamSchedule, { isLoading }] = useCreateExamScheduleMutation();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createExamSchedule({ examId, ...form }).unwrap();
      toast.success("Paper added to schedule");
      onClose();
    } catch (err) {
      toast.error(err.data?.message || "Failed to add paper");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Subject">
        <select required name="subjectId" value={form.subjectId} onChange={handleChange} className={inputClass}>
          <option value="">Select Subject</option>
          {subjectsData?.data?.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Date">
        <input required type="date" name="date" value={form.date} onChange={handleChange} className={inputClass} />
      </FormField>

      <FormField label="Max Marks">
        <input
          required
          type="number"
          min="1"
          name="maxMarks"
          value={form.maxMarks}
          onChange={handleChange}
          className={inputClass}
        />
      </FormField>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-marigold text-ink font-semibold text-sm py-3 rounded-xl hover:brightness-95 disabled:opacity-60"
      >
        {isLoading ? "Adding..." : "Add Paper"}
      </button>
    </form>
  );
}

export default ExamScheduleForm;
