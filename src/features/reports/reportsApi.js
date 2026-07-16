import { apiSlice } from "../../api/apiSlice";

export const reportsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/reports/dashboard-stats
    getDashboardStats: builder.query({
      query: () => "/reports/dashboard-stats",
      providesTags: ["Report"],
    }),
    // classId de to sirf usi class ka attendance milta hai, na de to overall (saari classes) ka
    getAttendanceReport: builder.query({
      query: (classId) => `/reports/attendance${classId ? `?classId=${classId}` : ""}`,
      providesTags: ["Report"],
    }),
    // classId de to sirf usi class ka fee total milta hai, na de to overall total
    getFeeCollectionReport: builder.query({
      query: (classId) => `/reports/fee-collection${classId ? `?classId=${classId}` : ""}`,
      providesTags: ["Report"],
    }),
    // classId de to sirf usi class ke subject averages milte hain, na de to overall view
    getExamPerformanceReport: builder.query({
      query: (classId) => `/reports/exam-performance${classId ? `?classId=${classId}` : ""}`,
      providesTags: ["Report"],
    }),
    // sectionIds array do to teacher ke apne sections tak scope ho jata hai, na do to school-wide ranking
    getStudentProgress: builder.query({
      query: (sectionIds) =>
        `/reports/student-progress${sectionIds?.length ? `?sectionIds=${sectionIds.join(",")}` : ""}`,
      providesTags: ["Report"],
    }),
    // GET /api/reports/best-teachers (teachers ranked by the average marks of the subjects they teach)
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
