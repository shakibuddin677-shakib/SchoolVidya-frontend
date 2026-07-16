// Har module (Students, Teachers, Parents, Timetable, Library, Notices, Fee Receipt) ke "Export"/"Print" button isi file ke functions use karte hain.

function createHiddenIframe() {
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);
  return iframe;
}

function printViaHiddenIframe(idoc, iframe, { waitForImages = true } = {}) {
  const finish = () => {
    const cleanup = () => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    };
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch {
      cleanup();
      alert("Printing isn't supported on this browser. Please try the CSV download instead.");
      return;
    }
    // "afterprint" zyadatar browsers mein fire ho jata hai, kuch mobile browsers support nahi karte isliye fallback timer bhi rakha hai
    iframe.contentWindow.onafterprint = cleanup;
    setTimeout(cleanup, 60000);
  };

  const images = Array.from(idoc.images || []);
  if (!waitForImages || images.length === 0) {
    setTimeout(finish, 250);
    return;
  }
  Promise.all(
    images.map((img) =>
      img.complete ? Promise.resolve() : new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; })
    )
  ).then(() => setTimeout(finish, 150));
}

// columns aur rows array of objects hote hain, column.key se value uthaya jaata hai
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

// har module ka "Export" button isi se apni tabular report print karta hai, poora HTML+CSS isi function ke andar likha hai
export function printAsReport({ title, subtitle, columns, rows }) {
  const escapeHtml = (val) =>
    String(val ?? "—").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const headHtml = columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join("");
  const bodyHtml = rows
    .map(
      (row) =>
        `<tr>${columns.map((c) => `<td>${escapeHtml(c.value ? c.value(row) : row[c.key])}</td>`).join("")}</tr>`
    )
    .join("");

  const html = `
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
  `;

  const iframe = createHiddenIframe();
  const idoc = iframe.contentDocument;
  idoc.open();
  idoc.write(html);
  idoc.close();

  printViaHiddenIframe(idoc, iframe, { waitForImages: false });
}

// Fee Receipt jaise Tailwind-styled components ke liye, jo ready-made HTML string nahi hain
export function printElement({ title, node }) {
  if (!node) return;

  const iframe = createHiddenIframe();
  const idoc = iframe.contentDocument;
  idoc.open();
  idoc.write(`<!DOCTYPE html><html><head><title>${title || "Print"}</title></head><body></body></html>`);
  idoc.close();

  // current page ke saare stylesheets copy karo, taaki print mein bhi original design (colors, fonts, spacing) wahi rahe
  const styleNodes = document.querySelectorAll('style, link[rel="stylesheet"]');
  styleNodes.forEach((s) => idoc.head.appendChild(s.cloneNode(true)));

  const printTweaks = idoc.createElement("style");
  printTweaks.textContent = `
    body { margin: 0; padding: 20px; background: #fff; display: flex; justify-content: center; }
    @media print { @page { margin: 10mm; } }
  `;
  idoc.head.appendChild(printTweaks);

  idoc.body.appendChild(node.cloneNode(true));

  // Agar stylesheet <link> tags hain (production build mein aisa hota hai), unke load hone ka wait karo - warna print unstyled/blank aa sakta hai
  const linkTags = Array.from(idoc.querySelectorAll('link[rel="stylesheet"]'));
  const waitForStyles = linkTags.length
    ? Promise.all(
        linkTags.map(
          (link) => new Promise((resolve) => { link.onload = resolve; link.onerror = resolve; })
        )
      )
    : Promise.resolve();

  waitForStyles.then(() => printViaHiddenIframe(idoc, iframe, { waitForImages: true }));
}
