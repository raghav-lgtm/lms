import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useContext, useRef } from "react";
import { courseCurriculumInitialFormData } from "@/config/index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, GripVertical, RefreshCw } from "lucide-react";
import { InstructorContext } from "@/context/instructor-context";
import { deleteMedia, uploadMedia } from "@/services/mediahandle/index";
import VideoPlayer from "../../video-player";
import MediaProgressbar from "@/components/media-progress-bar/index";

function CourseCurriculum() {
  const {
    courseCurriculamFormData,
    setCourseCurriculamFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
  } = useContext(InstructorContext);

  const fileInputRefs = useRef([]);

  function addLecture() {
    setCourseCurriculamFormData([
      ...courseCurriculamFormData,
      { ...courseCurriculumInitialFormData[0] },
    ]);
  }

  function deleteLecture(index) {
    setCourseCurriculamFormData(
      courseCurriculamFormData.filter((_, i) => i !== index),
    );
  }

  function handleTitleChange(event, index) {
    const updated = [...courseCurriculamFormData];
    updated[index] = { ...updated[index], title: event.target.value };
    setCourseCurriculamFormData(updated);
  }

  function handlePreviewChange(value, index) {
    const updated = [...courseCurriculamFormData];
    updated[index] = { ...updated[index], freePreview: value };
    setCourseCurriculamFormData(updated);
  }

  // Handles both fresh upload and replace (deletes old video first if exists)
  async function handleSingleLectureUpload(event, index) {
    const file = event.target.files[0];
    if (!file) return;

    const existingPublicId = courseCurriculamFormData[index]?.public_id;

    try {
      setMediaUploadProgress(true);

      // Delete old video from Cloudinary before uploading new one
      if (existingPublicId) {
        await deleteMedia(existingPublicId);
      }

      const videoData = new FormData();
      videoData.append("file", file);

      const response = await uploadMedia(videoData);

      if (response?.data) {
        const updated = [...courseCurriculamFormData];
        updated[index] = {
          ...updated[index],
          public_id: response.data.public_id,
          videoUrl: response.data.url,
        };
        setCourseCurriculamFormData(updated);
      }
    } catch (error) {
      console.error("Video upload failed:", error);
    } finally {
      setMediaUploadProgress(false);
      // Reset file input so the same file can be re-selected if needed
      if (fileInputRefs.current[index]) {
        fileInputRefs.current[index].value = "";
      }
    }
  }

  async function handleDeleteVideo(index) {
    const lecture = courseCurriculamFormData[index];
    if (!lecture?.public_id) return;

    try {
      setMediaUploadProgress(true);
      const response = await deleteMedia(lecture.public_id);

      if (response?.success) {
        const updated = [...courseCurriculamFormData];
        updated[index] = { ...updated[index], public_id: "", videoUrl: "" };
        setCourseCurriculamFormData(updated);

        if (fileInputRefs.current[index]) {
          fileInputRefs.current[index].value = "";
        }
      }
    } catch (error) {
      console.error("Delete video failed:", error);
    } finally {
      setMediaUploadProgress(false);
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              Course Curriculum
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Build your course content lecture by lecture
            </p>
            {mediaUploadProgress && (
              <MediaProgressbar isMediaUploading={mediaUploadProgress} />
            )}
          </div>
          <Button onClick={addLecture}>
            <Upload className="mr-2 h-4 w-4" />
            Add Lecture
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {courseCurriculamFormData.map((course, index) => (
            <Card key={index} className="border-2">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <div className="flex-1">
                    <Label>Lecture {index + 1}</Label>
                    <Input
                      placeholder="Enter lecture title"
                      onChange={(event) => handleTitleChange(event, index)}
                      value={course.title}
                      className="mt-2"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteLecture(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Delete lecture"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {course?.videoUrl && <VideoPlayer videoUrl={course.videoUrl} />}

                <div>
                  <Label>Upload Video</Label>

                  {/* Hidden file input — triggered by both upload and replace */}
                  <Input
                    ref={(el) => (fileInputRefs.current[index] = el)}
                    type="file"
                    accept="video/*"
                    onChange={(event) =>
                      handleSingleLectureUpload(event, index)
                    }
                    className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />

                  {course.videoUrl && (
                    <div className="mt-3 p-3 bg-muted rounded-md flex items-center justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={mediaUploadProgress}
                        onClick={() => fileInputRefs.current[index]?.click()}
                      >
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Replace Video
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={mediaUploadProgress}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteVideo(index)}
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete Video
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={course.freePreview}
                    onCheckedChange={(value) =>
                      handlePreviewChange(value, index)
                    }
                  />
                  <Label>Free Preview</Label>
                </div>
              </CardContent>
            </Card>
          ))}

          {courseCurriculamFormData.length === 0 && (
            <div className="text-center py-12">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No lectures yet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Get started by adding your first lecture
              </p>
              <Button onClick={addLecture} className="mt-4">
                <Upload className="mr-2 h-4 w-4" />
                Add First Lecture
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CourseCurriculum;
