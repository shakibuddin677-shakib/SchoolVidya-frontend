import { apiSlice } from "../../api/apiSlice";

export const resultsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/results/schedule/:examScheduleId
    getResultsBySchedule: builder.query({
      query: (examScheduleId) => `/results/schedule/${examScheduleId}`,
      providesTags: [{ type: "Exam", id: "RESULTS" }],
    }),
    // GET /api/results/student/:studentId
    getResultsByStudent: builder.query({
      query: (studentId) => `/results/student/${studentId}`,
      providesTags: [{ type: "Exam", id: "STUDENT_RESULTS" }],
    }),
    // marks enter hone ke baad Release Results checklist aur Class Ranking tags bhi invalidate karte hain, warna wo stale reh jaate
    enterResults: builder.mutation({
      query: (body) => ({ url: "/results/enter", method: "POST", body }),
      invalidatesTags: [
        { type: "Exam", id: "RESULTS" },
        { type: "Exam", id: "STUDENT_RESULTS" },
        { type: "Exam", id: "RANKING" },
        { type: "Exam" },
      ],
    }),
    // GET /api/results/ranking/:examId?sectionId= (only returns data once the exam's results have been released)
    getClassRanking: builder.query({
      query: ({ examId, sectionId } = {}) => `/results/ranking/${examId}${sectionId ? `?sectionId=${sectionId}` : ""}`,
      providesTags: [{ type: "Exam", id: "RANKING" }],
    }),
  }),
});

export const {
  useGetResultsByScheduleQuery,
  useGetResultsByStudentQuery,
  useEnterResultsMutation,
  useGetClassRankingQuery,
} = resultsApi;
