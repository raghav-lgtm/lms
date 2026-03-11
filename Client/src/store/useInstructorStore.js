import { create } from "zustand";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";

const useInstructorStore = create((set) => ({
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
}));

export default useInstructorStore;
