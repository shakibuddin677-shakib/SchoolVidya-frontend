// Har module (Students, Teachers, Parents, Timetable, Library, Notices) ke
// "Export" button isi file ke do functions use karte hain. Koi extra npm
// package (jsPDF waghera) nahi chahiye — CSV Blob se banta hai, aur
// "PDF" browser ke apne "Print -> Save as PDF" se milta hai (sabse
// reliable tareeka, kisi bhi device/browser pe kaam karta hai)

// ================== CSV EXPORT ==================
// columns: [{ key: "name", label: "Name" }, ...]
// rows: [{ name: "...", ... }, ...] - column.key se value uthaya jaata hai
export function exportToCSV(filename, columns, rows) {
  const escapeCell = (val) => `"${String(val ?? "—").replace(/"/g, '""')}"`;

  const header = columns.map((c) => escapeCell(c.label)).join(",");
  const body = rows.map((row) => columns.map((c) => escapeCell(c.value ? c.value(row) : row[c.key])).join(",")).join("\n");
  const csv = `${header}\n${body}`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ================== PRINT / SAVE AS PDF ==================
// Ek naya blank tab kholte hain, usme formatted HTML table likhte hain
// (school branding ke saath), aur turant browser ka print dialog khol
// dete hain - wahan se user "Save as PDF" ya seedha printer choose kar
// sakta hai. Isse koi extra library ya backend endpoint nahi chahiye.
export function printAsReport({ title, subtitle, columns, rows }) {
  const win = window.open("", "_blank", "width=1000,height=700");
  if (!win) {
    alert("Please allow pop-ups for this site to print/export.");
    return;
  }

  const escapeHtml = (val) =>
    String(val ?? "—").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const headHtml = columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join("");
  const bodyHtml = rows
    .map(
      (row) =>
        `<tr>${columns.map((c) => `<td>${escapeHtml(c.value ? c.value(row) : row[c.key])}</td>`).join("")}</tr>`
    )
    .join("");

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 28px; color: #10231d; margin: 0; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #10231d; padding-bottom: 12px; margin-bottom: 18px; }
          .header h1 { font-size: 19px; margin: 0; font-weight: 700; }
          .header p { font-size: 11px; color: #64748b; margin: 2px 0 0; }
          .genDate { text-align: right; font-size: 11px; color: #94a3b8; }
          h2 { font-size: 15px; margin: 0 0 4px; }
          .meta { font-size: 11px; color: #64748b; margin-bottom: 14px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #e2e8f0; padding: 7px 10px; text-align: left; }
          th { background: #10231d; color: white; font-weight: 600; }
          tr:nth-child(even) { background: #f8fafc; }
          @media print { @page { margin: 12mm; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>School<span style="color:#f2b705">Vidya</span> Academy</h1>
            <p>Vill+Post – Maskedih, Ps – Chalkusha, Dist – Hazaribagh, Jharkhand – 825109</p>
          </div>
          <div class="genDate">
            <p style="margin:0">Generated on</p>
            <p style="margin:0;font-weight:600;color:#10231d">${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
          </div>
        </div>
        <h2>${escapeHtml(title)}</h2>
        <p class="meta">${subtitle ? escapeHtml(subtitle) + " · " : ""}Total records: ${rows.length}</p>
        <table>
          <thead><tr>${headHtml}</tr></thead>
          <tbody>${bodyHtml}</tbody>
        </table>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  // Thoda wait taaki DOM poora render ho jaaye, tabhi print dialog khole
  setTimeout(() => win.print(), 300);
}
