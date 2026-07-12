import { forwardRef } from "react";
import schoolLogo from "../../assets/school-logo.png";

// School info - filhal yahan hardcoded hai kyunki backend mein abhi koi
// "School Settings" model nahi hai. Jab wo bane, isko waha se fetch karna.
const SCHOOL_INFO = {
  name: "School Vidya Academy",
  address: "Vill+Post - Maskedih, Ps- Chalkusha, Dist- Hazaribagh, Jharkhand - 825109",
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

const paymentModeLabel = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  netbanking: "Net Banking",
};

// Fee For(s) label - Tuition Fee month-wise hoti hai ("2026-07"), baaki
// fee types term-wise ("Term 1")
const feeForLabel = (feeStructure) => {
  if (!feeStructure) return "—";
  if (feeStructure.billingType === "month" && feeStructure.month) {
    return new Date(`${feeStructure.month}-01`).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
  }
  return feeStructure.term || "—";
};

// forwardRef zaroori hai - is DOM node ko hi html-to-image se PNG image
// mein convert karke download karwaya jaata hai (ReceiptModal dekho)
const FeeReceipt = forwardRef(function FeeReceipt({ receipt }, ref) {
  if (!receipt) return null;

  const student = receipt.studentId;
  const feeStructure = receipt.feeStructureId;
  const studentName = student?.userId?.name || "—";
  const fatherName = student?.parentId?.name || "—";
  const className = student?.classId?.name || "—";
  const sectionName = student?.sectionId?.name || "—";
  const academicYear = student?.classId?.academicYear || "—";

  const totalAmount = feeStructure?.amount || 0;
  const balanceDue = receipt.balanceDue ?? Math.max(totalAmount - receipt.amountPaid, 0);
  const overallTotalPending = receipt.overallTotalPending ?? 0;

  return (
    <div ref={ref} className="bg-white rounded-2xl border-2 border-ink p-6 sm:p-8 w-full max-w-2xl mx-auto text-ink">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-slate-100">
        <div className="flex items-center gap-3">
          <img src={schoolLogo} alt="School Logo" className="w-14 h-14 object-contain shrink-0" />
          <div>
            <h1 className="font-display font-extrabold text-lg sm:text-xl leading-tight">{SCHOOL_INFO.name}</h1>
            <p className="text-[11px] text-slate-500 italic tracking-wide">{SCHOOL_INFO.tagline}</p>
            <p className="text-[11px] text-slate-400 mt-1">{SCHOOL_INFO.address}</p>
          </div>
        </div>
        <span className="shrink-0 bg-ink text-white text-xs font-bold px-3 py-2 rounded-lg text-center leading-tight">
          FEE
          <br />
          RECEIPT
        </span>
      </div>

      {/* Receipt No / Date */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-3 text-xs sm:text-sm">
        <p>
          <span className="text-slate-400">Receipt No.</span>{" "}
          <span className="font-semibold text-coral">{receipt.receiptNo || "—"}</span>
        </p>
        <p>
          <span className="text-slate-400">Date</span>{" "}
          <span className="font-semibold text-coral">{formatDate(receipt.paymentDate)}</span>
        </p>
      </div>

      {/* Student Details */}
      <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-ink text-white text-xs font-semibold px-3 py-1.5">STUDENT DETAILS</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-4 text-xs sm:text-sm">
          <p><span className="text-slate-400">Student Name</span><br /><span className="font-semibold">{studentName}</span></p>
          <p><span className="text-slate-400">Admission No.</span><br /><span className="font-semibold">{student?.admissionNo || "—"}</span></p>
          <p><span className="text-slate-400">Father's Name</span><br /><span className="font-semibold">{fatherName}</span></p>
          <p><span className="text-slate-400">Academic Session</span><br /><span className="font-semibold">{academicYear}</span></p>
          <p><span className="text-slate-400">Class</span><br /><span className="font-semibold">{className}</span></p>
          <p><span className="text-slate-400">Fee For</span><br /><span className="font-semibold">{feeForLabel(feeStructure)}</span></p>
          <p><span className="text-slate-400">Section</span><br /><span className="font-semibold">{sectionName}</span></p>
        </div>
      </div>

      {/* Particulars */}
      <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-ink text-white">
              <th className="text-left font-semibold px-3 py-2 w-10">SR.</th>
              <th className="text-left font-semibold px-3 py-2">PARTICULARS</th>
              <th className="text-right font-semibold px-3 py-2">AMOUNT (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="px-3 py-2">1</td>
              <td className="px-3 py-2">{feeStructure?.feeType || "—"}</td>
              <td className="px-3 py-2 text-right">{totalAmount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Amount Summary */}
      <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 text-xs sm:text-sm">
        <div className="flex justify-between px-4 py-2 bg-slate-50">
          <span className="text-slate-500">Total Amount ({feeStructure?.feeType || "this fee"})</span>
          <span className="font-semibold">₹{totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between px-4 py-2">
          <span className="text-teal">Amount Paid (this transaction)</span>
          <span className="font-semibold text-teal">₹{receipt.amountPaid.toLocaleString()}</span>
        </div>
        <div className="flex justify-between px-4 py-3 bg-ink text-white">
          <span className="font-semibold">Balance Due ({feeStructure?.feeType || "this fee"})</span>
          <span className="font-bold text-marigold">₹{balanceDue.toLocaleString()}</span>
        </div>
      </div>

      {/* BUG FIX: is receipt ka balance ₹0 hone ka matlab yeh NAHI ki student
          ke saare fees clear ho gaye - baaki fee types (jaise Exam Fee,
          Library Fee) alag se pending ho sakte hain. Yeh line saaf batati hai
          ki school mein OVERALL kitna pending hai (sab fee types milaake) */}
      {overallTotalPending > 0 && (
        <div className="mt-2 flex justify-between px-4 py-2.5 rounded-xl bg-coral-soft text-coral text-xs sm:text-sm font-semibold">
          <span>Total Pending (all fees, this student)</span>
          <span>₹{overallTotalPending.toLocaleString()}</span>
        </div>
      )}

      {/* Payment Details */}
      <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-ink text-white text-xs font-semibold px-3 py-1.5">PAYMENT DETAILS</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-4 text-xs sm:text-sm">
          <p><span className="text-slate-400">Payment Mode</span><br /><span className="font-semibold">{paymentModeLabel[receipt.paymentMode] || receipt.paymentMode}</span></p>
          <p><span className="text-slate-400">Payment Date</span><br /><span className="font-semibold">{formatDate(receipt.paymentDate)}</span></p>
          <p className="col-span-2"><span className="text-slate-400">Transaction ID / UTR</span><br /><span className="font-semibold">{receipt.transactionId || "—"}</span></p>
        </div>
      </div>

      {/* Remarks */}
      <div className="mt-4 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm">
        <p className="text-[11px] font-semibold text-slate-400 mb-1">REMARKS</p>
        <p>Thank you for your payment.</p>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-between text-[11px] sm:text-xs text-slate-400">
        <span>Parent / Guardian Signature</span>
        <span>Authorized Signature</span>
      </div>
      <p className="text-center text-[10px] text-slate-400 mt-6">
        This is a computer generated receipt. Fees once paid will not be refundable or transferable.
      </p>
    </div>
  );
});

export default FeeReceipt;
