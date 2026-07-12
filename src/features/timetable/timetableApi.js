import { apiSlice } from "../../api/apiSlice";

export const timetableApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Matches backend: GET /api/timetable/section/:sectionId
    getTimetableBySection: builder.query({
      query: (sectionId) => `/timetable/section/${sectionId}`,
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((p) => ({ type: "Timetable", id: p._id })), { type: "Timetable", id: "LIST" }]
          : [{ type: "Timetable", id: "LIST" }],
    }),
    // Matches backend: GET /api/timetable/teacher/:teacherId
    getTimetableByTeacher: builder.query({
      query: (teacherId) => `/timetable/teacher/${teacherId}`,
      providesTags: [{ type: "Timetable", id: "TEACHER" }],
    }),
    // Matches backend: POST /api/timetable
    createPeriod: builder.mutation({
      query: (body) => ({ url: "/timetable", method: "POST", body }),
      invalidatesTags: [{ type: "Timetable", id: "LIST" }],
    }),
    deletePeriod: builder.mutation({
      query: (id) => ({ url: `/timetable/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Timetable", id: "LIST" }],
    }),
  }),
});

export const {
  useGetTimetableBySectionQuery,
  useGetTimetableByTeacherQuery,
  useCreatePeriodMutation,
  useDeletePeriodMutation,
} = timetableApi;
