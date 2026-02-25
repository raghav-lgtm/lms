import React, { useContext, useState } from "react";
import { BarChart, Book, LogOut } from "lucide-react";
import { AuthContext } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import InstructorDashboard from "@/components/instructor-view/dashboard/index"; // Import your components
import InstructorCourses from "../../components/instructor-view/courses/index";

function InstructorDashboardPage() {
  const { logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("dashboard");

  const listOfCourses = [
    {
      title: "raghav course",
      students: ["raghav", "chintu", "mintu", "bunty"],
      pricing: "100",
    },
  ];

  const menuItems = [
    {
      icon: BarChart,
      label: "Dashboard",
      value: "dashboard",
      component: <InstructorDashboard />,
    },
    {
      icon: Book,
      label: "Courses",
      value: "courses",
      component: <InstructorCourses listOfCourses={listOfCourses} />,
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
    <div className="flex h-full min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md ">
        <div className="p-4">
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
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {menuItems.find((item) => item.value === activeTab)?.component}
        </div>
      </main>
    </div>
  );
}

export default InstructorDashboardPage;
