import { apiSlice } from "../../api/apiSlice";

export const subjectsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSubjects: builder.query({
      query: ({ classId, page = 1, limit = 20 } = {}) =>
        `/subjects?page=${page}&limit=${limit}${classId ? `&classId=${classId}` : ""}`,
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((s) => ({ type: "Subject", id: s._id })), { type: "Subject", id: "LIST" }]
          : [{ type: "Subject", id: "LIST" }],
    }),
    createSubject: builder.mutation({
      query: (body) => ({ url: "/subjects", method: "POST", body }),
      invalidatesTags: [{ type: "Subject", id: "LIST" }],
    }),
    deleteSubject: builder.mutation({
      query: (id) => ({ url: `/subjects/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Subject", id: "LIST" }],
    }),
  }),
});

export const { useGetSubjectsQuery, useCreateSubjectMutation, useDeleteSubjectMutation } = subjectsApi;
