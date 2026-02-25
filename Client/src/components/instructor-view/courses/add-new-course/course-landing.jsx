import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FormControls from "@/components/common-form/form-controls";
import { courseLandingPageFormControls } from "@/config";
import { useContext } from "react";
import { InstructorContext } from "@/context/instructor-context";

function CourseLanding() {
  const { courseLandingInitials, setCourseLandingInitials } =
    useContext(InstructorContext);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Landing Page</CardTitle>
      </CardHeader>
      <CardContent>
        <FormControls
          formControls={courseLandingPageFormControls}
          formData={courseLandingInitials}
          setFormData={setCourseLandingInitials}
        />
      </CardContent>
    </Card>
  );
}

export default CourseLanding;
