import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import useAuthStore from "@/store/useAuthStore";
import useStudentStore from "@/store/useStudentStore";
import { fetchStudentBoughtCoursesService } from "@/services/studentservices/index";
import { Watch } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function StudentCoursePage() {
  const user = useAuthStore((state) => state.user);
  const studentBoughtCoursesList = useStudentStore((state) => state.studentBoughtCoursesList);
  const setStudentBoughtCoursesList = useStudentStore((state) => state.setStudentBoughtCoursesList);
  const navigate = useNavigate();

  async function fetchStudentBoughtCourses() {
    const response = await fetchStudentBoughtCoursesService(user?.id);
    if (response?.success) {
      setStudentBoughtCoursesList(response?.data);
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchStudentBoughtCourses();
    }
  }, [user]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8">My Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {studentBoughtCoursesList && studentBoughtCoursesList.length > 0 ? (
          studentBoughtCoursesList.map((course) => (
            <Card key={course?.courseId} className="flex flex-col">
              <CardContent className="p-4 flex-grow">
                <img
                  src={course?.courseImage}
                  alt={course?.title}
                  className="h-52 w-full object-cover rounded-md mb-4"
                />
                <h3 className="font-bold mb-1">{course?.title}</h3>
                <p className="text-sm text-gray-700 mb-2">
                  {course?.instructorName}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => navigate(`/student/my-courses/progress/${course?.courseId}`)}
                  className="flex-1"
                >
                  <Watch className="mr-2 h-4 w-4" />
                  Start Watching
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <h1 className="text-3xl font-bold">No Courses found</h1>
        )}
      </div>
    </div>
  );
}

export default StudentCoursePage;