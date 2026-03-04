import React, { useContext, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstructorContext } from "@/context/instructor-context";
import CourseCurriculum from "@/components/instructor-view/courses/add-new-course/curriculum";
import CourseLanding from "@/components/instructor-view/courses/add-new-course/course-landing";
import CourseSetting from "@/components/instructor-view/courses/add-new-course/course-setting";

function AddNewCourse() {
  const { courseLandingInitials, courseCurriculamFormData } =
    useContext(InstructorContext);

  const isEmpty = (value) =>
    value === "" || value === undefined || value === null;

  const isValid = useMemo(() => {
    const landingValid = Object.values(courseLandingInitials || {}).every(
      (value) => !isEmpty(value),
    );

    if (!landingValid) return false;

    if (
      !Array.isArray(courseCurriculamFormData) ||
      courseCurriculamFormData.length === 0
    )
      return false;

    let hasFreePreview = false;

    for (let item of courseCurriculamFormData) {
      if (
        isEmpty(item.title) ||
        isEmpty(item.videoUrl) ||
        isEmpty(item.public_id)
      ) {
        return false;
      }

      if (item.freePreview) {
        hasFreePreview = true;
      }
    }

    if (!hasFreePreview) return false;

    return true;
  }, [courseLandingInitials, courseCurriculamFormData]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between">
        <h1 className="text-3xl font-extrabold mb-5">Create a new course</h1>
        <Button
          className="text-sm tracking-wider font-bold px-8"
          disabled={!isValid}
        >
          SUBMIT
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="container mx-auto p-4">
            <Tabs defaultValue="curriculum" className="space-y-4">
              <TabsList>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="course-landing-page">
                  Course Landing Page
                </TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="curriculum">
                <CourseCurriculum />
              </TabsContent>

              <TabsContent value="course-landing-page">
                <CourseLanding />
              </TabsContent>

              <TabsContent value="settings">
                <CourseSetting />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddNewCourse;
