import { apiSlice } from "../../api/apiSlice";

export const feesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ---- FeeStructure (template) ----
    getFeeStructures: builder.query({
      query: ({ classId } = {}) => `/fee-structures${classId ? `?classId=${classId}` : ""}`,
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((f) => ({ type: "Fee", id: f._id })), { type: "Fee", id: "LIST" }]
          : [{ type: "Fee", id: "LIST" }],
    }),
    createFeeStructure: builder.mutation({
      query: (body) => ({ url: "/fee-structures", method: "POST", body }),
      invalidatesTags: [{ type: "Fee", id: "LIST" }],
    }),
    deleteFeeStructure: builder.mutation({
      query: (id) => ({ url: `/fee-structures/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Fee", id: "LIST" }],
    }),

    // ---- FeePayment (transaction) ----
    // Matches backend: GET /api/fee-payments/student/:studentId
    getFeeStatusByStudent: builder.query({
      query: (studentId) => `/fee-payments/student/${studentId}`,
      providesTags: [{ type: "Fee", id: "STUDENT_STATUS" }],
    }),
    // Matches backend: POST /api/fee-payments/pay
    payFee: builder.mutation({
      query: (body) => ({ url: "/fee-payments/pay", method: "POST", body }),
      invalidatesTags: [{ type: "Fee", id: "STUDENT_STATUS" }, { type: "Fee", id: "RECEIPTS" }],
    }),

    // ---- FeePayment history + Receipt (naya feature) ----
    // Matches backend: GET /api/fee-payments/student/:studentId/receipts
    // Fee page par "Payment History" list yahin se aati hai
    getPaymentHistory: builder.query({
      query: (studentId) => `/fee-payments/student/${studentId}/receipts`,
      providesTags: [{ type: "Fee", id: "RECEIPTS" }],
    }),
    // Matches backend: GET /api/fee-payments/receipt/:paymentId
    // Ek specific receipt ki poori detail (student/class/section/parent + amount)
    getFeeReceipt: builder.query({
      query: (paymentId) => `/fee-payments/receipt/${paymentId}`,
    }),
  }),
});

export const {
  useGetFeeStructuresQuery,
  useCreateFeeStructureMutation,
  useDeleteFeeStructureMutation,
  useGetFeeStatusByStudentQuery,
  usePayFeeMutation,
  useGetPaymentHistoryQuery,
  useGetFeeReceiptQuery,
} = feesApi;
