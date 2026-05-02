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

export async function createPaymentService(formData) {
  // Server route is `/student/course/get`
  const { data } = await axiosInstance.post("/student/order/create", formData);
  return data;
}

export async function captureAndFinalizePaymentService(formData) {
  // Server route is `/student/course/get`
  const { data } = await axiosInstance.post("/student/order/capture", formData);
  return data;
}

export async function fetchStudentBoughtCoursesService(studentId) {
  const { data } = await axiosInstance.get(
    `/student/courses-bought/get/${studentId}`,
  );
  return data;
}

export async function getCurrentCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.get(
    `/student/course-progress/get/${userId}/${courseId}`
  );

  return data;
}

export async function markLectureAsViewedService(userId, courseId, lectureId) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/mark-lecture-viewed`,
    {
      userId,
      courseId,
      lectureId,
    }
  );

  return data;
}

export async function resetCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/reset-progress`,
    {
      userId,
      courseId,
    }
  );

  return data;
}
export async function addNoteService(noteData) {
  const { data } = await axiosInstance.post(`/student/course-note/add`, noteData);
  return data;
}


// ── Wishlist API ───────────────────────────────────────────────────────────
export async function toggleWishlistService(userId, courseId) {
  const { data } = await axiosInstance.post(`/student/wishlist/toggle`, { userId, courseId });
  return data;
}

export async function getWishlistService(userId) {
  const { data } = await axiosInstance.get(`/student/wishlist/${userId}`);
  return data;
}

// ── Reviews API ────────────────────────────────────────────────────────────
export async function addReviewService(userId, userName, courseId, rating, reviewMessage) {
  const { data } = await axiosInstance.post(`/student/review/add`, {
    userId,
    userName,
    courseId,
    rating,
    reviewMessage
  });
  return data;
}

export async function getCourseReviewsService(courseId) {
  const { data } = await axiosInstance.get(`/student/review/${courseId}`);
  return data;
}

export async function getNotesService(userId, courseId, lectureId) {
  const { data } = await axiosInstance.get(`/student/course-note/${userId}/${courseId}/${lectureId}`);
  return data;
}

export async function deleteNoteService(noteId, userId) {
  // Use data payload for DELETE requests in axios
  const { data } = await axiosInstance.delete(`/student/course-note/${noteId}`, { data: { userId } });
  return data;
}

