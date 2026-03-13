import { Routes, Route } from "react-router-dom";
import AuthPage from "@/pages/auth";
import InstructorDashboardPage from "./pages/instructor";
import StudentHomePage from "./pages/student/home";
import StudentCourseDetailsPage from "@/pages/student/course-details";
import RouteGuard from "./components/route-guard";
import NotFoundPage from "./pages/not-found";
import AddNewCourse from "./pages/instructor/add-new-course";
import StudentViewCommonLayout from "@/components/student-view/common-layout";
import StudentViewCoursesPage from "./pages/student/allcourses";

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<RouteGuard element={<AuthPage />} />} />

      <Route element={<StudentViewCommonLayout />}>
        <Route
          path="/"
          element={<RouteGuard element={<StudentHomePage />} />}
        />
        <Route
          path="/home"
          element={<RouteGuard element={<StudentHomePage />} />}
        />
        <Route
          path="/courses"
          element={<RouteGuard element={<StudentViewCoursesPage />} />}
        />
        <Route
          path="/course/details/:courseId"
          element={<RouteGuard element={<StudentCourseDetailsPage />} />}
        />
      </Route>

      <Route
        path="/instructor"
        element={<RouteGuard element={<InstructorDashboardPage />} />}
      />
      <Route
        path="/instructor/create-new-course"
        element={<RouteGuard element={<AddNewCourse />} />}
      />
      <Route
        path="/instructor/edit-course/:courseId"
        element={<RouteGuard element={<AddNewCourse />} />}
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
