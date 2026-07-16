import { apiSlice } from "../../api/apiSlice";

export const teachersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/users?role=teacher&page=&limit=
    getTeachers: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => `/users?role=teacher&page=${page}&limit=${limit}`,
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((t) => ({ type: "Teacher", id: t._id })), { type: "Teacher", id: "LIST" }]
          : [{ type: "Teacher", id: "LIST" }],
    }),
    createTeacher: builder.mutation({
      query: (body) => ({ url: "/users/teacher", method: "POST", body }),
      invalidatesTags: [{ type: "Teacher", id: "LIST" }],
    }),
    updateTeacher: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: "PUT", body }),
      invalidatesTags: (result, error, { id }) => [{ type: "Teacher", id }],
    }),
    deleteTeacher: builder.mutation({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Teacher", id: "LIST" }],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useLazyGetTeachersQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
} = teachersApi;
