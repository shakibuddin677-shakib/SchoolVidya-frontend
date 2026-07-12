import { apiSlice } from "../../api/apiSlice";

export const reportsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Matches backend: GET /api/reports/dashboard-stats
    getDashboardStats: builder.query({
      query: () => "/reports/dashboard-stats",
      providesTags: ["Report"],
    }),
    // Matches backend: GET /api/reports/attendance (class-wise, all-time %)
    // FEATURE: pass a classId to get just that class's attendance, or
    // call with no argument (undefined) for the "Overall" (all classes) view
    getAttendanceReport: builder.query({
      query: (classId) => `/reports/attendance${classId ? `?classId=${classId}` : ""}`,
      providesTags: ["Report"],
    }),
    // Matches backend: GET /api/reports/fee-collection (overall totals)
    // FEATURE: pass a classId to get just that class's fee totals, or
    // call with no argument (undefined) for the "Overall" (all classes) view
    getFeeCollectionReport: builder.query({
      query: (classId) => `/reports/fee-collection${classId ? `?classId=${classId}` : ""}`,
      providesTags: ["Report"],
    }),
    // Matches backend: GET /api/reports/exam-performance (subject-wise average)
    // FEATURE: pass a classId to get just that class's subject averages, or
    // call with no argument (undefined) for the "Overall" (all classes) view
    getExamPerformanceReport: builder.query({
      query: (classId) => `/reports/exam-performance${classId ? `?classId=${classId}` : ""}`,
      providesTags: ["Report"],
    }),
    // Matches backend: GET /api/reports/student-progress (per-student overall %, ranked)
    // FEATURE: pass an array of sectionIds to scope it to a teacher's own
    // sections, or call with no argument for the school-wide ranking
    getStudentProgress: builder.query({
      query: (sectionIds) =>
        `/reports/student-progress${sectionIds?.length ? `?sectionIds=${sectionIds.join(",")}` : ""}`,
      providesTags: ["Report"],
    }),
    // Matches backend: GET /api/reports/best-teachers (teachers ranked by
    // the average marks of the subjects they teach)
    getBestTeachers: builder.query({
      query: () => "/reports/best-teachers",
      providesTags: ["Report"],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetAttendanceReportQuery,
  useGetFeeCollectionReportQuery,
  useGetExamPerformanceReportQuery,
  useGetStudentProgressQuery,
  useGetBestTeachersQuery,
} = reportsApi;
