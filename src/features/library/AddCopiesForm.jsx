import { useState } from "react";
import toast from "react-hot-toast";
import FormField, { inputClass } from "../../components/ui/FormField";
import { useAddBookCopiesMutation } from "./libraryApi";

// "Add Copies" - existing book ki quantity badhane ke liye chhota form.
// Naya totalCopies/availableCopies overwrite NAHI karta - jitna number
// dete ho, utne hi copies STOCK MEIN ADD hote hain (currently issued
// copies untouched rehte hain)
function AddCopiesForm({ bookId, bookTitle, currentTotal, onClose }) {
  const [count, setCount] = useState(1);
  const [addBookCopies, { isLoading }] = useAddBookCopiesMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addBookCopies({ id: bookId, count: Number(count) }).unwrap();
      toast.success(`${count} cop${count == 1 ? "y" : "ies"} added to "${bookTitle}"`);
      onClose();
    } catch (err) {
      toast.error(err.data?.message || "Failed to add copies");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-sm text-slate-500 mb-4">
        Current total copies: <span className="font-semibold text-ink">{currentTotal}</span>
      </p>

      <FormField label="Number of copies to add">
        <input
          required
          type="number"
          min={1}
          step={1}
          name="count"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className={inputClass}
        />
      </FormField>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-marigold text-ink font-semibold text-sm py-3 rounded-xl hover:brightness-95 disabled:opacity-60"
      >
        {isLoading ? "Adding..." : "Add Copies"}
      </button>
    </form>
  );
}

export default AddCopiesForm;
