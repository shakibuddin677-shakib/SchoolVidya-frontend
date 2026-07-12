import { useState } from "react";
import { Paperclip } from "lucide-react";
import toast from "react-hot-toast";
import FormField, { inputClass } from "../../components/ui/FormField";
import { useGetClassesQuery } from "../classes/classesApi";
import { useGetSectionsQuery } from "../classes/sectionsApi";
import { useGetSubjectsQuery } from "../classes/subjectsApi";
import { useCreateHomeworkMutation } from "./homeworkApi";

function HomeworkForm({ onClose }) {
  const [classId, setClassId] = useState("");
  const [form, setForm] = useState({
    sectionId: "",
    subjectId: "",
    title: "",
    description: "",
    dueDate: "",
    totalMarks: 20,
  });
  const [file, setFile] = useState(null);

  const { data: classesData } = useGetClassesQuery();
  const { data: sectionsData } = useGetSectionsQuery({ classId }, { skip: !classId });
  const { data: subjectsData } = useGetSubjectsQuery({ classId }, { skip: !classId });
  const [createHomework, { isLoading }] = useCreateHomeworkMutation();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // File upload ke liye JSON nahi, FormData chahiye - multer isi ko
      // parse karega backend pe
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (file) formData.append("attachment", file);

      await createHomework(formData).unwrap();
      toast.success("Homework assigned successfully");
      onClose();
    } catch (err) {
      toast.error(err.data?.message || "Failed to assign homework");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-x-3">
        <FormField label="Class">
          <select required value={classId} onChange={(e) => setClassId(e.target.value)} className={inputClass}>
            <option value="">Select Class</option>
            {classesData?.data?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </FormField>
        <FormField label="Section">
          <select required name="sectionId" value={form.sectionId} onChange={handleChange} className={inputClass} disabled={!classId}>
            <option value="">Select Section</option>
            {sectionsData?.data?.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </FormField>
      </div>

      <FormField label="Subject">
        <select required name="subjectId" value={form.subjectId} onChange={handleChange} className={inputClass} disabled={!classId}>
          <option value="">Select Subject</option>
          {subjectsData?.data?.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </FormField>

      <FormField label="Title">
        <input required name="title" value={form.title} onChange={handleChange} className={inputClass} />
      </FormField>
      <FormField label="Description">
        <textarea name="description" value={form.description} onChange={handleChange} className={inputClass} rows={3} />
      </FormField>
      <div className="grid grid-cols-2 gap-x-3">
        <FormField label="Due Date">
          <input required type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className={inputClass} />
        </FormField>
        <FormField label="Total Marks (max 20)">
          <input
            required
            type="number"
            min="1"
            max="20"
            name="totalMarks"
            value={form.totalMarks}
            onChange={handleChange}
            className={inputClass}
          />
        </FormField>
      </div>

      <FormField label="Attachment (optional)">
        <label className="flex items-center gap-2 border border-dashed border-slate-300 rounded-xl px-3 py-3 text-sm text-slate-500 cursor-pointer hover:border-teal">
          <Paperclip size={16} />
          {file ? file.name : "Click to attach a worksheet/file"}
          <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
        </label>
      </FormField>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-marigold text-ink font-semibold text-sm py-3 rounded-xl hover:brightness-95 disabled:opacity-60"
      >
        {isLoading ? "Assigning..." : "Assign Homework"}
      </button>
    </form>
  );
}

export default HomeworkForm;
