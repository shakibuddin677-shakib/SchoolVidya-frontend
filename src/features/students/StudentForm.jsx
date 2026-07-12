import { useState } from "react";
import toast from "react-hot-toast";
import FormField, { inputClass } from "../../components/ui/FormField";
import { useGetClassesQuery } from "../classes/classesApi";
import { useGetSectionsQuery } from "../classes/sectionsApi";
import { useCreateStudentMutation, useUpdateStudentMutation } from "./studentsApi";

const initialState = {
  name: "", email: "", rollNo: "", admissionNo: "", dob: "", gender: "male",
  classId: "", sectionId: "", bloodGroup: "", address: "",
  parentName: "", parentPhone: "", parentEmail: "", parentOccupation: "",
};

// "student" row aata hai StudentsList ke list data se (jisme already
// s.profile.classId/sectionId POPULATED hain) - agar yeh prop diya gaya hai
// to form EDIT mode mein khulta hai, warna CREATE mode (jaisa pehle tha)
function buildInitialState(student) {
  if (!student) return initialState;
  return {
    name: student.name || "",
    email: student.email || "",
    rollNo: student.profile?.rollNo || "",
    admissionNo: student.profile?.admissionNo || "",
    // <input type="date"> ko "YYYY-MM-DD" chahiye, backend ISO string deta hai
    dob: student.profile?.dob ? new Date(student.profile.dob).toISOString().slice(0, 10) : "",
    gender: student.profile?.gender || "male",
    classId: student.profile?.classId?._id || student.profile?.classId || "",
    sectionId: student.profile?.sectionId?._id || student.profile?.sectionId || "",
    bloodGroup: student.profile?.bloodGroup || "",
    address: student.profile?.address || "",
    parentName: "", parentPhone: "", parentEmail: "", parentOccupation: "",
  };
}

// Matches backend POST /api/users/student (create) aur PUT /api/users/:id
// (edit) - "student" prop diya hone par yeh dono modes handle karta hai
function StudentForm({ student = null, onClose }) {
  const isEditMode = Boolean(student);
  const [form, setForm] = useState(() => buildInitialState(student));
  const { data: classesData } = useGetClassesQuery();
  const { data: sectionsData } = useGetSectionsQuery({ classId: form.classId }, { skip: !form.classId });
  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  const isLoading = isCreating || isUpdating;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        email: form.email,
        rollNo: form.rollNo,
        admissionNo: form.admissionNo,
        dob: form.dob,
        gender: form.gender,
        classId: form.classId,
        sectionId: form.sectionId,
        bloodGroup: form.bloodGroup,
        address: form.address,
      };

      if (isEditMode) {
        // Backend updateUser: profileUpdates seedha Student.findOneAndUpdate
        // mein jaate hain - parent yahan update nahi hota, isliye edit mode
        // mein parent fields bhejte hi nahi (form mein bhi nahi dikhaye)
        const result = await updateStudent({ id: student._id, ...payload }).unwrap();
        toast.success(result.message || "Student updated");
      } else {
        // Parent sirf CREATE mein bhejo, aur sirf tab jab naam+phone diya ho
        if (form.parentName && form.parentPhone) {
          payload.parent = {
            name: form.parentName,
            phone: form.parentPhone,
            email: form.parentEmail,
            occupation: form.parentOccupation,
          };
        }
        const result = await createStudent(payload).unwrap();
        toast.success(result.message || "Student created");
      }
      onClose();
    } catch (err) {
      toast.error(err.data?.message || `Failed to ${isEditMode ? "update" : "create"} student`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-x-3">
        <FormField label="Full Name">
          <input required name="name" value={form.name} onChange={handleChange} className={inputClass} />
        </FormField>
        <FormField label="Email">
          <input required type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-x-3">
        <FormField label="Roll No">
          <input required name="rollNo" value={form.rollNo} onChange={handleChange} className={inputClass} />
        </FormField>
        <FormField label="Admission No">
          <input required name="admissionNo" value={form.admissionNo} onChange={handleChange} className={inputClass} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-x-3">
        <FormField label="Date of Birth">
          <input required type="date" name="dob" value={form.dob} onChange={handleChange} className={inputClass} />
        </FormField>
        <FormField label="Gender">
          <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-x-3">
        <FormField label="Class">
          <select required name="classId" value={form.classId} onChange={handleChange} className={inputClass}>
            <option value="">Select Class</option>
            {classesData?.data?.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Section">
          <select required name="sectionId" value={form.sectionId} onChange={handleChange} className={inputClass} disabled={!form.classId}>
            <option value="">Select Section</option>
            {sectionsData?.data?.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-x-3">
        <FormField label="Blood Group">
          <input name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className={inputClass} placeholder="O+" />
        </FormField>
        <FormField label="Address">
          <input name="address" value={form.address} onChange={handleChange} className={inputClass} />
        </FormField>
      </div>

      {!isEditMode && (
        <div className="border-t border-slate-100 pt-4 mt-2">
          <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Parent Details (optional)</p>
          <div className="grid grid-cols-2 gap-x-3">
            <FormField label="Parent Name">
              <input name="parentName" value={form.parentName} onChange={handleChange} className={inputClass} />
            </FormField>
            <FormField label="Parent Phone">
              <input name="parentPhone" value={form.parentPhone} onChange={handleChange} className={inputClass} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-x-3">
            <FormField label="Parent Email">
              <input type="email" name="parentEmail" value={form.parentEmail} onChange={handleChange} className={inputClass} />
            </FormField>
            <FormField label="Occupation">
              <input name="parentOccupation" value={form.parentOccupation} onChange={handleChange} className={inputClass} />
            </FormField>
          </div>
        </div>
      )}

      {!isEditMode && (
        <p className="text-xs text-slate-400 mb-4 bg-slate-50 rounded-lg p-3">
          📧 No password field here — a secure temporary password will be auto-generated and emailed to the student.
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-marigold text-ink font-semibold text-sm py-3 rounded-xl hover:brightness-95 disabled:opacity-60"
      >
        {isLoading ? (isEditMode ? "Saving..." : "Creating...") : isEditMode ? "Save Changes" : "Create Student"}
      </button>
    </form>
  );
}

export default StudentForm;
