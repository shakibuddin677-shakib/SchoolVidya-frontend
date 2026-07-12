// Har module list page (Students, Teachers, Classes, ...) isi header
// se shuru hoga - title, breadcrumb, aur right-side action buttons
// (jo har page pe alag hote hain, isliye "actions" as children/prop)
function PageHeader({ title, breadcrumb, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
        <p className="text-sm text-slate-400">{breadcrumb}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export default PageHeader;
