import { apiSlice } from "../../api/apiSlice";

export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Matches backend: GET /api/attendance/section?sectionId=&date=
    getAttendanceBySection: builder.query({
      query: ({ sectionId, date }) => `/attendance/section?sectionId=${sectionId}&date=${date}`,
      providesTags: [{ type: "Attendance", id: "LIST" }],
    }),
    // Matches backend: POST /api/attendance/mark
    markAttendance: builder.mutation({
      query: (body) => ({ url: "/attendance/mark", method: "POST", body }),
      invalidatesTags: [{ type: "Attendance", id: "LIST" }],
    }),
    // Matches backend: GET /api/attendance/student/:studentId?month=&year=
    getAttendanceByStudent: builder.query({
      query: ({ studentId, month, year }) =>
        `/attendance/student/${studentId}${month && year ? `?month=${month}&year=${year}` : ""}`,
      providesTags: [{ type: "Attendance", id: "STUDENT" }],
    }),
  }),
});

export const {
  useGetAttendanceBySectionQuery,
  useMarkAttendanceMutation,
  useGetAttendanceByStudentQuery,
} = attendanceApi;
