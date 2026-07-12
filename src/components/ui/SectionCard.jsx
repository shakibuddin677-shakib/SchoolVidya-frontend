// Generic white "panel" wrapper - har dashboard widget (chart, list, table)
// isi se wrap hota hai, taaki spacing/shadow/radius consistent rahe
function SectionCard({ title, action, children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-5 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-ink text-base">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export default SectionCard;
