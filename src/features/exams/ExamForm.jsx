import { useState } from "react";
import toast from "react-hot-toast";
import FormField, { inputClass } from "../../components/ui/FormField";
import { useGetClassesQuery } from "../classes/classesApi";
import { useCreateExamMutation } from "./examsApi";

const initialState = { name: "", classId: "", term: "", startDate: "", endDate: "" };

function ExamForm({ onClose }) {
  const [form, setForm] = useState(initialState);
  const { data: classesData } = useGetClassesQuery();
  const [createExam, { isLoading }] = useCreateExamMutation();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createExam(form).unwrap();
      toast.success("Exam created successfully");
      onClose();
    } catch (err) {
      toast.error(err.data?.message || "Failed to create exam");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Exam Name">
        <input required name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="1st Quarterly" />
      </FormField>
      <FormField label="Class">
        <select required name="classId" value={form.classId} onChange={handleChange} className={inputClass}>
          <option value="">Select Class</option>
          {classesData?.data?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </FormField>
      <FormField label="Term">
        <input required name="term" value={form.term} onChange={handleChange} className={inputClass} placeholder="Term 1" />
      </FormField>
      <div className="grid grid-cols-2 gap-x-3">
        <FormField label="Start Date">
          <input required type="date" name="startDate" value={form.startDate} onChange={handleChange} className={inputClass} />
        </FormField>
        <FormField label="End Date">
          <input required type="date" name="endDate" value={form.endDate} onChange={handleChange} className={inputClass} />
        </FormField>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-marigold text-ink font-semibold text-sm py-3 rounded-xl hover:brightness-95 disabled:opacity-60"
      >
        {isLoading ? "Creating..." : "Create Exam"}
      </button>
    </form>
  );
}

export default ExamForm;
