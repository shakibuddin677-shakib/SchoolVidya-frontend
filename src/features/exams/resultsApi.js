import { apiSlice } from "../../api/apiSlice";

export const resultsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Matches backend: GET /api/results/schedule/:examScheduleId
    getResultsBySchedule: builder.query({
      query: (examScheduleId) => `/results/schedule/${examScheduleId}`,
      providesTags: [{ type: "Exam", id: "RESULTS" }],
    }),
    // Matches backend: GET /api/results/student/:studentId
    getResultsByStudent: builder.query({
      query: (studentId) => `/results/student/${studentId}`,
      providesTags: [{ type: "Exam", id: "STUDENT_RESULTS" }],
    }),
    // Matches backend: POST /api/results/enter { examScheduleId, marks: [{studentId, marksObtained}] }
    // BUG FIX: pehle sirf RESULTS/STUDENT_RESULTS invalidate hote the.
    // Marks enter karne ke baad Admin ka "Release Results" completion
    // checklist (getExamResultStatus, tag `${examId}-STATUS`) aur
    // Class Ranking (RANKING) bhi stale reh jaate the - agar wo already
    // khule hote to naye marks turant nahi dikhte. Yahan humein specific
    // examId pata nahi hota (sirf examScheduleId), isliye poore "Exam"
    // type ko broadly invalidate karte hain - yeh safely har exam-scoped
    // query (kisi bhi id ke saath) ko refresh karwa deta hai
    enterResults: builder.mutation({
      query: (body) => ({ url: "/results/enter", method: "POST", body }),
      invalidatesTags: [
        { type: "Exam", id: "RESULTS" },
        { type: "Exam", id: "STUDENT_RESULTS" },
        { type: "Exam", id: "RANKING" },
        { type: "Exam" },
      ],
    }),
    // Matches backend: GET /api/results/ranking/:examId?sectionId=
    // (only returns data once the exam's results have been released)
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
