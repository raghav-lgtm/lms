import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useContext, useRef, useCallback } from "react";
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

  // FIX #7: Per-lecture upload progress — track which lecture indices are uploading
  const [uploadingIndices, setUploadingIndices] = React.useState(new Set());

  const fileInputRefs = useRef([]);
  const bulkFileInputRef = useRef(null);

  // Helper to mark a specific lecture index as uploading or done
  const setLectureUploading = useCallback((index, isUploading) => {
    setUploadingIndices((prev) => {
      const next = new Set(prev);
      isUploading ? next.add(index) : next.delete(index);
      return next;
    });
  }, []);

  function addLecture() {
    // FIX #4: Assign a stable unique id to each new lecture
    setCourseCurriculamFormData([
      ...courseCurriculamFormData,
      { ...courseCurriculumInitialFormData[0], id: crypto.randomUUID() },
    ]);
  }

  async function deleteLecture(index) {
    const lecture = courseCurriculamFormData[index];

    // If the lecture has a video, delete it from Cloudinary first
    if (lecture?.public_id) {
      try {
        setLectureUploading(index, true);
        await deleteMedia(lecture.public_id);
      } catch (error) {
        console.error("Failed to delete video from Cloudinary:", error);
        // Still proceed with removing the lecture from UI even if Cloudinary fails
      } finally {
        setLectureUploading(index, false);
      }
    }

    // FIX #6: Clean up stale ref when a lecture is removed
    fileInputRefs.current.splice(index, 1);
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

  // FIX #8: Client-side file validation helper
  function validateVideoFile(file) {
    const MAX_SIZE_MB = 500;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    if (!file.type.startsWith("video/")) {
      alert(`"${file.name}" is not a valid video file.`);
      return false;
    }
    if (file.size > MAX_SIZE_BYTES) {
      alert(`"${file.name}" exceeds the ${MAX_SIZE_MB}MB size limit.`);
      return false;
    }
    return true;
  }

  // FIX #7: Uses per-lecture uploading state instead of global boolean
  async function handleSingleLectureUpload(event, index) {
    const file = event.target.files[0];
    if (!file) return;

    // FIX #8: Validate before uploading
    if (!validateVideoFile(file)) {
      if (fileInputRefs.current[index]) fileInputRefs.current[index].value = "";
      return;
    }

    const existingPublicId = courseCurriculamFormData[index]?.public_id;

    try {
      setLectureUploading(index, true);
      setMediaUploadProgress(true);

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
      alert(`Upload failed for "${file.name}". Please try again.`);
    } finally {
      setLectureUploading(index, false);
      setMediaUploadProgress(false);
      if (fileInputRefs.current[index]) {
        fileInputRefs.current[index].value = "";
      }
    }
  }

  // FIX #7: Uses per-lecture uploading state
  async function handleDeleteVideo(index) {
    const lecture = courseCurriculamFormData[index];
    if (!lecture?.public_id) return;

    try {
      setLectureUploading(index, true);
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
      alert("Failed to delete video. Please try again.");
    } finally {
      setLectureUploading(index, false);
      setMediaUploadProgress(false);
    }
  }

  // FIX #1: Parallel uploads with Promise.all
  // FIX #2: Per-file error handling — failed files are reported individually, others still succeed
  // FIX #3: Progress counter shows X/N files uploaded
  // FIX #8: Per-file validation before upload
  async function handleBulkUpload(event) {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    // FIX #8: Validate all files before starting any upload
    const validFiles = files.filter(validateVideoFile);
    if (!validFiles.length) {
      if (bulkFileInputRef.current) bulkFileInputRef.current.value = "";
      return;
    }

    // FIX #3: Track per-file progress
    let completedCount = 0;
    const totalCount = validFiles.length;
    setMediaUploadProgress(true);

    // FIX #1 + #2: Upload all files in parallel, handle each independently
    const results = await Promise.allSettled(
      validFiles.map(async (file) => {
        const videoData = new FormData();
        videoData.append("file", file);

        try {
          const response = await uploadMedia(videoData);

          completedCount++;
          // FIX #3: Update a progress label (optional — wire to your progress bar if supported)
          console.log(`Bulk upload progress: ${completedCount}/${totalCount}`);

          if (response?.data) {
            return {
              // FIX #4: Stable unique id for bulk-created lectures
              id: crypto.randomUUID(),
              title: file.name.replace(/\.[^/.]+$/, ""),
              videoUrl: response.data.url,
              public_id: response.data.public_id,
              freePreview: false,
            };
          }
          throw new Error(`No data returned for "${file.name}"`);
        } catch (err) {
          throw new Error(`Failed to upload "${file.name}": ${err.message}`);
        }
      }),
    );

    // FIX #2: Separate successes from failures and report them
    const successfulLectures = [];
    const failedFiles = [];

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        successfulLectures.push(result.value);
      } else {
        failedFiles.push(result.reason?.message || "Unknown error");
      }
    });

    if (successfulLectures.length > 0) {
      setCourseCurriculamFormData([
        ...courseCurriculamFormData,
        ...successfulLectures,
      ]);
    }

    if (failedFiles.length > 0) {
      alert(
        `${failedFiles.length} file(s) failed to upload:\n\n${failedFiles.join("\n")}`,
      );
    }

    setMediaUploadProgress(false);
    if (bulkFileInputRef.current) {
      bulkFileInputRef.current.value = "";
    }
  }

  // FIX #5: Drag-and-drop reordering logic
  const dragIndexRef = useRef(null);

  function handleDragStart(index) {
    dragIndexRef.current = index;
  }

  function handleDragOver(event) {
    event.preventDefault(); // Required to allow drop
  }

  function handleDrop(index) {
    const fromIndex = dragIndexRef.current;
    if (fromIndex === null || fromIndex === index) return;

    const updated = [...courseCurriculamFormData];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(index, 0, moved);

    // FIX #6: Also reorder the file input refs to stay in sync
    const movedRef = fileInputRefs.current.splice(fromIndex, 1)[0];
    fileInputRefs.current.splice(index, 0, movedRef);

    setCourseCurriculamFormData(updated);
    dragIndexRef.current = null;
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

          <Button onClick={() => bulkFileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>

          <Input
            ref={bulkFileInputRef}
            type="file"
            multiple
            accept="video/*"
            className="hidden"
            onChange={handleBulkUpload}
          />
        </CardHeader>

        <CardContent className="space-y-4">
          {/* FIX #4: Use lecture.id as key instead of array index */}
          {courseCurriculamFormData.map((course, index) => (
            <Card
              key={course.id}
              className="border-2"
              draggable
              // FIX #5: Wire up drag-and-drop handlers
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  {/* FIX #5: Grip is now a real drag handle */}
                  <GripVertical
                    className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing"
                    title="Drag to reorder"
                  />
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
                        // FIX #7: Only disable buttons for THIS lecture, not all
                        disabled={uploadingIndices.has(index)}
                        onClick={() => fileInputRefs.current[index]?.click()}
                      >
                        <RefreshCw className="mr-2 h-3 w-3" />
                        {uploadingIndices.has(index)
                          ? "Uploading..."
                          : "Replace Video"}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        // FIX #7: Only disable buttons for THIS lecture
                        disabled={uploadingIndices.has(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteVideo(index)}
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        {uploadingIndices.has(index)
                          ? "Please wait..."
                          : "Delete Video"}
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
