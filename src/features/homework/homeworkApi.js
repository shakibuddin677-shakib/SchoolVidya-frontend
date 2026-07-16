import { apiSlice } from "../../api/apiSlice";

export const homeworkApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/homework/section/:sectionId
    getHomeworkBySection: builder.query({
      query: (sectionId) => `/homework/section/${sectionId}`,
      providesTags: [{ type: "Homework", id: "LIST" }],
    }),
    // body FormData hoga, JSON nahi - fetchBaseQuery khud sahi Content-Type ke saath bhej deta hai
    createHomework: builder.mutation({
      query: (formData) => ({ url: "/homework", method: "POST", body: formData }),
      invalidatesTags: [{ type: "Homework", id: "LIST" }],
    }),
    deleteHomework: builder.mutation({
      query: (id) => ({ url: `/homework/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Homework", id: "LIST" }],
    }),
  }),
});

export const {
  useGetHomeworkBySectionQuery,
  useCreateHomeworkMutation,
  useDeleteHomeworkMutation,
} = homeworkApi;
