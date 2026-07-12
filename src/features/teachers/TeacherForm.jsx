import { useState } from "react";
import toast from "react-hot-toast";
import FormField, { inputClass } from "../../components/ui/FormField";
import { useCreateTeacherMutation, useUpdateTeacherMutation } from "./teachersApi";
import { useGetSubjectsQuery } from "../classes/subjectsApi";

// Agar "teacher" prop diya hai (User + profile), form EDIT mode mein khulega
function TeacherForm({ teacher, onClose }) {
  const isEditMode = Boolean(teacher);

  const [form, setForm] = useState({
    name: teacher?.name || "",
    email: teacher?.email || "",
    employeeId: teacher?.profile?.employeeId || "",
    qualification: teacher?.profile?.qualification || "",
    address: teacher?.profile?.address || "",
    subjects: (teacher?.profile?.subjects || []).map((s) => s._id || s),
  });

  const [createTeacher, { isLoading: isCreating }] = useCreateTeacherMutation();
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();
  const isLoading = isCreating || isUpdating;

  // limit high rakha hai taaki checklist mein saare subjects (sab classes ke) dikhein
  const { data: subjectsData } = useGetSubjectsQuery({ limit: 100 });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleSubject = (subjectId) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter((id) => id !== subjectId)
        : [...prev.subjects, subjectId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateTeacher({ id: teacher._id, ...form }).unwrap();
        toast.success("Teacher updated successfully");
      } else {
        const result = await createTeacher(form).unwrap();
        toast.success(result.message || "Teacher created");
      }
      onClose();
    } catch (err) {
      toast.error(err.data?.message || `Failed to ${isEditMode ? "update" : "create"} teacher`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Full Name">
        <input required name="name" value={form.name} onChange={handleChange} className={inputClass} />
      </FormField>
      <FormField label="Email">
        <input required type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} />
      </FormField>
      <div className="grid grid-cols-2 gap-x-3">
        <FormField label="Employee ID">
          <input
            required
            name="employeeId"
            value={form.employeeId}
            onChange={handleChange}
            className={inputClass}
            disabled={isEditMode}
          />
        </FormField>
        <FormField label="Qualification">
          <input name="qualification" value={form.qualification} onChange={handleChange} className={inputClass} />
        </FormField>
      </div>
      <FormField label="Address">
        <input name="address" value={form.address} onChange={handleChange} className={inputClass} />
      </FormField>

      <FormField label="Subjects">
        <div className="flex flex-wrap gap-2 border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto">
          {subjectsData?.data?.length ? (
            subjectsData.data.map((s) => {
              const checked = form.subjects.includes(s._id);
              return (
                <label
                  key={s._id}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer border ${
                    checked ? "bg-marigold-soft border-marigold text-marigold font-medium" : "border-slate-200 text-slate-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={checked}
                    onChange={() => toggleSubject(s._id)}
                  />
                  {s.name}
                </label>
              );
            })
          ) : (
            <span className="text-xs text-slate-400">No subjects available. Create subjects first.</span>
          )}
        </div>
      </FormField>

      {!isEditMode && (
        <p className="text-xs text-slate-400 mb-4 bg-slate-50 rounded-lg p-3">
          📧 A secure temporary password will be auto-generated and emailed to the teacher.
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-marigold text-ink font-semibold text-sm py-3 rounded-xl hover:brightness-95 disabled:opacity-60"
      >
        {isLoading ? "Saving..." : isEditMode ? "Save Changes" : "Create Teacher"}
      </button>
    </form>
  );
}

export default TeacherForm;
