import { useState } from "react";
import toast from "react-hot-toast";
import FormField, { inputClass } from "../../components/ui/FormField";
import { usePayFeeMutation } from "./feesApi";

// studentId/feeStructureId row se already known hain, yahan sirf amount/mode/transaction poochte hain
function PayFeeForm({ studentId, feeStructureId, feeType, onClose, onPaid }) {
  const [form, setForm] = useState({ amountPaid: "", paymentMode: "cash", transactionId: "" });
  const [payFee, { isLoading }] = usePayFeeMutation();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await payFee({
        studentId,
        feeStructureId,
        amountPaid: Number(form.amountPaid),
        paymentMode: form.paymentMode,
        transactionId: form.transactionId,
      }).unwrap();
      toast.success("Payment recorded successfully");
      onClose();
      onPaid?.(result?.data);
    } catch (err) {
      toast.error(err.data?.message || "Failed to record payment");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-sm text-slate-500 mb-4 bg-slate-50 rounded-lg p-3">
        Recording payment for <span className="font-semibold text-ink">{feeType}</span>
      </p>

      <FormField label="Amount Paid (₹)">
        <input required type="number" name="amountPaid" value={form.amountPaid} onChange={handleChange} className={inputClass} />
      </FormField>

      <FormField label="Payment Mode">
        <select name="paymentMode" value={form.paymentMode} onChange={handleChange} className={inputClass}>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="upi">UPI</option>
          <option value="netbanking">Net Banking</option>
        </select>
      </FormField>

      <FormField label="Transaction ID (optional)">
        <input name="transactionId" value={form.transactionId} onChange={handleChange} className={inputClass} placeholder="Reference number" />
      </FormField>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-marigold text-ink font-semibold text-sm py-3 rounded-xl hover:brightness-95 disabled:opacity-60"
      >
        {isLoading ? "Recording..." : "Record Payment"}
      </button>
    </form>
  );
}

export default PayFeeForm;
