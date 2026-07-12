import { apiSlice } from "../../api/apiSlice";

export const examSchedulesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Matches backend: GET /api/exam-schedules/exam/:examId
    getSchedulesByExam: builder.query({
      query: (examId) => `/exam-schedules/exam/${examId}`,
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((s) => ({ type: "ExamSchedule", id: s._id })), { type: "ExamSchedule", id: "LIST" }]
          : [{ type: "ExamSchedule", id: "LIST" }],
    }),
    createExamSchedule: builder.mutation({
      query: (body) => ({ url: "/exam-schedules", method: "POST", body }),
      invalidatesTags: [{ type: "ExamSchedule", id: "LIST" }],
    }),
    deleteExamSchedule: builder.mutation({
      query: (id) => ({ url: `/exam-schedules/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "ExamSchedule", id: "LIST" }],
    }),
  }),
});

export const {
  useGetSchedulesByExamQuery,
  useCreateExamScheduleMutation,
  useDeleteExamScheduleMutation,
} = examSchedulesApi;
