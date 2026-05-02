import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useRef, useCallback } from "react";
import { courseCurriculumInitialFormData } from "@/config/index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, GripVertical, RefreshCw, FileQuestion, Plus, Sparkles } from "lucide-react";
import useInstructorStore from "@/store/useInstructorStore";
import { deleteMedia, uploadMedia, generateQuizService } from "@/services/mediahandle/index";
import { Textarea } from "@/components/ui/textarea";
import VideoPlayer from "../../video-player";
import MediaProgressbar from "@/components/media-progress-bar/index";

function CourseCurriculum() {
  const {
    courseCurriculamFormData,
    setCourseCurriculamFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
  } = useInstructorStore();

  const [uploadingIndices, setUploadingIndices] = React.useState(new Set());
  const [generatingQuizIndices, setGeneratingQuizIndices] = React.useState({});
  const [quizContextInputs, setQuizContextInputs] = React.useState({});

  const fileInputRefs = useRef([]);
  const bulkFileInputRef = useRef(null);

  const setLectureUploading = useCallback((index, isUploading) => {
    setUploadingIndices((prev) => {
      const next = new Set(prev);
      isUploading ? next.add(index) : next.delete(index);
      return next;
    });
  }, []);

  function handleQuizContextChange(index, value) {
    setQuizContextInputs(prev => ({ ...prev, [index]: value }));
  }

  async function handleAutoGenerateQuiz(index) {
    const contextText = quizContextInputs[index] || "";
    if (contextText.trim() === "") {
      alert("Please provide some context text or video transcript for the AI to generate questions.");
      return;
    }

    try {
      setGeneratingQuizIndices((prev) => ({ ...prev, [index]: true }));

      const response = await generateQuizService(contextText);
      if (response?.success) {
        const questions = response.data;
        const updated = [...courseCurriculamFormData];
        updated[index].questions = [...(updated[index].questions || []), ...questions];
        setCourseCurriculamFormData(updated);
      } else {
        alert("Failed to generate quiz: " + response?.message);
      }
    } catch (error) {
      console.error("Quiz generation failed:", error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setGeneratingQuizIndices((prev) => ({ ...prev, [index]: false }));
    }
  }

  // ✅ FIXED: spread courseCurriculumInitialFormData[0] FIRST, then override type AFTER
  function addLecture(type = "video") {
    let newId;
    try {
      newId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now().toString(36) + Math.random().toString(36).substring(2);
    } catch (e) {
      newId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    const newLecture = {
      ...courseCurriculumInitialFormData[0], // spread first
      id: newId,
      type: type,                            // override type AFTER spread so it's never overwritten
      questions: type === "quiz" ? [] : undefined,
    };

    setCourseCurriculamFormData([...courseCurriculamFormData, newLecture]);
  }

  function handleQuestionChange(courseIndex, qIndex, value) {
    const updated = [...courseCurriculamFormData];
    updated[courseIndex].questions[qIndex].question = value;
    setCourseCurriculamFormData(updated);
  }

  function handleOptionChange(courseIndex, qIndex, optIndex, value) {
    const updated = [...courseCurriculamFormData];
    updated[courseIndex].questions[qIndex].options[optIndex] = value;
    setCourseCurriculamFormData(updated);
  }

  function handleCorrectAnswer(courseIndex, qIndex, optIndex) {
    const updated = [...courseCurriculamFormData];
    updated[courseIndex].questions[qIndex].correctAnswerIndex = optIndex;
    setCourseCurriculamFormData(updated);
  }

  function addQuestion(courseIndex) {
    const updated = [...courseCurriculamFormData];
    updated[courseIndex].questions = updated[courseIndex].questions || [];
    updated[courseIndex].questions.push({
      question: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
    });
    setCourseCurriculamFormData(updated);
  }

  function deleteQuestion(courseIndex, qIndex) {
    const updated = [...courseCurriculamFormData];
    updated[courseIndex].questions.splice(qIndex, 1);
    setCourseCurriculamFormData(updated);
  }

  async function deleteLecture(index) {
    const lecture = courseCurriculamFormData[index];

    if (lecture?.public_id) {
      try {
        setLectureUploading(index, true);
        await deleteMedia(lecture.public_id);
      } catch (error) {
        console.error("Failed to delete video from Cloudinary:", error);
      } finally {
        setLectureUploading(index, false);
      }
    }

    fileInputRefs.current.splice(index, 1);
    setCourseCurriculamFormData(
      courseCurriculamFormData.filter((_, i) => i !== index)
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

  async function handleSingleLectureUpload(event, index) {
    const file = event.target.files[0];
    if (!file) return;

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

  async function handleBulkUpload(event) {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const validFiles = files.filter(validateVideoFile);
    if (!validFiles.length) {
      if (bulkFileInputRef.current) bulkFileInputRef.current.value = "";
      return;
    }

    let completedCount = 0;
    const totalCount = validFiles.length;
    setMediaUploadProgress(true);

    const results = await Promise.allSettled(
      validFiles.map(async (file) => {
        const videoData = new FormData();
        videoData.append("file", file);

        try {
          const response = await uploadMedia(videoData);
          completedCount++;
          console.log(`Bulk upload progress: ${completedCount}/${totalCount}`);

          if (response?.data) {
            return {
              id: crypto.randomUUID(),
              title: file.name.replace(/\.[^/.]+$/, ""),
              videoUrl: response.data.url,
              public_id: response.data.public_id,
              freePreview: false,
              type: "video",
            };
          }
          throw new Error(`No data returned for "${file.name}"`);
        } catch (err) {
          throw new Error(`Failed to upload "${file.name}": ${err.message}`);
        }
      })
    );

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
        `${failedFiles.length} file(s) failed to upload:\n\n${failedFiles.join("\n")}`
      );
    }

    setMediaUploadProgress(false);
    if (bulkFileInputRef.current) {
      bulkFileInputRef.current.value = "";
    }
  }

  const dragIndexRef = useRef(null);

  function handleDragStart(index) {
    dragIndexRef.current = index;
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(index) {
    const fromIndex = dragIndexRef.current;
    if (fromIndex === null || fromIndex === index) return;

    const updated = [...courseCurriculamFormData];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(index, 0, moved);

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
            <CardTitle className="text-2xl font-bold">Course Curriculum</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Build your course content lecture by lecture
            </p>
            {mediaUploadProgress && (
              <MediaProgressbar isMediaUploading={mediaUploadProgress} />
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" onClick={() => addLecture("video")}>
              <Upload className="mr-2 h-4 w-4" />
              Add Video Lecture
            </Button>
            <Button
              type="button"
              onClick={() => addLecture("quiz")}
              variant="secondary"
            >
              <FileQuestion className="mr-2 h-4 w-4" />
              Add Quiz Module
            </Button>
          </div>

          <Button
            type="button"
            onClick={() => bulkFileInputRef.current?.click()}
            variant="outline"
          >
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
          {courseCurriculamFormData.map((course, index) => (
            <Card
              key={course.id || `${course.public_id || "lecture"}-${index}`}
              className="border-2"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <GripVertical
                    className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing"
                    title="Drag to reorder"
                  />
                  <div className="flex-1">
                    <Label className="flex items-center gap-2">
                      {course.type === "quiz" ? (
                        <FileQuestion className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Upload className="h-4 w-4 text-green-500" />
                      )}
                      {course.type === "quiz" ? "Quiz Module" : "Video Lecture"}{" "}
                      {index + 1}
                    </Label>
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
                {course.type === "quiz" ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6 shadow-sm">
                      <Label className="flex items-center gap-2 font-semibold text-indigo-700 mb-2">
                        ✨ AI Auto-Generate Quiz
                      </Label>
                      <p className="text-xs text-indigo-600/80 mb-3">
                        Paste curriculum text or a video transcript below, and
                        the AI will auto-generate 5 multiple-choice questions!
                      </p>
                      <textarea
                        placeholder="Paste context here..."
                        value={quizContextInputs[index] || ""}
                        onChange={(e) =>
                          handleQuizContextChange(index, e.target.value)
                        }
                        className="mb-3 bg-white w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                        rows={3}
                      />
                      <Button
                        type="button"
                        onClick={() => handleAutoGenerateQuiz(index)}
                        disabled={generatingQuizIndices[index]}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto mt-2"
                      >
                        {generatingQuizIndices[index]
                          ? "✨ Generating..."
                          : "✨ Auto-Generate Quiz"}
                      </Button>
                    </div>

                    {course.questions?.map((q, qIndex) => (
                      <Card
                        key={qIndex}
                        className="p-4 border border-blue-200 bg-blue-50/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-bold text-blue-700">
                            Question {qIndex + 1}
                          </Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteQuestion(index, qIndex)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Enter your question"
                          value={q.question}
                          onChange={(e) =>
                            handleQuestionChange(index, qIndex, e.target.value)
                          }
                          className="mb-4 bg-white"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          {q.options.map((opt, optIndex) => (
                            <div
                              key={optIndex}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="radio"
                                name={`correct-${index}-${qIndex}`}
                                checked={q.correctAnswerIndex === optIndex}
                                onChange={() =>
                                  handleCorrectAnswer(index, qIndex, optIndex)
                                }
                                className="w-4 h-4 text-blue-600 cursor-pointer"
                                title="Mark as correct answer"
                              />
                              <Input
                                placeholder={`Option ${optIndex + 1}`}
                                value={opt}
                                onChange={(e) =>
                                  handleOptionChange(
                                    index,
                                    qIndex,
                                    optIndex,
                                    e.target.value
                                  )
                                }
                                className={`bg-white ${
                                  q.correctAnswerIndex === optIndex
                                    ? "border-blue-500 ring-1 ring-blue-500"
                                    : ""
                                }`}
                              />
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}

                    <Button
                      onClick={() => addQuestion(index)}
                      variant="outline"
                      className="w-full border-dashed border-2 py-8 text-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Add Question
                    </Button>
                  </div>
                ) : (
                  <>
                    {course?.videoUrl && (
                      <div className="flex w-full items-center justify-center rounded-md bg-black/5 p-4">
                        <div className="aspect-video w-full max-w-[600px] overflow-hidden rounded-md bg-black shadow-sm">
                          <VideoPlayer videoUrl={course.videoUrl} />
                        </div>
                      </div>
                    )}

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
                            disabled={uploadingIndices.has(index)}
                            onClick={() =>
                              fileInputRefs.current[index]?.click()
                            }
                          >
                            <RefreshCw className="mr-2 h-3 w-3" />
                            {uploadingIndices.has(index)
                              ? "Uploading..."
                              : "Replace Video"}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
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
                  </>
                )}
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
              <Button onClick={() => addLecture("video")} className="mt-4">
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