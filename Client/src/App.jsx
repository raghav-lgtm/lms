import { Routes, Route } from "react-router-dom";
import AuthPage from "@/pages/auth";
import InstructorDashboardPage from "./pages/instructor";
import StudentHomePage from "./pages/student/home";
import RouteGuard from "./components/route-guard";
import NotFoundPage from "./pages/not-found";
import AddNewCourse from "./pages/instructor/add-new-course";
import StudentViewCommonLayout from "@/components/student-view/common-layout";

function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/auth" element={<RouteGuard element={<AuthPage />} />} />

      {/* Student Layout — all student routes go here */}
      <Route element={<StudentViewCommonLayout />}>
        <Route
          path="/"
          element={<RouteGuard element={<StudentHomePage />} />}
        />
        <Route
          path="/home"
          element={<RouteGuard element={<StudentHomePage />} />}
        />
        {/* add other student routes here as you build them */}
      </Route>

      {/* Instructor */}
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

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
