import { axiosInstance } from "@/api/axiosInatance";

export async function fetchAllStudentCoursesService() {
  // Server route is `/student/course/get`
  const { data } = await axiosInstance.get("/student/course/get");
  return data;
}

export async function fetchStudentViewCourseListService(query) {
  const { data } = await axiosInstance.get(`/student/course/get?${query}`);
  return data;
}

export async function fetchStudentViewCourseDetailsService(courseId) {
  const { data } = await axiosInstance.get(
    `/student/course/get/details/${courseId}`,
  );
  return data;
}

export async function checkCoursePurchaseInfoService(courseId, studentId) {
  const { data } = await axiosInstance.get(
    `/student/course/purchase-info/${courseId}/${studentId}`,
  );
  return data;
}
