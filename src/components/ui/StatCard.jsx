// Signature detail: har card ke left mein ek thin colored border -
// jaise ruled notebook paper ka margin line. Chhota detail, poore
// dashboard mein consistent identity banata hai
function StatCard({ icon: Icon, label, value, active, inactive, accent = "marigold" }) {
  const accentMap = {
    marigold: "border-marigold bg-marigold-soft text-marigold",
    teal: "border-teal bg-teal-soft text-teal",
    coral: "border-coral bg-coral-soft text-coral",
    ink: "border-ink-softer bg-slate-100 text-ink",
  };

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${accentMap[accent].split(" ")[0]} flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accentMap[accent].split(" ").slice(1).join(" ")}`}>
          <Icon size={20} strokeWidth={2.2} />
        </div>
      </div>
      <div>
        <p className="font-display text-2xl font-bold text-ink leading-none">{value}</p>
        <p className="text-sm text-slate-400 mt-1">{label}</p>
      </div>
      {(active !== undefined || inactive !== undefined) && (
        <div className="flex items-center gap-4 text-xs pt-2 border-t border-slate-100">
          <span className="text-slate-500">
            Active: <span className="font-semibold text-ink">{active}</span>
          </span>
          <span className="text-slate-500">
            Inactive: <span className="font-semibold text-ink">{inactive}</span>
          </span>
        </div>
      )}
    </div>
  );
}

export default StatCard;
