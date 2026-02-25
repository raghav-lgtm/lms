import React, { useState, createContext } from "react";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";

export const InstructorContext = createContext(null);

export function InstructorProvider({ children }) {
  const [courseLandingInitials, setCourseLandingInitials] = useState(
    courseLandingInitialFormData,
  );

  const [courseCurriculamFormData, setCourseCurriculamFormData] = useState(
    courseCurriculumInitialFormData,
  );

  const [mediaUploadProgress, setMediaUploadProgress] = useState(false);

  return (
    <InstructorContext.Provider
      value={{
        courseLandingInitials,
        setCourseLandingInitials,
        courseCurriculamFormData,
        setCourseCurriculamFormData,
        mediaUploadProgress,
        setMediaUploadProgress,
      }}
    >
      {children}
    </InstructorContext.Provider>
  );
}
