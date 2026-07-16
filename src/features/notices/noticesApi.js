import { apiSlice } from "../../api/apiSlice";

export const noticesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/notices/active (role-based + non-expired)
    getActiveNotices: builder.query({
      query: () => "/notices/active",
      providesTags: [{ type: "Notice", id: "ACTIVE" }],
    }),
    // GET /api/notices (admin - all, including expired)
    getAllNotices: builder.query({
      query: () => "/notices",
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((n) => ({ type: "Notice", id: n._id })), { type: "Notice", id: "LIST" }]
          : [{ type: "Notice", id: "LIST" }],
    }),
    createNotice: builder.mutation({
      query: (body) => ({ url: "/notices", method: "POST", body }),
      invalidatesTags: [{ type: "Notice", id: "LIST" }, { type: "Notice", id: "ACTIVE" }],
    }),
    deleteNotice: builder.mutation({
      query: (id) => ({ url: `/notices/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Notice", id: "LIST" }, { type: "Notice", id: "ACTIVE" }],
    }),
  }),
});

export const {
  useGetActiveNoticesQuery,
  useGetAllNoticesQuery,
  useCreateNoticeMutation,
  useDeleteNoticeMutation,
} = noticesApi;
