import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/LoginPage";
import ForgotPasswordPage from "../features/auth/ForgotPasswordPage";
import ResetPasswordPage from "../features/auth/ResetPasswordPage";
import UnauthorizedPage from "../features/auth/UnauthorizedPage";
import AdminDashboard from "../features/dashboard/AdminDashboard";
import TeacherDashboard from "../features/dashboard/TeacherDashboard";
import StudentDashboard from "../features/dashboard/StudentDashboard";
import StudentsList from "../features/students/StudentsList";
import TeachersList from "../features/teachers/TeachersList";
import ParentsList from "../features/parents/ParentsList";
import ClassesList from "../features/classes/ClassesList";
import SectionsList from "../features/classes/SectionsList";
import SubjectsList from "../features/classes/SubjectsList";
import TimetableView from "../features/timetable/TimetableView";
import TeacherTimetableView from "../features/timetable/TeacherTimetableView";
import StudentTimetableView from "../features/timetable/StudentTimetableView";
import MyClassesView from "../features/classes/MyClassesView";
import AttendanceMark from "../features/attendance/AttendanceMark";
import StudentAttendanceView from "../features/attendance/StudentAttendanceView";
import ExamsList from "../features/exams/ExamsList";
import ExamScheduleView from "../features/exams/ExamScheduleView";
import ResultEntry from "../features/exams/ResultEntry";
import StudentResultsView from "../features/exams/StudentResultsView";
import MarksheetView from "../features/exams/MarksheetView";
import FeesList from "../features/fees/FeesList";
import StudentFeeView from "../features/fees/StudentFeeView";
import LibraryList from "../features/library/LibraryList";
import StudentLibraryView from "../features/library/StudentLibraryView";
import HomeworkList from "../features/homework/HomeworkList";
import SubmissionsView from "../features/homework/SubmissionsView";
import StudentHomeworkView from "../features/homework/StudentHomeworkView";
import NoticesList from "../features/notices/NoticesList";
import ActiveNoticesView from "../features/notices/ActiveNoticesView";
import ReportsPage from "../features/reports/ReportsPage";
import ProtectedRoute from "./ProtectedRoute";

// Admin ke saare module routes ek jagah - repeat pattern hai isliye
// yeh array-driven approach code ko chhota rakhta hai
const adminModules = [
  { path: "/admin/students", element: <StudentsList /> },
  { path: "/admin/teachers", element: <TeachersList /> },
  { path: "/admin/parents", element: <ParentsList /> },
  { path: "/admin/classes", element: <ClassesList /> },
  { path: "/admin/sections", element: <SectionsList /> },
  { path: "/admin/subjects", element: <SubjectsList /> },
  { path: "/admin/timetable", element: <TimetableView /> },
  { path: "/admin/attendance", element: <AttendanceMark /> },
  { path: "/admin/exams", element: <ExamsList /> },
  { path: "/admin/exams/:examId/schedule", element: <ExamScheduleView /> },
  { path: "/admin/exams/:examId/schedule/:scheduleId/results", element: <ResultEntry /> },
  { path: "/admin/fees", element: <FeesList /> },
  { path: "/admin/library", element: <LibraryList /> },
  { path: "/admin/homework", element: <HomeworkList /> },
  { path: "/admin/homework/:homeworkId/submissions", element: <SubmissionsView /> },
  { path: "/admin/notices", element: <NoticesList /> },
  { path: "/admin/reports", element: <ReportsPage /> },
];

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      {adminModules.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={<ProtectedRoute allowedRoles={["admin"]}>{element}</ProtectedRoute>}
        />
      ))}

      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/classes"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <MyClassesView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/timetable"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherTimetableView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/attendance"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <AttendanceMark />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/homework"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <HomeworkList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/homework/:homeworkId/submissions"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <SubmissionsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/exams"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <ExamsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/notices"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <ActiveNoticesView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/exams/:examId/schedule"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <ExamScheduleView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/exams/:examId/schedule/:scheduleId/results"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <ResultEntry />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/timetable"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentTimetableView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/attendance"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentAttendanceView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/results"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentResultsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/results/:examId/marksheet"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <MarksheetView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/fees"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentFeeView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/library"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLibraryView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/homework"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentHomeworkView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/notices"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <ActiveNoticesView />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
