import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";

const useInstructorStore = create(
  persist(
    (set) => ({
  courseLandingInitials: courseLandingInitialFormData,
  courseCurriculamFormData: courseCurriculumInitialFormData,
  mediaUploadProgress: false,
  InstructorCoursesList: [],

  setCourseLandingInitials: (courseLandingInitials) =>
    set({ courseLandingInitials }),
  setCourseCurriculamFormData: (courseCurriculamFormData) =>
    set({ courseCurriculamFormData }),
  setMediaUploadProgress: (mediaUploadProgress) => set({ mediaUploadProgress }),
  setInstructorCoursesList: (InstructorCoursesList) =>
    set({ InstructorCoursesList }),

  resetCourseCreationState: () =>
    set({
      courseLandingInitials: courseLandingInitialFormData,
      courseCurriculamFormData: courseCurriculumInitialFormData,
      mediaUploadProgress: false,
    }),
    }),
    {
      name: "instructor-course-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        courseLandingInitials: state.courseLandingInitials,
        courseCurriculamFormData: state.courseCurriculamFormData,
      }), // only persist these fields
    }
  )
);

export default useInstructorStore;
