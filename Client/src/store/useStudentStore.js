import { create } from "zustand";

const useStudentStore = create((set) => ({
  studentViewCoursesList: [],
  loadingState: true,
  studentViewCourseDetails: null,
  currentCourseDetailsId: null,
  studentBoughtCoursesList: [],
  studentCurrentCourseProgress: {},

  setStudentViewCoursesList: (studentViewCoursesList) =>
    set({ studentViewCoursesList }),
  setLoadingState: (loadingState) => set({ loadingState }),
  setStudentViewCourseDetails: (studentViewCourseDetails) =>
    set({ studentViewCourseDetails }),
  setCurrentCourseDetailsId: (currentCourseDetailsId) =>
    set({ currentCourseDetailsId }),
  setStudentBoughtCoursesList: (studentBoughtCoursesList) =>
    set({ studentBoughtCoursesList }),
  setStudentCurrentCourseProgress: (studentCurrentCourseProgress) =>
    set({ studentCurrentCourseProgress }),
}));

export default useStudentStore;
