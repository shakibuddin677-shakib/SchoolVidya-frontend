import { useState } from "react";
import toast from "react-hot-toast";
import FormField, { inputClass } from "../../components/ui/FormField";
import { useCreateBookMutation, useUpdateBookMutation } from "./libraryApi";

const initialState = { title: "", author: "", isbn: "", category: "", totalCopies: 1 };

// book prop diya gaya ho to yeh EDIT mode mein chala jaata hai - form
// prefill ho jaata hai aur updateBook call hota hai (create ki jagah).
// isbn/totalCopies edit mode mein LOCKED hain - isbn unique identifier hai
// (badalna nahi chahiye), totalCopies "Add Copies" button se badhta hai
// taaki availableCopies hamesha sync rahe.
function BookForm({ book, onClose }) {
  const isEditMode = Boolean(book);
  const [form, setForm] = useState(
    isEditMode
      ? { title: book.title, author: book.author, isbn: book.isbn, category: book.category || "", totalCopies: book.totalCopies }
      : initialState
  );
  const [createBook, { isLoading: creating }] = useCreateBookMutation();
  const [updateBook, { isLoading: updating }] = useUpdateBookMutation();
  const isLoading = creating || updating;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateBook({ id: book._id, title: form.title, author: form.author, category: form.category }).unwrap();
        toast.success("Book updated successfully");
      } else {
        await createBook({ ...form, totalCopies: Number(form.totalCopies) }).unwrap();
        toast.success("Book added successfully");
      }
      onClose();
    } catch (err) {
      toast.error(err.data?.message || `Failed to ${isEditMode ? "update" : "add"} book`);
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
          <input
            required
            disabled={isEditMode}
            name="isbn"
            value={form.isbn}
            onChange={handleChange}
            className={`${inputClass} ${isEditMode ? "bg-slate-50 text-slate-400 cursor-not-allowed" : ""}`}
          />
        </FormField>
        <FormField label="Category">
          <input name="category" value={form.category} onChange={handleChange} className={inputClass} placeholder="Science" />
        </FormField>
      </div>
      <FormField label="Total Copies">
        <input
          required
          type="number"
          min={1}
          disabled={isEditMode}
          name="totalCopies"
          value={form.totalCopies}
          onChange={handleChange}
          className={`${inputClass} ${isEditMode ? "bg-slate-50 text-slate-400 cursor-not-allowed" : ""}`}
        />
      </FormField>
      {isEditMode && (
        <p className="text-[11px] text-slate-400 -mt-2 mb-3">
          ISBN aur Total Copies yahan se edit nahi ho sakte — copies badhane ke liye "Add Copies" use karein.
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-marigold text-ink font-semibold text-sm py-3 rounded-xl hover:brightness-95 disabled:opacity-60"
      >
        {isLoading ? (isEditMode ? "Updating..." : "Adding...") : isEditMode ? "Update Book" : "Add Book"}
      </button>
    </form>
  );
}

export default BookForm;
