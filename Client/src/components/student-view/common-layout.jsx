import { Outlet, useLocation } from "react-router-dom";
import StudentViewCommonHeader from "./header";

function StudentViewCommonLayout() {
  const { pathname } = useLocation();

  const hideHeader = pathname.includes("course-progress");

  return (
    <div className="min-h-screen bg-white">
      {!hideHeader && <StudentViewCommonHeader />}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default StudentViewCommonLayout;
