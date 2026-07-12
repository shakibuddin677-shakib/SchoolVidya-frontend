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
    // Matches backend: GET /api/exams/:id/result-status
    // Subject-wise completion (kis subject ke kitne students ke marks
    // abhi bhi baaki hain) - "Release Results" modal isi se populate hota hai
    getExamResultStatus: builder.query({
      query: (examId) => `/exams/${examId}/result-status`,
      providesTags: (result, error, examId) => [{ type: "Exam", id: `${examId}-STATUS` }],
    }),
    // Matches backend: PUT /api/exams/:id/release-results
    // Matches backend: PUT /api/exams/:id/release-results
    // BUG FIX: pehle sirf iske apne "Exam" tags invalidate hote the -
    // Student ki "My Results" (STUDENT_RESULTS) aur Class Ranking
    // (RANKING) dono alag apiSlice (resultsApi) mein cached hote hain,
    // aur wo yahan invalidate hi nahi ho rahe the. Isliye Release karne
    // ke turant baad bhi already-open "My Results"/"Ranking" page
    // purana (stale) data hi dikhata rehta tha
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
    // Matches backend: PUT /api/exams/:id/unpublish-results
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
