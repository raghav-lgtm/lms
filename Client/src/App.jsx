import { Routes, Route } from "react-router-dom";

import AuthPage from "@/pages/auth";
import InstructorDashboardPage from "./pages/instructor/index";
import StudentHomePage from "./pages/student/index";
import RouteGuard from "./components/route-guard";
import NotFoundPage from "./pages/not-found";
import AddNewCourse from "./pages/instructor/add-new-course";

function App() {
  return (
    <Routes>
      {/* Auth Page */}
      <Route path="/auth" element={<RouteGuard element={<AuthPage />} />} />

      {/* Student Home */}
      <Route
        path="/home"
        element={<RouteGuard element={<StudentHomePage />} />}
      />

      {/* Instructor Dashboard */}
      <Route
        path="/instructor"
        element={<RouteGuard element={<InstructorDashboardPage />} />}
      />
      {/*add page */}
      <Route path="/instructor/create-new-course" element={<AddNewCourse />} />
      <Route
        path="/instructor/edit-course/:courseId"
        element={<RouteGuard element={<AddNewCourse />} />}
      />

      <Route path="" element={<StudentHomePage />} />
      <Route path="home" element={<StudentHomePage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
