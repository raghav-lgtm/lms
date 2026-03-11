import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import useInstructorStore from "@/store/useInstructorStore";
import {
  courseLandingInitialFormData,
  courseCurriculumInitialFormData,
} from "@/config";
import { deleteCourseById } from "@/services/mediahandle";

function InstructorCourses({ listOfCourses, refreshCourses }) {
  const navigate = useNavigate();
  const { setCourseLandingInitials, setCourseCurriculamFormData } =
    useInstructorStore();

  function handleAddCourse() {
    setCourseLandingInitials(courseLandingInitialFormData);
    setCourseCurriculamFormData(courseCurriculumInitialFormData);
    navigate("/instructor/create-new-course");
  }

  function handleEdit(id) {
    navigate(`/instructor/edit-course/${id}`);
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?",
    );

    if (!confirmDelete) return;

    try {
      const response = await deleteCourseById(id);

      if (response?.success) {
        alert("Course deleted successfully");
        if (refreshCourses) refreshCourses();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  }

  return (
    <div>
      <Card>
        <CardHeader className="flex justify-between flex-row items-center">
          <CardTitle className="text-3xl font-extrabold">All Courses</CardTitle>
          <Button className="p-6" onClick={handleAddCourse}>
            Create New Course
          </Button>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {listOfCourses?.length > 0 ? (
                  listOfCourses.map((course) => (
                    <TableRow key={course._id}>
                      <TableCell className="font-medium">
                        {course.title}
                      </TableCell>

                      <TableCell>{course?.students?.length ?? 0}</TableCell>

                      <TableCell>
                        $
                        {(
                          (course?.students?.length ?? 0) *
                          (course?.pricing ?? 0)
                        ).toFixed(2)}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 mr-2"
                          onClick={() => handleEdit(course._id)}
                        >
                          <Edit className="h-5 w-5" />
                          <span className="ml-1 text-xs font-medium">Edit</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(course._id)}
                        >
                          <Trash2 className="h-5 w-5" />
                          <span className="ml-1 text-xs font-medium">
                            Delete
                          </span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-gray-500"
                    >
                      No courses found. Create your first course!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InstructorCourses;
