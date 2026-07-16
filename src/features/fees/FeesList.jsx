import { useState } from "react";
import { Plus, Wallet, Trash2, Loader2, AlertTriangle, ChevronDown } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import SectionCard from "../../components/ui/SectionCard";
import Modal from "../../components/ui/Modal";
import ClassFilter from "../../components/ui/ClassFilter";
import FeeStructureForm from "./FeeStructureForm";
import PayFeeForm from "./PayFeeForm";
import ReceiptModal from "./ReceiptModal";
import { useGetFeeStructuresQuery, useDeleteFeeStructureMutation, useGetFeeStatusByStudentQuery } from "./feesApi";
import { useGetStudentsQuery } from "../students/studentsApi";
import { useGetSectionsQuery } from "../classes/sectionsApi";

const statusVariant = { paid: "success", partial: "warning", unpaid: "danger" };

function FeesList() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [payModalFor, setPayModalFor] = useState(null); // { feeStructureId, feeType }
  const [receiptFor, setReceiptFor] = useState(null); // paymentId - payment record hote hi receipt yahan khulti hai
  const [selectedStudentId, setSelectedStudentId] = useState("");
  // Class/section filter - student dropdown ko sirf isi class/section ke students tak seemit karta hai, taaki bade schools mein bhi student dhoondhna aasaan rahe
  const [filterClassId, setFilterClassId] = useState("");
  const [filterSectionId, setFilterSectionId] = useState("");

  const { data: structuresData, isLoading, isError, error } = useGetFeeStructuresQuery({ classId: filterClassId || undefined });
  const [deleteFeeStructure] = useDeleteFeeStructureMutation();

  const { data: sectionsData } = useGetSectionsQuery({ classId: filterClassId }, { skip: !filterClassId });

  // Class select hote hi student list class-wise fetch hoti hai (higher limit kyunki ab yeh ek hi class tak seemit hai, poore school ka nahi)
  const { data: studentsData } = useGetStudentsQuery({
    limit: filterClassId ? 200 : 50,
    classId: filterClassId || undefined,
    sectionId: filterSectionId || undefined,
  });
  const selectedStudent = studentsData?.data?.find((s) => s._id === selectedStudentId);
  const studentProfileId = selectedStudent?.profile?._id;

  const { data: feeStatusData, isFetching: statusLoading } = useGetFeeStatusByStudentQuery(studentProfileId, {
    skip: !studentProfileId,
  });

  const handleClassChange = (id) => {
    setFilterClassId(id);
    setFilterSectionId("");
    setSelectedStudentId("");
  };

  const handleDeleteStructure = async (id, feeType) => {
    if (!window.confirm(`Delete "${feeType}" fee structure?`)) return;
    try {
      await deleteFeeStructure(id).unwrap();
    } catch (err) {
      alert(err.data?.message || "Failed to delete");
    }
  };

  const structureColumns = [
    { key: "feeType", label: "Fee Type", render: (row) => <span className="font-semibold text-ink">{row.feeType}</span> },
    { key: "className", label: "Class", render: (row) => row.classId?.name || "—" },
    {
      key: "term",
      label: "Term / Month",
      render: (row) =>
        row.billingType === "month" && row.month
          ? new Date(`${row.month}-01`).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
          : row.term || "—",
    },
    { key: "amount", label: "Amount", render: (row) => `₹${row.amount.toLocaleString()}` },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <button onClick={() => handleDeleteStructure(row._id, row.feeType)} className="text-slate-400 hover:text-coral">
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Fee Management"
        breadcrumb="Dashboard / Management / Fees"
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-marigold text-ink text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-95"
          >
            <Plus size={16} /> Add Fee Structure
          </button>
        }
      />

      <Modal title="Add Fee Structure" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <FeeStructureForm onClose={() => setShowAddModal(false)} />
      </Modal>

      {payModalFor && (
        <Modal title="Record Payment" isOpen={!!payModalFor} onClose={() => setPayModalFor(null)}>
          <PayFeeForm
            studentId={studentProfileId}
            feeStructureId={payModalFor.feeStructureId}
            feeType={payModalFor.feeType}
            onClose={() => setPayModalFor(null)}
            onPaid={(payment) => payment?._id && setReceiptFor(payment._id)}
          />
        </Modal>
      )}

      {receiptFor && <ReceiptModal paymentId={receiptFor} onClose={() => setReceiptFor(null)} />}

      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-400">Filter by Class</h3>
        <ClassFilter value={filterClassId} onChange={handleClassChange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Fee Structures">
          {isLoading && (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 className="animate-spin mr-2" size={18} /> Loading...
            </div>
          )}
          {isError && (
            <div className="flex flex-col items-center py-10 text-coral gap-2">
              <AlertTriangle size={24} />
              <p className="text-sm">{error?.data?.message || "Failed to load"}</p>
            </div>
          )}
          {!isLoading && !isError && <Table columns={structureColumns} data={structuresData?.data || []} />}
        </SectionCard>

        <SectionCard title="Check Student Fee Status">
          {filterClassId && (
            <div className="relative mb-3">
              <select
                value={filterSectionId}
                onChange={(e) => {
                  setFilterSectionId(e.target.value);
                  setSelectedStudentId("");
                }}
                className="appearance-none w-full bg-white border border-slate-200 rounded-xl pl-4 pr-9 py-2.5 text-sm text-slate-600 outline-none focus:border-teal"
              >
                <option value="">All Sections</option>
                {(sectionsData?.data || []).map((sec) => (
                  <option key={sec._id} value={sec._id}>{sec.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          )}

          <div className="relative mb-4">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="appearance-none w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-9 py-2.5 text-sm text-slate-600"
            >
              <option value="">
                {filterClassId ? "Select a student from this class..." : "Select a student..."}
              </option>
              {studentsData?.data?.map((s) => (
                <option key={s._id} value={s._id}>{s.name} — {s.profile?.rollNo}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          {filterClassId && studentsData?.data?.length === 0 && (
            <p className="text-xs text-slate-400 -mt-3 mb-4">No students found in this class/section.</p>
          )}

          {statusLoading && (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 className="animate-spin mr-2" size={18} /> Loading status...
            </div>
          )}

          {!statusLoading && studentProfileId && (
            <div className="space-y-3">
              {(feeStatusData?.data || []).map((f) => (
                <div key={f.feeStructureId} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {f.feeType}
                      {/* Tuition Fee ab month-wise hai, isliye ek se zyada rows aa sakti hain same feeType ke saath - month/term label dikhana zaroori hai taaki distinguish ho sake */}
                      {f.month && (
                        <span className="text-slate-400 font-normal">
                          {" "}
                          — {new Date(`${f.month}-01`).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                        </span>
                      )}
                      {!f.month && f.term && <span className="text-slate-400 font-normal"> — {f.term}</span>}
                    </p>
                    <p className="text-xs text-slate-400">
                      ₹{f.paidAmount.toLocaleString()} / ₹{f.totalAmount.toLocaleString()}
                      {f.pendingAmount > 0 && <span className="text-coral"> · ₹{f.pendingAmount} pending</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant[f.status]}>{f.status}</Badge>
                    {f.status !== "paid" && (
                      <button
                        onClick={() => setPayModalFor({ feeStructureId: f.feeStructureId, feeType: f.feeType })}
                        className="text-teal hover:text-teal/80"
                        title="Record Payment"
                      >
                        <Wallet size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {(feeStatusData?.data || []).length === 0 && (
                <p className="text-center text-sm text-slate-400 py-8">No fee structures for this student's class.</p>
              )}
              {feeStatusData?.summary && (
                <div className="flex justify-between text-xs pt-3 border-t border-slate-100 text-slate-500">
                  <span>Total Due: ₹{feeStatusData.summary.totalDue.toLocaleString()}</span>
                  <span>Paid: ₹{feeStatusData.summary.totalPaid.toLocaleString()}</span>
                  <span className="text-coral">Pending: ₹{feeStatusData.summary.totalPending.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {!studentProfileId && (
            <p className="text-center text-sm text-slate-400 py-8">Select a student to view fee status.</p>
          )}
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}

export default FeesList;
