import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useStudentStore from "@/store/useStudentStore";
import { fetchStudentViewCourseDetailsService } from "@/services/studentservices/index";
import { Button } from "@/components/ui/button";
import { PlayCircle, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPlayer from "@/components/instructor-view/video-player";
import useAuthStore from "@/store/useAuthStore";
import { createPaymentService, getCourseReviewsService } from "@/services/studentservices/index";
import { Star } from "lucide-react";

function StudentCourseDetailsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const {
    studentViewCourseDetails,
    setStudentViewCourseDetails,
    loadingState,
    setLoadingState,
  } = useStudentStore();

  const [activePreviewIndex, setActivePreviewIndex] = useState(null);
  const [approvalUrl, setApprovalUrl] = useState(null);
  const [reviewsData, setReviewsData] = useState(null);

  const curriculam = studentViewCourseDetails?.curriculam;
  const { user } = useAuthStore();

  const activePreviewLecture = useMemo(() => {
    if (!Array.isArray(curriculam)) return null;
    if (activePreviewIndex === null) return null;
    const lecture = curriculam[activePreviewIndex];
    if (!lecture?.freePreview) return null;
    if (!lecture?.videoUrl) return null;
    return lecture;
  }, [curriculam, activePreviewIndex]);

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoadingState(true);
        const res = await fetchStudentViewCourseDetailsService(courseId);
        if (res?.success) setStudentViewCourseDetails(res.data);
        const reviewRes = await getCourseReviewsService(courseId);
        if (reviewRes?.success) setReviewsData(reviewRes.data);
      } catch (error) {
        console.error("Failed to fetch course details:", error);
      } finally {
        setLoadingState(false);
      }
    }
    fetchDetails();
    return () => setStudentViewCourseDetails(null);
  }, [courseId]);

  useEffect(() => {
    setActivePreviewIndex(null);
  }, [courseId]);

  useEffect(() => {
    if (approvalUrl) {
      window.location.href = approvalUrl;
    }
  }, [approvalUrl]);

  async function handleCreatePayment() {
    try {
      const paymentPayload = {
        userId: user?.id,
        userName: user?.userName,
        userEmail: user?.userEmail,
        orderStatus: "pending",
        paymentMethod: "paypal",
        paymentStatus: "Initiated",
        orderDate: new Date(),
        paymentId: null,
        payerId: null,
        instructorId: studentViewCourseDetails?.instructor_id,
        instructorName: studentViewCourseDetails?.instructor_name,
        courseImage: studentViewCourseDetails?.image,
        courseTitle: studentViewCourseDetails?.title,
        courseId: studentViewCourseDetails?._id,
        coursePricing: studentViewCourseDetails?.pricing,
      };
      const res = await createPaymentService(paymentPayload);
      if (res?.success) {
        sessionStorage.setItem("currentOrderId", JSON.stringify(res.data.orderId));
        setApprovalUrl(res?.data?.approveUrl);
      } else {
        console.error("Failed to create payment:", res?.message);
      }
    } catch (error) {
      console.error("Failed to create payment:", error);
    }
  }

  if (loadingState) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="bg-gray-900 py-10 px-4 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-4">
            <Skeleton className="h-10 w-3/4 bg-gray-700" />
            <Skeleton className="h-6 w-1/2 bg-gray-700" />
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-4 w-24 bg-gray-700" />
              <Skeleton className="h-4 w-24 bg-gray-700" />
              <Skeleton className="h-4 w-24 bg-gray-700" />
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border dark:border-gray-700 space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border dark:border-gray-700 space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border dark:border-gray-700 space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="border dark:border-gray-700 rounded-lg p-6 shadow-md bg-white dark:bg-gray-900 space-y-4">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!studentViewCourseDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500 dark:text-gray-400 gap-4">
        <p>Course not found.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const {
    title,
    subtitle,
    description,
    objectives,
    welcomeMessage,
    instructor_name,
    primaryLanguage,
    level,
    pricing,
    image,
    students,
  } = studentViewCourseDetails;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Banner */}
      <div className="bg-gray-900 text-white py-10 px-4 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-3">{title}</h1>
          <p className="text-gray-300 text-lg mb-4">{subtitle}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span>{instructor_name}</span>
            <span>{primaryLanguage}</span>
            <span>{level}</span>
            <span>{students?.length ?? 0} students enrolled</span>
            {reviewsData?.totalReviews > 0 && (
              <span className="flex items-center gap-1 text-yellow-400 font-bold">
                <Star className="h-4 w-4 fill-current" />
                {reviewsData.averageRating} ({reviewsData.totalReviews} ratings)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {activePreviewLecture && (
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border dark:border-gray-700">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold dark:text-white">Free Preview</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {activePreviewLecture.title}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActivePreviewIndex(null)}>
                  Close
                </Button>
              </div>
              <div className="mt-4 aspect-video w-full overflow-hidden rounded-md bg-black">
                <VideoPlayer videoUrl={activePreviewLecture.videoUrl} />
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 dark:text-white">What you'll learn</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{objectives}</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Course Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{description}</p>
          </div>

          {welcomeMessage && (
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4 dark:text-white">Welcome Message</h2>
              <p className="text-gray-700 dark:text-gray-300">{welcomeMessage}</p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Course Curriculum ({curriculam?.length ?? 0} lectures)
            </h2>
            <div className="space-y-2">
              {curriculam?.map((lecture, index) => (
                <button
                  key={lecture?.public_id || lecture?.videoUrl || index}
                  type="button"
                  onClick={() => {
                    if (lecture?.freePreview) {
                      setActivePreviewIndex(index);
                      return;
                    }
                    alert("This lecture is locked. Purchase the course to watch it.");
                  }}
                  className="w-full text-left flex items-center justify-between p-3 rounded-md border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 text-gray-800 dark:text-gray-200"
                >
                  <div className="flex items-center gap-3">
                    {lecture.freePreview ? (
                      <PlayCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    )}
                    <span className="text-sm font-medium">{lecture.title}</span>
                  </div>
                  {lecture.freePreview && (
                    <span className="text-xs text-green-600 font-semibold">
                      Free Preview
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Student Reviews</h2>
            {!reviewsData || reviewsData.totalReviews === 0 ? (
              <p className="text-muted-foreground">No reviews yet for this course. Be the first to try it out!</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6 border-b pb-4 dark:border-gray-800">
                  <span className="text-4xl font-black text-yellow-500">{reviewsData.averageRating}</span>
                  <div className="flex flex-col">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.round(reviewsData.averageRating) ? 'fill-current' : 'text-gray-300 dark:text-gray-700'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">{reviewsData.totalReviews} course ratings</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {reviewsData.reviews.map((r, i) => (
                    <div key={i} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold">{r.userName || "Anonymous Student"}</div>
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, idx) => (
                            <Star key={Math.random()} className={`h-3 w-3 ${idx < r.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-700'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{r.reviewMessage}</p>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="border dark:border-gray-700 rounded-lg p-6 shadow-md sticky top-6 bg-white dark:bg-gray-900">
            <img src={image} className="w-full h-40 object-cover rounded-md mb-4" />
            <p className="text-3xl font-bold mb-2 dark:text-white">${pricing}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">One-time payment</p>
            <Button className="w-full mb-2" onClick={handleCreatePayment}>
              Buy Now
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentCourseDetailsPage;