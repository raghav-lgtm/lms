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
import PaypalPaymentReturnPage from "./pages/student/payment-return/payment-succesful";
import PaymentFailedPage from "./pages/student/payment-return/payment-failed";
import StudentCoursePage from "./pages/student/student-courses/index";
import StudentViewCourseProgressPage from "./pages/student/course-progress";
import StudentWishlistPage from "./pages/student/student-wishlist";

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
        <Route
          path="/student/my-courses"
          element={<RouteGuard element={<StudentCoursePage />} />}
        />
        <Route
          path="/student/wishlist"
          element={<RouteGuard element={<StudentWishlistPage />} />}
        />
        <Route
          path="/student/my-courses/progress/:id"
          element={<RouteGuard element={<StudentViewCourseProgressPage />} />}
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
      <Route path="/payment-return" element={<PaypalPaymentReturnPage />} />
      <Route path="/payment-cancel" element={<PaymentFailedPage />} />
    </Routes>
  );
}

export default App;