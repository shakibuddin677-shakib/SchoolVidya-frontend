import { useState } from "react";
import toast from "react-hot-toast";
import FormField, { inputClass } from "../../components/ui/FormField";
import { useGetClassesQuery } from "../classes/classesApi";
import { useCreateFeeStructureMutation } from "./feesApi";

const feeTypeOptions = ["Tuition Fee", "Exam Fee", "Library Fee", "Transport Fee", "Admission Fee", "Other"];

const initialState = { classId: "", feeType: "Tuition Fee", term: "", month: "", amount: "", dueDate: "" };

// Tuition Fee month-wise hai, baaki fee types term-wise, form usi hisaab se month ya term input dikhata hai
function FeeStructureForm({ onClose }) {
  const [form, setForm] = useState(initialState);
  const { data: classesData } = useGetClassesQuery();
  const [createFeeStructure, { isLoading }] = useCreateFeeStructureMutation();

  const isMonthly = form.feeType === "Tuition Fee";

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        classId: form.classId,
        feeType: form.feeType,
        amount: Number(form.amount),
        dueDate: form.dueDate,
        ...(isMonthly ? { month: form.month } : { term: form.term }),
      };
      await createFeeStructure(payload).unwrap();
      toast.success("Fee structure created successfully");
      onClose();
    } catch (err) {
      toast.error(err.data?.message || "Failed to create fee structure");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Class">
        <select required name="classId" value={form.classId} onChange={handleChange} className={inputClass}>
          <option value="">Select Class</option>
          {classesData?.data?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </FormField>

      <div className="grid grid-cols-2 gap-x-3">
        <FormField label="Fee Type">
          <select required name="feeType" value={form.feeType} onChange={handleChange} className={inputClass}>
            {feeTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>

        {isMonthly ? (
          <FormField label="Month">
            <input required type="month" name="month" value={form.month} onChange={handleChange} className={inputClass} />
          </FormField>
        ) : (
          <FormField label="Term">
            <input required name="term" value={form.term} onChange={handleChange} className={inputClass} placeholder="Term 1" />
          </FormField>
        )}
      </div>

      {isMonthly && (
        <p className="text-xs text-slate-400 mb-4 bg-slate-50 rounded-lg p-3">
          📅 Tuition Fee is monthly — once this month completes, next month's fee is created automatically. You only need to set this up once per class.
        </p>
      )}

      <div className="grid grid-cols-2 gap-x-3">
        <FormField label="Amount (₹)">
          <input required type="number" name="amount" value={form.amount} onChange={handleChange} className={inputClass} />
        </FormField>
        <FormField label="Due Date">
          <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className={inputClass} />
        </FormField>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-marigold text-ink font-semibold text-sm py-3 rounded-xl hover:brightness-95 disabled:opacity-60"
      >
        {isLoading ? "Creating..." : "Create Fee Structure"}
      </button>
    </form>
  );
}

export default FeeStructureForm;
