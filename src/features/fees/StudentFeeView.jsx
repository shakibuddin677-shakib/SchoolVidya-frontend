import { useState } from "react";
import { useSelector } from "react-redux";
import { Loader2, AlertTriangle, Receipt } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import ReceiptModal from "./ReceiptModal";
import { useGetFeeStatusByStudentQuery, useGetPaymentHistoryQuery } from "./feesApi";

const statusVariant = { paid: "success", partial: "warning", unpaid: "danger" };

function StudentFeeView() {
  const { user } = useSelector((state) => state.auth);
  const studentId = user?.profile?._id;
  const [receiptFor, setReceiptFor] = useState(null); // paymentId jiski receipt kholni hai

  const { data, isLoading, isError, error } = useGetFeeStatusByStudentQuery(studentId, { skip: !studentId });
  // FEATURE: payment history - har record ka apna "View Receipt" hai
  const { data: historyData, isLoading: historyLoading } = useGetPaymentHistoryQuery(studentId, { skip: !studentId });

  return (
    <DashboardLayout>
      <PageHeader title="My Fees" breadcrumb="Dashboard / Fees" />

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading fee details...
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load fee details"}</p>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {data?.summary && (
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
                <p className="font-display text-2xl font-bold text-ink">₹{data.summary.totalDue.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">Total Due</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
                <p className="font-display text-2xl font-bold text-teal">₹{data.summary.totalPaid.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">Paid</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
                <p className="font-display text-2xl font-bold text-coral">₹{data.summary.totalPending.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">Pending</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {(data?.data || []).map((f) => (
              <div key={f.feeType} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">{f.feeType}</p>
                  <p className="text-xs text-slate-400">{f.term} · ₹{f.paidAmount.toLocaleString()} / ₹{f.totalAmount.toLocaleString()}</p>
                </div>
                <Badge variant={statusVariant[f.status]}>{f.status}</Badge>
              </div>
            ))}
            {(data?.data || []).length === 0 && (
              <p className="text-center text-sm text-slate-400 py-16">No fee structures found for your class.</p>
            )}
          </div>

          {/* FEATURE: Payment History - har payment ke saath uski Fee Receipt */}
          <h3 className="text-sm font-semibold text-slate-500 mt-6 mb-2">Payment History</h3>
          <div className="space-y-3">
            {historyLoading && (
              <div className="flex items-center justify-center py-10 text-slate-400">
                <Loader2 className="animate-spin mr-2" size={18} /> Loading payment history...
              </div>
            )}
            {!historyLoading &&
              (historyData?.data || []).map((p) => (
                <div key={p._id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {p.feeStructureId?.feeType || "—"}
                      <span className="text-slate-400 font-normal"> · ₹{p.amountPaid.toLocaleString()}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      {p.receiptNo || "—"} · {new Date(p.paymentDate).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <button
                    onClick={() => setReceiptFor(p._id)}
                    className="flex items-center gap-1.5 text-teal hover:text-teal/80 text-xs font-semibold"
                  >
                    <Receipt size={14} /> View Receipt
                  </button>
                </div>
              ))}
            {!historyLoading && (historyData?.data || []).length === 0 && (
              <p className="text-center text-sm text-slate-400 py-10">No payments recorded yet.</p>
            )}
          </div>
        </>
      )}

      {receiptFor && <ReceiptModal paymentId={receiptFor} onClose={() => setReceiptFor(null)} />}
    </DashboardLayout>
  );
}

export default StudentFeeView;
