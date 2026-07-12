import { apiSlice } from "../../api/apiSlice";

export const homeworkSubmissionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Matches backend: POST /api/homework-submissions/submit (multipart - attachment required)
    submitHomework: builder.mutation({
      query: (formData) => ({ url: "/homework-submissions/submit", method: "POST", body: formData }),
      invalidatesTags: [{ type: "Homework", id: "SUBMISSIONS" }],
    }),
    // Matches backend: PUT /api/homework-submissions/grade/:id
    // Matches backend: PUT /api/homework-submissions/grade/:id
    // BUG FIX: pehle sirf Teacher ki apni "SUBMISSIONS" list invalidate
    // hoti thi. Student ki khud ki list ("STUDENT_SUBMISSIONS") kabhi
    // invalidate hi nahi hoti thi - isliye grade karne ke baad bhi
    // Student ko purana (ungraded) cached data hi dikhta rehta tha,
    // jab tak wo manually hard-refresh na kare
    gradeSubmission: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/homework-submissions/grade/${id}`, method: "PUT", body }),
      invalidatesTags: [
        { type: "Homework", id: "SUBMISSIONS" },
        { type: "Homework", id: "STUDENT_SUBMISSIONS" },
      ],
    }),
    // Matches backend: GET /api/homework-submissions/homework/:homeworkId
    getSubmissionsByHomework: builder.query({
      query: (homeworkId) => `/homework-submissions/homework/${homeworkId}`,
      providesTags: [{ type: "Homework", id: "SUBMISSIONS" }],
    }),
    // Matches backend: GET /api/homework-submissions/student/:studentId
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
