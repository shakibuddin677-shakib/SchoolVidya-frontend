import { ChevronDown } from "lucide-react";
import { useGetClassesQuery } from "../../features/classes/classesApi";

// reusable overall/class-wise filter dropdown, Reports page aur Admin Dashboard dono isi ko use karte hain
function ClassFilter({ value, onChange }) {
  const { data: classesData } = useGetClassesQuery({ limit: 100 });

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-9 py-2.5 text-sm text-slate-600 outline-none focus:border-teal"
      >
        <option value="">Overall (All Classes)</option>
        {(classesData?.data || []).map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

export default ClassFilter;
