import { useState } from "react";
import toast from "react-hot-toast";
import FormField, { inputClass } from "../../components/ui/FormField";
import { useCreateNoticeMutation } from "./noticesApi";

const initialState = { title: "", description: "", targetAudience: "all", expiryDate: "" };

function NoticeForm({ onClose }) {
  const [form, setForm] = useState(initialState);
  const [createNotice, { isLoading }] = useCreateNoticeMutation();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createNotice(form).unwrap();
      toast.success("Notice published successfully");
      onClose();
    } catch (err) {
      toast.error(err.data?.message || "Failed to create notice");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Title">
        <input required name="title" value={form.title} onChange={handleChange} className={inputClass} />
      </FormField>
      <FormField label="Description">
        <textarea required name="description" value={form.description} onChange={handleChange} className={inputClass} rows={3} />
      </FormField>
      <FormField label="Target Audience">
        <select name="targetAudience" value={form.targetAudience} onChange={handleChange} className={inputClass}>
          <option value="all">Everyone</option>
          <option value="students">Students Only</option>
          <option value="teachers">Teachers Only</option>
        </select>
      </FormField>
      <FormField label="Expiry Date (optional)">
        <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} className={inputClass} />
      </FormField>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-marigold text-ink font-semibold text-sm py-3 rounded-xl hover:brightness-95 disabled:opacity-60"
      >
        {isLoading ? "Publishing..." : "Publish Notice"}
      </button>
    </form>
  );
}

export default NoticeForm;
