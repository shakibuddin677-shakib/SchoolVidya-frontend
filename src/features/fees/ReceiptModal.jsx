import { useRef, useState } from "react";
import { X, Download, Loader2, AlertTriangle } from "lucide-react";
import { toPng } from "html-to-image";
import toast from "react-hot-toast";
import FeeReceipt from "./FeeReceipt";
import { useGetFeeReceiptQuery } from "./feesApi";

// Alag se apna modal banaya hai (shared <Modal> ki jagah) kyunki receipt ko
// zyada width chahiye - shared Modal max-w-lg tak hi seemit hai, aur usko
// change karne se poore app ke baaki modals (forms) affect ho jaate.
function ReceiptModal({ paymentId, onClose }) {
  const receiptRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const { data, isLoading, isError, error } = useGetFeeReceiptQuery(paymentId, { skip: !paymentId });
  const receipt = data?.data;

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);
    try {
      // BUG FIX #1: mobile par receipt ka DOM element phone ki screen jitni
      // CHHOTI width mein hi render hota tha (kyunki uska parent container
      // mobile viewport se bada nahi ho sakta) - isliye downloaded image bhi
      // usi narrow/squished size mein ban jaati thi ("upload photo jaisi"
      // dikhti thi, jaisa screenshot mein dikha).
      //
      // Fix: capture ke time ek OFFSCREEN CLONE banate hain jo screen se
      // bahar (left: -99999px) ek FIXED, comfortable width (700px) par
      // render hota hai - user ko kuch dikhta nahi, lekin download hamesha
      // achhi quality/full-size receipt jaisi hi aati hai, chahe phone ki
      // screen kitni bhi chhoti ho.
      const original = receiptRef.current;
      const clone = original.cloneNode(true);
      clone.style.width = "700px";
      clone.style.maxWidth = "700px";
      clone.style.position = "fixed";
      clone.style.top = "0";
      clone.style.left = "-99999px";
      clone.style.margin = "0";
      document.body.appendChild(clone);

      let dataUrl;
      try {
        dataUrl = await toPng(clone, { pixelRatio: 2, backgroundColor: "#ffffff" });
      } finally {
        document.body.removeChild(clone);
      }

      const filename = `${receipt?.receiptNo?.replace(/\//g, "-") || "fee-receipt"}.png`;

      // BUG FIX: pehle Web Share API ko SABSE PEHLE try kiya jaata tha -
      // isi wajah se har baar ek "Share" sheet popup ho jaata tha, chahe
      // user sirf seedha download hi karna chahta ho. Ab hum device ke
      // "default" behaviour follow karte hain: pehle DIRECT auto-download
      // try hota hai (jo zyadatar mobile/desktop browsers par bina kisi
      // popup ke seedha Downloads folder mein file save kar deta hai).
      // Share sheet ab sirf LAST RESORT hai - sirf tab aati hai jab direct
      // download genuinely kaam na kare.
      try {
        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], filename, { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: filename });
        } else {
          const win = window.open();
          if (win) {
            win.document.write(`<img src="${dataUrl}" alt="${filename}" style="max-width:100%" />`);
          } else {
            throw new Error("Download and popup both blocked");
          }
        }
      }
    } catch (err) {
      // Web Share ka "AbortError" tab aata hai jab user khud share sheet
      // cancel kar de - usse error toast nahi dikhani (wo koi bug nahi hai)
      if (err?.name !== "AbortError") {
        toast.error("Failed to download receipt image");
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-slate-50 rounded-2xl shadow-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-slate-100 z-10">
          <h3 className="font-display font-semibold text-ink text-lg">Fee Receipt</h3>
          <div className="flex items-center gap-3">
            {receipt && (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 bg-marigold text-ink text-sm font-semibold px-3.5 py-2 rounded-xl hover:brightness-95 disabled:opacity-60"
              >
                {downloading ? <Loader2 className="animate-spin" size={15} /> : <Download size={15} />}
                Download Image
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-ink">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <Loader2 className="animate-spin mr-2" size={20} /> Loading receipt...
            </div>
          )}
          {isError && (
            <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
              <AlertTriangle size={28} />
              <p className="text-sm">{error?.data?.message || "Failed to load receipt"}</p>
            </div>
          )}
          {!isLoading && !isError && receipt && <FeeReceipt ref={receiptRef} receipt={receipt} />}
        </div>
      </div>
    </div>
  );
}

export default ReceiptModal;
