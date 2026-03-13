import { GraduationCap, TvMinimalPlay } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import useAuthStore from "@/store/useAuthStore";
import { ThemeToggle } from "../theme-toggle";

function StudentViewCommonHeader() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  function handleLogout() {
    logout();
    sessionStorage.clear();
  }

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background relative z-50">
      <div className="flex items-center space-x-4">
        <Link to="/home" className="flex items-center hover:text-primary transition-colors">
          <GraduationCap className="h-8 w-8 mr-4 text-primary" />
          <span className="font-extrabold md:text-xl text-[14px] text-primary">
            EDUHUB
          </span>
        </Link>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            onClick={() => {
              location.pathname.includes("/courses")
                ? null
                : navigate("/courses");
            }}
            className="text-[14px] md:text-[16px] font-medium"
          >
            Explore Courses
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex gap-4 items-center">
          <div
            onClick={() => navigate("/student-courses")}
            className="flex cursor-pointer items-center gap-3 hover:text-primary transition-colors"
          >
            <span className="font-extrabold md:text-xl text-[14px]">
              My Courses
            </span>
            <TvMinimalPlay className="w-8 h-8 cursor-pointer" />
          </div>
          <ThemeToggle />
          <Button onClick={handleLogout}>Sign Out</Button>
        </div>
      </div>
    </header>
  );
}

export default StudentViewCommonHeader;
