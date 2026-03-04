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

function InstructorCourses({ listOfCourses }) {
  const navigate = useNavigate();

  function addnewcourse() {
    navigate("/instructor/create-new-course");
  }

  console.log("listofCourses", listOfCourses);

  return (
    <div>
      <Card>
        <CardHeader className="flex justify-between flex-row items-center">
          <CardTitle className="text-3xl font-extrabold">All Courses</CardTitle>
          <Button className="p-6" onClick={addnewcourse}>
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
                {listOfCourses && listOfCourses.length > 0 ? (
                  listOfCourses.map((course, index) => (
                    <TableRow key={`${course._id || course.title}-${index}`}>
                      <TableCell className="font-medium">
                        {course?.title}
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
                          onClick={() =>
                            navigate(`/instructor/edit-course/${course?._id}`)
                          }
                        >
                          <Edit className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-6 w-6" />
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
