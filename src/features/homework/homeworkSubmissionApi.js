import { apiSlice } from "../../api/apiSlice";

export const homeworkSubmissionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST /api/homework-submissions/submit (multipart - attachment required)
    submitHomework: builder.mutation({
      query: (formData) => ({ url: "/homework-submissions/submit", method: "POST", body: formData }),
      invalidatesTags: [{ type: "Homework", id: "SUBMISSIONS" }],
    }),
    // grade karne ke baad Student ki apni submissions list bhi invalidate karte hain, warna wahan purana cached data dikhta rehta
    gradeSubmission: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/homework-submissions/grade/${id}`, method: "PUT", body }),
      invalidatesTags: [
        { type: "Homework", id: "SUBMISSIONS" },
        { type: "Homework", id: "STUDENT_SUBMISSIONS" },
      ],
    }),
    // GET /api/homework-submissions/homework/:homeworkId
    getSubmissionsByHomework: builder.query({
      query: (homeworkId) => `/homework-submissions/homework/${homeworkId}`,
      providesTags: [{ type: "Homework", id: "SUBMISSIONS" }],
    }),
    // GET /api/homework-submissions/student/:studentId
    getSubmissionsByStudent: builder.query({
      query: (studentId) => `/homework-submissions/student/${studentId}`,
      providesTags: [{ type: "Homework", id: "STUDENT_SUBMISSIONS" }],
    }),
  }),
});

export const {
  useSubmitHomeworkMutation,
  useGradeSubmissionMutation,
  useGetSubmissionsByHomeworkQuery,
  useGetSubmissionsByStudentQuery,
} = homeworkSubmissionApi;
