import { useState } from "react";
import toast from "react-hot-toast";
import FormField, { inputClass } from "../../components/ui/FormField";
import { useCreateClassMutation, useUpdateClassMutation } from "./classesApi";

const initialState = { name: "", academicYear: "" };

// "classItem" prop diya hone par EDIT mode (jaisa SectionForm/TeacherForm
// mein already pattern hai), warna CREATE mode - matches backend
// POST /api/classes (create) aur PUT /api/classes/:id (edit)
function ClassForm({ classItem = null, onClose }) {
  const isEditMode = Boolean(classItem);
  const [form, setForm] = useState(
    classItem ? { name: classItem.name || "", academicYear: classItem.academicYear || "" } : initialState
  );
  const [createClass, { isLoading: isCreating }] = useCreateClassMutation();
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();
  const isLoading = isCreating || isUpdating;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateClass({ id: classItem._id, ...form }).unwrap();
        toast.success("Class updated successfully");
      } else {
        await createClass(form).unwrap();
        toast.success("Class created successfully");
      }
      onClose();
    } catch (err) {
      toast.error(err.data?.message || `Failed to ${isEditMode ? "update" : "create"} class`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Class Name">
        <input required name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="Grade 5" />
      </FormField>
      <FormField label="Academic Year">
        <input required name="academicYear" value={form.academicYear} onChange={handleChange} className={inputClass} placeholder="2025-2026" />
      </FormField>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-marigold text-ink font-semibold text-sm py-3 rounded-xl hover:brightness-95 disabled:opacity-60"
      >
        {isLoading ? (isEditMode ? "Saving..." : "Creating...") : isEditMode ? "Save Changes" : "Create Class"}
      </button>
    </form>
  );
}

export default ClassForm;
