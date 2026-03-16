import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useInstructorStore from "@/store/useInstructorStore";
import CourseCurriculum from "@/components/instructor-view/courses/add-new-course/curriculum";
import CourseLanding from "@/components/instructor-view/courses/add-new-course/course-landing";
import CourseSetting from "@/components/instructor-view/courses/add-new-course/course-setting";
import useAuthStore from "@/store/useAuthStore";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  addNewCourseService,
  updateCourseById,
  fetchInstructorCourseDetailsService,
} from "@/services/mediahandle";
import { courseCurriculumInitialFormData } from "@/config";

const isEmpty = (value) =>
  value === "" || value === undefined || value === null;

function AddNewCourse() {
  const {
    courseLandingInitials,
    courseCurriculamFormData,
    setCourseLandingInitials,
    setCourseCurriculamFormData,
    resetCourseCreationState,
  } = useInstructorStore();

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { pathname } = useLocation();

  const isEditMode = pathname.includes("edit-course");

  const [submitLoading, setSubmitLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    if (!isEditMode || !courseId) return;

    async function loadCourse() {
      try {
        setFetchLoading(true);
        const response = await fetchInstructorCourseDetailsService(courseId);

        if (response?.success) {
          const data = response.data;

          setCourseLandingInitials({
            title: data.title || "",
            category: data.category || "",
            level: data.level || "",
            primaryLanguage: data.primaryLanguage || "",
            subtitle: data.subtitle || "",
            description: data.description || "",
            pricing: data.pricing || "",
            objectives: data.objectives || "",
            welcomeMessage: data.welcomeMessage || "",
            image: data.image || "",
          });

          setCourseCurriculamFormData(
            data.curriculam?.length
              ? data.curriculam.map((item) => ({
                  title: item.title || "",
                  videoUrl: item.videoUrl || "",
                  freePreview: item.freePreview || false,
                  public_id: item.public_id || "",
                }))
              : courseCurriculumInitialFormData,
          );
        }
      } catch (error) {
        console.error("Failed to load course for editing:", error);
      } finally {
        setFetchLoading(false);
      }
    }

    loadCourse();
  }, [courseId, isEditMode]);

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
    for (const item of courseCurriculamFormData) {
      if (
        isEmpty(item.title) ||
        isEmpty(item.videoUrl) ||
        isEmpty(item.public_id)
      )
        return false;
      if (item.freePreview) hasFreePreview = true;
    }

    return hasFreePreview;
  }, [courseLandingInitials, courseCurriculamFormData]);

  async function handleSubmit() {
    try {
      setSubmitLoading(true);

      const courseData = {
        instructor_id: user?.id,
        instructor_name: user?.userName,
        date: new Date(),
        ...courseLandingInitials,
        students: [],
        curriculam: courseCurriculamFormData,
        isPublished: true,
      };

      const response =
        isEditMode && courseId
          ? await updateCourseById(courseId, courseData)
          : await addNewCourseService(courseData);

      if (response?.success) {
        resetCourseCreationState();
        navigate(-1);
      }
    } catch (e) {
      console.error(`Failed to ${isEditMode ? "update" : "create"} course:`, e);
    } finally {
      setSubmitLoading(false);
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading course details...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-extrabold">
          {isEditMode ? "Edit Course" : "Create a New Course"}
        </h1>

        <Button
          className="text-sm tracking-wider font-bold px-8"
          disabled={!isValid || submitLoading}
          onClick={handleSubmit}
        >
          {submitLoading ? "Please wait..." : isEditMode ? "UPDATE" : "SUBMIT"}
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
