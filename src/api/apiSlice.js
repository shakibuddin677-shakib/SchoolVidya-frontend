import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Yeh humara "base" API slice hai - har feature (students, teachers, ...) isी mein apne endpoints "inject" karenge (injectEndpoints), taaki sabka ek hi cache aur
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
    credentials: "include", // axios ke "withCredentials: true" jaisa hi - cookie bhejo
  }),
  // tagTypes - "labels" hain jo batate hain kaunsa data kis cheez se related hai Jab koi mutation (create/update/delete) kisi tag ko "invalidate" karta hai, RTK
  tagTypes: ["Student", "Teacher", "Parent", "Class", "Section", "Subject", "Timetable", "Attendance", "Fee", "Book", "Homework", "Notice", "Exam", "Report"],
  endpoints: () => ({}), // khaali - har feature file apne endpoints yahan "add" karegi
});
