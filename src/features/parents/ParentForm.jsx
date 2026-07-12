import { useState } from "react";
import toast from "react-hot-toast";
import FormField, { inputClass } from "../../components/ui/FormField";
import { useCreateParentMutation } from "./parentsApi";

const initialState = { name: "", email: "", phone: "", occupation: "" };

function ParentForm({ onClose }) {
  const [form, setForm] = useState(initialState);
  const [createParent, { isLoading }] = useCreateParentMutation();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createParent(form).unwrap();
      toast.success("Parent added successfully");
      onClose();
    } catch (err) {
      toast.error(err.data?.message || "Failed to add parent");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Full Name">
        <input required name="name" value={form.name} onChange={handleChange} className={inputClass} />
      </FormField>
      <FormField label="Phone">
        <input required name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
      </FormField>
      <FormField label="Email">
        <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} />
      </FormField>
      <FormField label="Occupation">
        <input name="occupation" value={form.occupation} onChange={handleChange} className={inputClass} />
      </FormField>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-marigold text-ink font-semibold text-sm py-3 rounded-xl hover:brightness-95 disabled:opacity-60"
      >
        {isLoading ? "Adding..." : "Add Parent"}
      </button>
    </form>
  );
}

export default ParentForm;
