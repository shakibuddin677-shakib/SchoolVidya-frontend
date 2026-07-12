// Reusable labeled input - form fields ka consistent look, kam repetition
function FormField({ label, error, children }) {
  return (
    <div className="mb-4">
      <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{label}</label>
      {children}
      {error && <p className="text-xs text-coral mt-1">{error}</p>}
    </div>
  );
}

export const inputClass =
  "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal transition-colors";

export default FormField;
