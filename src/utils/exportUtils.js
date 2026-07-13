// Har module (Students, Teachers, Parents, Timetable, Library, Notices,
// Fee Receipt) ke "Export"/"Print" button isi file ke functions use karte
// hain. Koi extra PDF library (jsPDF waghera) nahi chahiye — CSV Blob se
// banta hai, aur "PDF" browser ke apne "Print -> Save as PDF" se milta hai.
//
// ================== DEVICE-FRIENDLY PRINT (root cause + fix) ==================
// Do purane tareeke istemal ho rahe the, dono buggy nikle:
//
// 1. window.open() + document.write() + win.print() (POPUP based)
//    Mobile browsers (Android Chrome, iOS Safari) is popup-based print()
//    ko reliably support nahi karte - error: "There was a problem
//    printing the page, please try again". iPad jaise devices "mobile"
//    detect bhi nahi hote (iPadOS apna userAgent desktop jaisa dikhata
//    hai), isliye UA-sniffing se "mobile ya nahi" decide karna bhi
//    bharosemand nahi hai.
//
// 2. html-to-image (canvas/SVG screenshot library) fallback
//    Tailwind CSS v4 ke default colors (slate-400, slate-50, waghera)
//    OKLCH color format mein hote hain. Bahut se browsers ka canvas/SVG
//    rasterizer OKLCH colors ko sahi se draw nahi kar paata - isi wajah
//    se downloaded image poori tarah SAFED (blank) aati thi, na text na
//    design (screenshot mein bilkul yehi dikha).
//
// FIX: in dono ki jagah, EK hi reliable technique - hidden SAME-PAGE
// <iframe> (koi naya window/popup NAHI khulta, isliye koi popup-block ya
// mobile-print-pipeline issue nahi) jisse turant print() call karte hain.
// Yeh asli browser rendering use karta hai (koi image conversion nahi),
// isliye OKLCH color issue bhi khatam. Aur yeh mobile/tablet/desktop
// SAB par ek hi tarah kaam karta hai - koi UA-sniffing nahi chahiye.

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
    // "afterprint" zyadatar browsers mein fire hota hai jab print dialog
    // band ho jaaye - lekin kuch mobile browsers isse support nahi
    // karte, isliye ek fallback timer bhi rakha hai taaki iframe hamesha
    // eventually saaf ho jaaye, chahe afterprint fire ho ya na ho
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

// ================== PRINT / SAVE AS PDF (self-contained HTML report) ==================
// Students/Teachers/Parents/Timetable/Library/Notices "Export" button isi
// se apni tabular report print karta hai - poora HTML+CSS iss function ke
// andar hi likha hota hai (Tailwind classes par depend nahi karta).
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

// ================== PRINT / SAVE AS PDF (live Tailwind-styled element) ==================
// Fee Receipt jaise components ke liye - jo Tailwind utility classes
// (bg-ink, text-slate-400, waghera) se style hote hain, ready-made HTML
// string ki tarah nahi. Current page ke saare <style>/<link> tags ko
// HUBAHU hidden iframe mein copy kar dete hain, taaki wahi exact design
// print ho - bina dobara CSS likhe, aur bina kisi PNG/canvas conversion
// library ke (jo OKLCH colors ke saath blank result deti thi).
export function printElement({ title, node }) {
  if (!node) return;

  const iframe = createHiddenIframe();
  const idoc = iframe.contentDocument;
  idoc.open();
  idoc.write(`<!DOCTYPE html><html><head><title>${title || "Print"}</title></head><body></body></html>`);
  idoc.close();

  // Current page ke saare stylesheets (Tailwind ka poora compiled CSS)
  // hubahu copy karo - yehi wajah hai ki original design (colors, fonts,
  // spacing) bina kisi extra kaam ke print mein bhi wahi dikhta hai
  const styleNodes = document.querySelectorAll('style, link[rel="stylesheet"]');
  styleNodes.forEach((s) => idoc.head.appendChild(s.cloneNode(true)));

  const printTweaks = idoc.createElement("style");
  printTweaks.textContent = `
    body { margin: 0; padding: 20px; background: #fff; display: flex; justify-content: center; }
    @media print { @page { margin: 10mm; } }
  `;
  idoc.head.appendChild(printTweaks);

  idoc.body.appendChild(node.cloneNode(true));

  // Agar stylesheet <link> tags hain (production build mein aisa hota
  // hai), unke load hone ka wait karo - warna print unstyled/blank aa
  // sakta hai
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
