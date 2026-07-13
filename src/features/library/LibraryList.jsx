import { useState } from "react";
import { Plus, PlusCircle, BookMarked, Loader2, AlertTriangle, RotateCcw, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import FilterBar from "../../components/ui/FilterBar";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import ExportMenu from "../../components/ui/ExportMenu";
import BookForm from "./BookForm";
import IssueBookForm from "./IssueBookForm";
import AddCopiesForm from "./AddCopiesForm";
import { useGetBooksQuery, useGetAllIssuesQuery, useReturnBookMutation, useDeleteBookMutation } from "./libraryApi";
import { exportToCSV, printAsReport } from "../../utils/exportUtils";

const exportColumns = [
  { key: "title", label: "Title" },
  { key: "author", label: "Author" },
  { key: "category", label: "Category" },
  { key: "totalCopies", label: "Total Copies" },
  { key: "availableCopies", label: "Available Copies" },
];

function LibraryList() {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBook, setEditBook] = useState(null); // pura book object - edit modal ke liye
  const [deleteConfirmFor, setDeleteConfirmFor] = useState(null); // { bookId, title }
  const [issueModalFor, setIssueModalFor] = useState(null); // { bookId, title }
  const [addCopiesFor, setAddCopiesFor] = useState(null); // { bookId, title, totalCopies }
  const [statusFilter, setStatusFilter] = useState("issued");

  const { data: booksData, isLoading, isError, error } = useGetBooksQuery();
  const { data: issuesData } = useGetAllIssuesQuery({ status: statusFilter });
  const [returnBook] = useReturnBookMutation();
  const [deleteBook, { isLoading: deleting }] = useDeleteBookMutation();

  const filtered = (booksData?.data || []).filter((b) => b.title.toLowerCase().includes(search.toLowerCase()));

  const handleExportCSV = () => exportToCSV("library-books", exportColumns, booksData?.data || []);
  const handleExportPrint = () => printAsReport({ title: "Library Books", rows: booksData?.data || [], columns: exportColumns });

  const handleReturn = async (issueId) => {
    try {
      const result = await returnBook(issueId).unwrap();
      const fine = result.data?.fineAmount;
      toast.success(fine > 0 ? `Returned — ₹${fine} fine applied` : "Returned successfully");
    } catch (err) {
      toast.error(err.data?.message || "Failed to return book");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmFor) return;
    try {
      await deleteBook(deleteConfirmFor.bookId).unwrap();
      toast.success("Book deleted successfully");
      setDeleteConfirmFor(null);
    } catch (err) {
      toast.error(err.data?.message || "Failed to delete book");
    }
  };

  const issueColumns = [
    { key: "book", label: "Book", render: (row) => <span className="font-semibold text-ink">{row.bookId?.title}</span> },
    {
      key: "student",
      label: "Student",
      render: (row) => (
        <div>
          <p className="font-medium text-ink">{row.studentId?.userId?.name || "—"}</p>
          <p className="text-[11px] text-slate-400">
            Roll {row.studentId?.rollNo || "—"}
            {row.studentId?.classId?.name ? ` · ${row.studentId.classId.name}` : ""}
            {row.studentId?.sectionId?.name ? ` - ${row.studentId.sectionId.name}` : ""}
          </p>
        </div>
      ),
    },
    { key: "issueDate", label: "Issued", render: (row) => new Date(row.issueDate).toLocaleDateString("en-GB") },
    { key: "dueDate", label: "Due", render: (row) => new Date(row.dueDate).toLocaleDateString("en-GB") },
    {
      key: "status",
      label: "Status",
      render: (row) => <Badge variant={row.status === "returned" ? "neutral" : "warning"}>{row.status}</Badge>,
    },
    {
      key: "actions",
      label: "",
      render: (row) =>
        row.status === "issued" ? (
          <button onClick={() => handleReturn(row._id)} className="flex items-center gap-1.5 text-xs font-medium text-teal">
            <RotateCcw size={13} /> Return
          </button>
        ) : (
          <span className="text-xs text-slate-300">Fine: ₹{row.fineAmount || 0}</span>
        ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Library"
        breadcrumb="Dashboard / Management / Library"
        actions={
          <>
            <ExportMenu onCSV={handleExportCSV} onPrint={handleExportPrint} disabled={(booksData?.data || []).length === 0} />
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-marigold text-ink text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-95"
            >
              <Plus size={16} /> Add Book
            </button>
          </>
        }
      />

      <Modal title="Add New Book" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <BookForm onClose={() => setShowAddModal(false)} />
      </Modal>

      {editBook && (
        <Modal title="Edit Book" isOpen={!!editBook} onClose={() => setEditBook(null)}>
          <BookForm book={editBook} onClose={() => setEditBook(null)} />
        </Modal>
      )}

      {deleteConfirmFor && (
        <Modal title="Delete Book" isOpen={!!deleteConfirmFor} onClose={() => setDeleteConfirmFor(null)}>
          <p className="text-sm text-slate-500 mb-5">
            Are you sure you want to delete <span className="font-semibold text-ink">{deleteConfirmFor.title}</span>? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirmFor(null)}
              className="flex-1 bg-slate-100 text-ink text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 bg-coral text-white text-sm font-semibold py-2.5 rounded-xl hover:brightness-95 disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </Modal>
      )}

      {issueModalFor && (
        <Modal title="Issue Book" isOpen={!!issueModalFor} onClose={() => setIssueModalFor(null)}>
          <IssueBookForm bookId={issueModalFor.bookId} bookTitle={issueModalFor.title} onClose={() => setIssueModalFor(null)} />
        </Modal>
      )}

      {addCopiesFor && (
        <Modal title="Add Copies" isOpen={!!addCopiesFor} onClose={() => setAddCopiesFor(null)}>
          <AddCopiesForm
            bookId={addCopiesFor.bookId}
            bookTitle={addCopiesFor.title}
            currentTotal={addCopiesFor.totalCopies}
            onClose={() => setAddCopiesFor(null)}
          />
        </Modal>
      )}

      <FilterBar search={search} onSearchChange={setSearch} placeholder="Search books..." />

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading books...
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-coral gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">{error?.data?.message || "Failed to load books"}</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {filtered.map((b) => (
            <div key={b._id} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-marigold-soft flex items-center justify-center">
                  <BookMarked size={18} className="text-marigold" />
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setAddCopiesFor({ bookId: b._id, title: b.title, totalCopies: b.totalCopies })}
                    title="Add Copies"
                    className="text-slate-300 hover:text-teal"
                  >
                    <PlusCircle size={18} />
                  </button>
                  <button onClick={() => setEditBook(b)} title="Edit Book" className="text-slate-300 hover:text-marigold">
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmFor({ bookId: b._id, title: b.title })}
                    title="Delete Book"
                    className="text-slate-300 hover:text-coral"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="font-semibold text-ink text-sm mb-0.5 line-clamp-1">{b.title}</p>
              <p className="text-xs text-slate-400 mb-3">{b.author} · {b.category}</p>

              <div className="flex items-center justify-between mb-3">
                <Badge variant={b.availableCopies > 0 ? "success" : "danger"}>
                  {b.availableCopies > 0 ? `${b.availableCopies} Available` : "All Issued"}
                </Badge>
                <span className="text-[11px] text-slate-400 font-mono">{b.totalCopies} total</span>
              </div>

              <button
                disabled={b.availableCopies <= 0}
                onClick={() => setIssueModalFor({ bookId: b._id, title: b.title })}
                className="w-full bg-slate-100 text-ink text-xs font-semibold py-2 rounded-lg hover:bg-slate-200 disabled:opacity-40"
              >
                Issue
              </button>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-sm text-slate-400 py-16 col-span-full">No books found.</p>}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-ink">Issued Books</h3>
        <div className="flex gap-2">
          {["issued", "returned"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg capitalize ${statusFilter === s ? "bg-ink text-white" : "bg-slate-100 text-slate-500"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <Table columns={issueColumns} data={issuesData?.data || []} />
    </DashboardLayout>
  );
}

export default LibraryList;
