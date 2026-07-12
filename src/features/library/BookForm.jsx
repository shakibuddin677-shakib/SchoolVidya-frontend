import { useState } from "react";
import toast from "react-hot-toast";
import FormField, { inputClass } from "../../components/ui/FormField";
import { useCreateBookMutation } from "./libraryApi";

const initialState = { title: "", author: "", isbn: "", category: "", totalCopies: 1 };

function BookForm({ onClose }) {
  const [form, setForm] = useState(initialState);
  const [createBook, { isLoading }] = useCreateBookMutation();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBook({ ...form, totalCopies: Number(form.totalCopies) }).unwrap();
      toast.success("Book added successfully");
      onClose();
    } catch (err) {
      toast.error(err.data?.message || "Failed to add book");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Title">
        <input required name="title" value={form.title} onChange={handleChange} className={inputClass} />
      </FormField>
      <FormField label="Author">
        <input required name="author" value={form.author} onChange={handleChange} className={inputClass} />
      </FormField>
      <div className="grid grid-cols-2 gap-x-3">
        <FormField label="ISBN">
          <input required name="isbn" value={form.isbn} onChange={handleChange} className={inputClass} />
        </FormField>
        <FormField label="Category">
          <input name="category" value={form.category} onChange={handleChange} className={inputClass} placeholder="Science" />
        </FormField>
      </div>
      <FormField label="Total Copies">
        <input required type="number" min={1} name="totalCopies" value={form.totalCopies} onChange={handleChange} className={inputClass} />
      </FormField>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-marigold text-ink font-semibold text-sm py-3 rounded-xl hover:brightness-95 disabled:opacity-60"
      >
        {isLoading ? "Adding..." : "Add Book"}
      </button>
    </form>
  );
}

export default BookForm;
