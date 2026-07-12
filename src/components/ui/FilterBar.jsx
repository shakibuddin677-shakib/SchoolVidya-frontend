import { Search } from "lucide-react";

// Search box + koi bhi extra filters (dropdowns) - "children" se pass hote hain
function FilterBar({ search, onSearchChange, placeholder = "Search...", children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex-1 max-w-sm">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="outline-none text-sm w-full bg-transparent"
        />
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default FilterBar;
