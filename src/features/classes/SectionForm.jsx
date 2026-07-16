import { useState } from "react";
import toast from "react-hot-toast";
import FormField, { inputClass } from "../../components/ui/FormField";
import { useGetClassesQuery } from "./classesApi";
import { useCreateSectionMutation, useUpdateSectionMutation } from "./sectionsApi";
import { useGetTeachersQuery } from "../teachers/teachersApi";

// Agar "section" prop diya hai to yeh form EDIT mode mein khulega (sirf class teacher change karne ke liye), warna naya section CREATE hoga
function SectionForm({ section, onClose }) {
  const isEditMode = Boolean(section);

  const [form, setForm] = useState({
    name: section?.name || "",
    classId: section?.classId?._id || section?.classId || "",
    classTeacherId: section?.classTeacherId?._id || "",
  });

  const { data: classesData } = useGetClassesQuery();
  // limit high rakha hai taaki dropdown mein saare teachers aa jaayein
  const { data: teachersData } = useGetTeachersQuery({ limit: 100 });

  const [createSection, { isLoading: isCreating }] = useCreateSectionMutation();
  const [updateSection, { isLoading: isUpdating }] = useUpdateSectionMutation();
  const isLoading = isCreating || isUpdating;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateSection({
          id: section._id,
          name: form.name,
          classTeacherId: form.classTeacherId || null,
        }).unwrap();
        toast.success("Section updated successfully");
      } else {
        await createSection({
          name: form.name,
          classId: form.classId,
          classTeacherId: form.classTeacherId || null,
        }).unwrap();
        toast.success("Section created successfully");
      }
      onClose();
    } catch (err) {
      toast.error(err.data?.message || `Failed to ${isEditMode ? "update" : "create"} section`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Class">
        <select
          required
          name="classId"
          value={form.classId}
          onChange={handleChange}
          className={inputClass}
          disabled={isEditMode}
        >
          <option value="">Select Class</option>
          {classesData?.data?.map((c) => (
            <option key={c._id} value={c._id}>{c.name} ({c.academicYear})</option>
          ))}
        </select>
      </FormField>
      <FormField label="Section Name">
        <input required name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="A" />
      </FormField>
      <FormField label="Class Teacher">
        <select name="classTeacherId" value={form.classTeacherId} onChange={handleChange} className={inputClass}>
          <option value="">Not assigned</option>
          {teachersData?.data?.map((t) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>
      </FormField>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-marigold text-ink font-semibold text-sm py-3 rounded-xl hover:brightness-95 disabled:opacity-60"
      >
        {isLoading ? "Saving..." : isEditMode ? "Save Changes" : "Create Section"}
      </button>
    </form>
  );
}

export default SectionForm;
