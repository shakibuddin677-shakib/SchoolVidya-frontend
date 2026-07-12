import { useState } from "react";
import toast from "react-hot-toast";
import FormField, { inputClass } from "../../components/ui/FormField";
import { useGetClassesQuery } from "./classesApi";
import { useCreateSubjectMutation } from "./subjectsApi";

const initialState = { name: "", code: "", classId: "" };

function SubjectForm({ onClose }) {
  const [form, setForm] = useState(initialState);
  const { data: classesData } = useGetClassesQuery();
  const [createSubject, { isLoading }] = useCreateSubjectMutation();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSubject(form).unwrap();
      toast.success("Subject created successfully");
      onClose();
    } catch (err) {
      toast.error(err.data?.message || "Failed to create subject");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Subject Name">
        <input required name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="Mathematics" />
      </FormField>
      <FormField label="Subject Code">
        <input required name="code" value={form.code} onChange={handleChange} className={inputClass} placeholder="MATH101" />
      </FormField>
      <FormField label="Class">
        <select required name="classId" value={form.classId} onChange={handleChange} className={inputClass}>
          <option value="">Select Class</option>
          {classesData?.data?.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </FormField>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-marigold text-ink font-semibold text-sm py-3 rounded-xl hover:brightness-95 disabled:opacity-60"
      >
        {isLoading ? "Creating..." : "Create Subject"}
      </button>
    </form>
  );
}

export default SubjectForm;
