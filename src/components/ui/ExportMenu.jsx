import { useState, useRef, useEffect } from "react";
import { Download, FileText, Printer, Loader2 } from "lucide-react";

// har list page mein reuse hone wala export button, CSV download aur print/PDF dono options deta hai
function ExportMenu({ onCSV, onPrint, disabled = false, loading = false, label = "Export" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Bahar click karne par menu band ho jaaye
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        className="flex items-center gap-2 bg-white border border-slate-200 text-ink text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} {label}
      </button>

      {open && (
        <div className="absolute right-0 top-12 bg-white shadow-lg rounded-xl border border-slate-100 py-1.5 w-52 z-30">
          <button
            onClick={() => { onCSV(); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            <FileText size={15} className="text-teal" /> Download CSV
          </button>
          <button
            onClick={() => { onPrint(); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            <Printer size={15} className="text-coral" /> Print / Save as PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default ExportMenu;
