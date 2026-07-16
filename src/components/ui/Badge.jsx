// Status/tag pills - "Active", "Pass", "Unpaid" waghera ke liye poore app mein reuse hoga
const variants = {
  success: "bg-teal-soft text-teal",
  warning: "bg-marigold-soft text-marigold",
  danger: "bg-coral-soft text-coral",
  neutral: "bg-slate-100 text-slate-500",
};

function Badge({ children, variant = "neutral" }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${variants[variant]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export default Badge;
