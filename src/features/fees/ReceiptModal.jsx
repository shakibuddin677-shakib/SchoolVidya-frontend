import { X, Printer, AlertTriangle, Loader2 } from "lucide-react";
import { useRef } from "react";
import FeeReceipt from "./FeeReceipt";
import { useGetFeeReceiptQuery } from "./feesApi";
import { printElement } from "../../utils/exportUtils";

// receipt ko zyada width chahiye isliye alag modal banaya, shared Modal max-w-lg tak hi seemit hai
function ReceiptModal({ paymentId, onClose }) {
  const receiptRef = useRef(null);

  const { data, isLoading, isError, error } = useGetFeeReceiptQuery(paymentId, { skip: !paymentId });
  const receipt = data?.data;

  const handlePrint = () => {
    if (!receiptRef.current) return;
    printElement({ title: receipt?.receiptNo || "Fee Receipt", node: receiptRef.current });
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
                onClick={handlePrint}
                className="flex items-center gap-2 bg-marigold text-ink text-sm font-semibold px-3.5 py-2 rounded-xl hover:brightness-95"
              >
                <Printer size={15} />
                Print / Save as PDF
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
