import { apiSlice } from "../../api/apiSlice";

export const examsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getExams: builder.query({
      query: ({ classId } = {}) => `/exams${classId ? `?classId=${classId}` : ""}`,
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((e) => ({ type: "Exam", id: e._id })), { type: "Exam", id: "LIST" }]
          : [{ type: "Exam", id: "LIST" }],
    }),
    createExam: builder.mutation({
      query: (body) => ({ url: "/exams", method: "POST", body }),
      invalidatesTags: [{ type: "Exam", id: "LIST" }],
    }),
    deleteExam: builder.mutation({
      query: (id) => ({ url: `/exams/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Exam", id: "LIST" }],
    }),
    // subject-wise completion status deta hai, Release Results modal isi se populate hota hai
    getExamResultStatus: builder.query({
      query: (examId) => `/exams/${examId}/result-status`,
      providesTags: (result, error, examId) => [{ type: "Exam", id: `${examId}-STATUS` }],
    }),
    // release hone ke baad Student ke "My Results" aur Class Ranking tags bhi invalidate karte hain, warna wo alag apiSlice mein stale reh jaate
    releaseExamResults: builder.mutation({
      query: (examId) => ({ url: `/exams/${examId}/release-results`, method: "PUT" }),
      invalidatesTags: (result, error, examId) => [
        { type: "Exam", id: examId },
        { type: "Exam", id: "LIST" },
        { type: "Exam", id: `${examId}-STATUS` },
        { type: "Exam", id: "STUDENT_RESULTS" },
        { type: "Exam", id: "RANKING" },
      ],
    }),
    // PUT /api/exams/:id/unpublish-results
    unpublishExamResults: builder.mutation({
      query: (examId) => ({ url: `/exams/${examId}/unpublish-results`, method: "PUT" }),
      invalidatesTags: (result, error, examId) => [
        { type: "Exam", id: examId },
        { type: "Exam", id: "LIST" },
        { type: "Exam", id: `${examId}-STATUS` },
        { type: "Exam", id: "STUDENT_RESULTS" },
        { type: "Exam", id: "RANKING" },
      ],
    }),
  }),
});

export const {
  useGetExamsQuery,
  useCreateExamMutation,
  useDeleteExamMutation,
  useGetExamResultStatusQuery,
  useReleaseExamResultsMutation,
  useUnpublishExamResultsMutation,
} = examsApi;
