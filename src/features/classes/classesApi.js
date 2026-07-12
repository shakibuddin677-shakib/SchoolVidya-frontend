import { apiSlice } from "../../api/apiSlice";

export const classesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getClasses: builder.query({
      query: ({ page = 1, limit = 50 } = {}) => `/classes?page=${page}&limit=${limit}`,
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((c) => ({ type: "Class", id: c._id })), { type: "Class", id: "LIST" }]
          : [{ type: "Class", id: "LIST" }],
    }),
    createClass: builder.mutation({
      query: (body) => ({ url: "/classes", method: "POST", body }),
      invalidatesTags: [{ type: "Class", id: "LIST" }],
    }),
    updateClass: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/classes/${id}`, method: "PUT", body }),
      invalidatesTags: (r, e, { id }) => [{ type: "Class", id }],
    }),
    deleteClass: builder.mutation({
      query: (id) => ({ url: `/classes/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Class", id: "LIST" }],
    }),
  }),
});

export const { useGetClassesQuery, useCreateClassMutation, useUpdateClassMutation, useDeleteClassMutation } = classesApi;
