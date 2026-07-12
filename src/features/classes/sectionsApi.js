import { apiSlice } from "../../api/apiSlice";

export const sectionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // classId optional - agar diya, sirf usi Class ke sections aayenge
    getSections: builder.query({
      query: ({ classId } = {}) => `/sections${classId ? `?classId=${classId}` : ""}`,
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((s) => ({ type: "Section", id: s._id })), { type: "Section", id: "LIST" }]
          : [{ type: "Section", id: "LIST" }],
    }),
    createSection: builder.mutation({
      query: (body) => ({ url: "/sections", method: "POST", body }),
      invalidatesTags: [{ type: "Section", id: "LIST" }],
    }),
    updateSection: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/sections/${id}`, method: "PUT", body }),
      invalidatesTags: (result, error, { id }) => [{ type: "Section", id }, { type: "Section", id: "LIST" }],
    }),
    deleteSection: builder.mutation({
      query: (id) => ({ url: `/sections/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Section", id: "LIST" }],
    }),
  }),
});

export const {
  useGetSectionsQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
} = sectionsApi;
