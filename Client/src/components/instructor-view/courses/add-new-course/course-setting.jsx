import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useContext } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { uploadMedia } from "@/services/upload";
import { InstructorContext } from "@/context/instructor-context";

function CourseSetting() {
  const { courseLandingInitials, setCourseLandingInitials } =
    useContext(InstructorContext);
  async function addImage(event) {
    const img_path = event.target.files?.[0];
    if (!img_path) return;

    const imgData = new FormData();
    imgData.append("file", img_path);

    try {
      const res = await uploadMedia(imgData);
      console.log("Upload success:", res);

      setCourseLandingInitials({
        ...courseLandingInitials,
        image: res.data.url,
      });

      console.log(res.data.url);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Settings</CardTitle>
      </CardHeader>
      <CardContent>
        {courseLandingInitials?.image ? (
          <img src={courseLandingInitials.image} />
        ) : (
          <div className="flex flex-col gap-3">
            <Label>Upload Course Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(event) => {
                addImage(event);
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CourseSetting;
