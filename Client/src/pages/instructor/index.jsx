import React, { useEffect, useState } from "react";
import { BarChart, Book, LogOut, MessageCircle } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import InstructorDashboard from "@/components/instructor-view/dashboard/index";
import InstructorCourses from "../../components/instructor-view/courses/index";
import InstructorChats from "@/components/instructor-view/chats/index";
import useInstructorStore from "@/store/useInstructorStore";
import { fetchInstructorCourseListService } from "@/services/mediahandle";
import { ThemeToggle } from "@/components/theme-toggle";

function InstructorDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [activeTab, setActiveTab] = useState("dashboard");
  const instructorCoursesList = useInstructorStore((state) => state.InstructorCoursesList);
  const setInstructorCoursesList = useInstructorStore((state) => state.setInstructorCoursesList);

  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;

    async function fetchAllCourses() {
      try {
        const response = await fetchInstructorCourseListService(user?.id);
        if (isMounted && response?.success) setInstructorCoursesList(response?.data);
      } catch (err) {
        if (isMounted) console.error(err);
      }
    }

    fetchAllCourses();
    return () => { isMounted = false; };
  }, [user?.id]);

  const menuItems = [
    {
      icon: BarChart,
      label: "Dashboard",
      value: "dashboard",
      component: <InstructorDashboard listOfCourses={instructorCoursesList} />,
    },
    {
      icon: Book,
      label: "Courses",
      value: "courses",
      component: <InstructorCourses listOfCourses={instructorCoursesList} />,
    },
    {
      icon: MessageCircle,
      label: "Live Chats",
      value: "chats",
      component: <InstructorChats listOfCourses={instructorCoursesList} />,
    },
    {
      icon: LogOut,
      label: "Logout",
      value: "logout",
      component: null,
    },
  ];

  function handleLogout() {
    logout();
    sessionStorage.clear();
  }

  return (
    <div className="flex h-full min-h-screen bg-muted/40">
      <aside className="w-64 bg-card border-r shadow-sm flex flex-col">
        <div className="p-4 flex-1">
          <h2 className="text-2xl font-bold mb-4">Instructor View</h2>
          <nav>
            {menuItems.map((menuItem) => (
              <Button
                className="w-full justify-start mb-2"
                key={menuItem.value}
                variant={activeTab === menuItem.value ? "secondary" : "ghost"}
                onClick={
                  menuItem.value === "logout"
                    ? handleLogout
                    : () => setActiveTab(menuItem.value)
                }
              >
                <menuItem.icon className="mr-2 h-4 w-4" />
                {menuItem.label}
              </Button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t flex justify-between items-center">
          <span className="text-sm text-muted-foreground font-medium">Theme</span>
          <ThemeToggle />
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {menuItems.find((item) => item.value === activeTab)?.component}
        </div>
      </main>
    </div>
  );
}

export default InstructorDashboardPage;