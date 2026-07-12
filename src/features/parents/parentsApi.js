import { apiSlice } from "../../api/apiSlice";

export const parentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Matches backend: GET /api/parents?page=&limit=
    getParents: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => `/parents?page=${page}&limit=${limit}`,
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((p) => ({ type: "Parent", id: p._id })), { type: "Parent", id: "LIST" }]
          : [{ type: "Parent", id: "LIST" }],
    }),
    createParent: builder.mutation({
      query: (body) => ({ url: "/parents", method: "POST", body }),
      invalidatesTags: [{ type: "Parent", id: "LIST" }],
    }),
    updateParent: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/parents/${id}`, method: "PUT", body }),
      invalidatesTags: (r, e, { id }) => [{ type: "Parent", id }],
    }),
    deleteParent: builder.mutation({
      query: (id) => ({ url: `/parents/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Parent", id: "LIST" }],
    }),
  }),
});

export const {
  useGetParentsQuery,
  useLazyGetParentsQuery,
  useCreateParentMutation,
  useUpdateParentMutation,
  useDeleteParentMutation,
} = parentsApi;
