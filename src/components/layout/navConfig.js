import {
  LayoutDashboard, GraduationCap, UserRound, Users, BookOpen, Layers,
  CalendarClock, CalendarCheck, ClipboardList, Wallet, Library,
  Bell, BarChart3, NotebookPen,
} from "lucide-react";

// Role ke hisaab se sidebar links alag hote hain - Admin sabkuch dekh sakta hai, Teacher/Student ko sirf unse relevant cheezein dikhti hain
export const navConfig = {
  admin: [
    {
      section: "Main",
      items: [{ label: "Dashboard", icon: LayoutDashboard, path: "/admin" }],
    },
    {
      section: "Peoples",
      items: [
        { label: "Students", icon: GraduationCap, path: "/admin/students" },
        { label: "Teachers", icon: UserRound, path: "/admin/teachers" },
        { label: "Parents", icon: Users, path: "/admin/parents" },
      ],
    },
    {
      section: "Academic",
      items: [
        { label: "Classes", icon: BookOpen, path: "/admin/classes" },
        { label: "Sections", icon: Layers, path: "/admin/sections" },
        { label: "Subjects", icon: NotebookPen, path: "/admin/subjects" },
        { label: "Timetable", icon: CalendarClock, path: "/admin/timetable" },
        { label: "Attendance", icon: CalendarCheck, path: "/admin/attendance" },
        { label: "Examinations", icon: ClipboardList, path: "/admin/exams" },
        { label: "Homework", icon: NotebookPen, path: "/admin/homework" },
      ],
    },
    {
      section: "Management",
      items: [
        { label: "Fees Collection", icon: Wallet, path: "/admin/fees" },
        { label: "Library", icon: Library, path: "/admin/library" },
        { label: "Notice Board", icon: Bell, path: "/admin/notices" },
        { label: "Reports", icon: BarChart3, path: "/admin/reports" },
      ],
    },
  ],
  teacher: [
    {
      section: "Main",
      items: [{ label: "Dashboard", icon: LayoutDashboard, path: "/teacher" }],
    },
    {
      section: "Academic",
      items: [
        { label: "My Classes", icon: BookOpen, path: "/teacher/classes" },
        { label: "Timetable", icon: CalendarClock, path: "/teacher/timetable" },
        { label: "Attendance", icon: CalendarCheck, path: "/teacher/attendance" },
        { label: "Homework", icon: NotebookPen, path: "/teacher/homework" },
        { label: "Examinations", icon: ClipboardList, path: "/teacher/exams" },
      ],
    },
    {
      section: "Others",
      items: [{ label: "Notice Board", icon: Bell, path: "/teacher/notices" }],
    },
  ],
  student: [
    {
      section: "Main",
      items: [{ label: "Dashboard", icon: LayoutDashboard, path: "/student" }],
    },
    {
      section: "Academic",
      items: [
        { label: "Timetable", icon: CalendarClock, path: "/student/timetable" },
        { label: "Attendance", icon: CalendarCheck, path: "/student/attendance" },
        { label: "Homework", icon: NotebookPen, path: "/student/homework" },
        { label: "Exam Results", icon: ClipboardList, path: "/student/results" },
        { label: "Fees", icon: Wallet, path: "/student/fees" },
        { label: "Library", icon: Library, path: "/student/library" },
      ],
    },
    {
      section: "Others",
      items: [{ label: "Notice Board", icon: Bell, path: "/student/notices" }],
    },
  ],
};
