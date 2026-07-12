import { useState } from "react";
import toast from "react-hot-toast";
import FormField, { inputClass } from "../../components/ui/FormField";
import { useGetStudentsQuery } from "../students/studentsApi";
import { useIssueBookMutation } from "./libraryApi";

// bookId already known (row se aata hai) - sirf Student select karna hai
function IssueBookForm({ bookId, bookTitle, onClose }) {
  const [studentId, setStudentId] = useState("");
  const { data: studentsData } = useGetStudentsQuery({ limit: 50 });
  const [issueBook, { isLoading }] = useIssueBookMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const student = studentsData?.data?.find((s) => s._id === studentId);
    try {
      await issueBook({ bookId, studentId: student?.profile?._id }).unwrap();
      toast.success("Book issued successfully");
      onClose();
    } catch (err) {
      toast.error(err.data?.message || "Failed to issue book");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-sm text-slate-500 mb-4 bg-slate-50 rounded-lg p-3">
        Issuing <span className="font-semibold text-ink">{bookTitle}</span> — due in 14 days
      </p>

      <FormField label="Student">
        <select required value={studentId} onChange={(e) => setStudentId(e.target.value)} className={inputClass}>
          <option value="">Select Student</option>
          {studentsData?.data?.map((s) => (
            <option key={s._id} value={s._id}>{s.name} — {s.profile?.rollNo}</option>
          ))}
        </select>
      </FormField>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-marigold text-ink font-semibold text-sm py-3 rounded-xl hover:brightness-95 disabled:opacity-60"
      >
        {isLoading ? "Issuing..." : "Issue Book"}
      </button>
    </form>
  );
}

export default IssueBookForm;
