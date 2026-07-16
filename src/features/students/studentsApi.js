import { apiSlice } from "../../api/apiSlice";

// injectEndpoints - apiSlice ke "khaali" endpoints mein Student-specific queries/mutations add karta hai, bina apiSlice.js file ko chhue
export const studentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/users?role=student&page=&limit=&classId=&sectionId=
    getStudents: builder.query({
      query: ({ page = 1, limit = 10, classId, sectionId } = {}) =>
        `/users?role=student&page=${page}&limit=${limit}` +
        (classId ? `&classId=${classId}` : "") +
        (sectionId ? `&sectionId=${sectionId}` : ""),
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((s) => ({ type: "Student", id: s._id })), { type: "Student", id: "LIST" }]
          : [{ type: "Student", id: "LIST" }],
    }),

    // GET /api/users/:id
    getStudentById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: "Student", id }],
    }),

    // POST /api/users/student
    createStudent: builder.mutation({
      query: (body) => ({ url: "/users/student", method: "POST", body }),
      // invalidatesTags - is mutation ke baad "Student LIST" wali query AUTOMATICALLY refetch ho jayegi, list khud-ba-khud update hogi
      invalidatesTags: [{ type: "Student", id: "LIST" }],
    }),

    // PUT /api/users/:id
    updateStudent: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: "PUT", body }),
      invalidatesTags: (result, error, { id }) => [{ type: "Student", id }],
    }),

    // DELETE /api/users/:id
    deleteStudent: builder.mutation({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Student", id: "LIST" }],
    }),
  }),
});

// RTK Query auto-generates these hooks - naam pattern hamesha "use" + EndpointName + "Query"/"Mutation" hota hai
export const {
  useGetStudentsQuery,
  useLazyGetStudentsQuery,
  useGetStudentByIdQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} = studentsApi;
