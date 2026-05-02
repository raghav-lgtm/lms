import { axiosInstance } from "@/api/axiosInatance";

export const deleteMedia = async (publicId) => {
  if (!publicId) return;
  const res = await axiosInstance.delete(`/media/delete/${publicId}`);
  return res.data;
};

export const uploadMedia = async (videoData) => {
  const res = await axiosInstance.post("/media/upload", videoData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  console.log(res, "response");
  return res.data;
};

export async function fetchInstructorCourseListService(id) {
  const res = await axiosInstance.get(`/instructor/course/getAllCourses/${id}`);
  return res.data;
}

export async function addNewCourseService(formData) {
  const res = await axiosInstance.post(
    `/instructor/course/addCourse`,
    formData,
  );
  return res.data;
}

export async function fetchInstructorCourseDetailsService(id) {
  const res = await axiosInstance.get(`/instructor/course/getCourse/${id}`);
  return res.data;
}

export async function updateCourseById(id, formData) {
  const res = await axiosInstance.put(
    `/instructor/course/updateCourse/${id}`,
    formData,
  );
  return res.data;
}

export async function deleteCourseById(id) {
  const res = await axiosInstance.delete(
    `/instructor/course/deleteCourse/${id}`,
  );
  return res.data;
}

export async function createCourseRoomService(courseId, courseTitle) {
  const res = await axiosInstance.post("/rooms/create", {
    courseId,
    courseTitle,
  });
  return res.data;
}

export async function getRoomByCourseIdService(courseId) {
  const res = await axiosInstance.get(`/rooms/course/${courseId}`);
  return res.data;
}

export async function generateQuizService(contextText) {
  const res = await axiosInstance.post("/instructor/course/generate-quiz", {
    context: contextText,
  });
  return res.data;
}

