import { apiSlice } from "../../api/apiSlice";

export const libraryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ---- Book (catalog) ----
    getBooks: builder.query({
      query: ({ page = 1, limit = 20, search = "" } = {}) =>
        `/books?page=${page}&limit=${limit}${search ? `&search=${search}` : ""}`,
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((b) => ({ type: "Book", id: b._id })), { type: "Book", id: "LIST" }]
          : [{ type: "Book", id: "LIST" }],
    }),
    createBook: builder.mutation({
      query: (body) => ({ url: "/books", method: "POST", body }),
      invalidatesTags: [{ type: "Book", id: "LIST" }],
    }),
    // Matches backend: PATCH /api/books/:id/add-copies { count }
    // Existing book ki stock badhane ke liye (naye copies shelf pe aaye)
    addBookCopies: builder.mutation({
      query: ({ id, count }) => ({ url: `/books/${id}/add-copies`, method: "PATCH", body: { count } }),
      invalidatesTags: [{ type: "Book", id: "LIST" }],
    }),
    deleteBook: builder.mutation({
      query: (id) => ({ url: `/books/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Book", id: "LIST" }],
    }),

    // ---- BookIssue (transaction) ----
    // Matches backend: POST /api/book-issues/issue
    issueBook: builder.mutation({
      query: (body) => ({ url: "/book-issues/issue", method: "POST", body }),
      invalidatesTags: [{ type: "Book", id: "LIST" }, { type: "Book", id: "ISSUES" }],
    }),
    // Matches backend: PUT /api/book-issues/return/:id
    returnBook: builder.mutation({
      query: (id) => ({ url: `/book-issues/return/${id}`, method: "PUT" }),
      invalidatesTags: [{ type: "Book", id: "LIST" }, { type: "Book", id: "ISSUES" }],
    }),
    // Matches backend: GET /api/book-issues?status=
    getAllIssues: builder.query({
      query: ({ status } = {}) => `/book-issues${status ? `?status=${status}` : ""}`,
      providesTags: [{ type: "Book", id: "ISSUES" }],
    }),
    // Matches backend: GET /api/book-issues/student/:studentId
    getIssuesByStudent: builder.query({
      query: (studentId) => `/book-issues/student/${studentId}`,
      providesTags: [{ type: "Book", id: "STUDENT_ISSUES" }],
    }),
  }),
});

export const {
  useGetBooksQuery,
  useCreateBookMutation,
  useAddBookCopiesMutation,
  useDeleteBookMutation,
  useIssueBookMutation,
  useReturnBookMutation,
  useGetAllIssuesQuery,
  useGetIssuesByStudentQuery,
} = libraryApi;
