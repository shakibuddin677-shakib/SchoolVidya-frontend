// Generic responsive table - horizontal scroll chhoti screen pe (data
// tables ke liye card-layout se better UX hai, columns compare karna aasan)
// columns: [{ key, label, render? }] - render optional custom cell renderer
function Table({ columns, data, keyField = "_id" }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left font-semibold text-slate-500 text-[11px] uppercase tracking-wide px-4 py-3.5 whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row[keyField]} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5 whitespace-nowrap text-slate-700">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-10">No records found.</p>
        )}
      </div>
    </div>
  );
}

export default Table;
