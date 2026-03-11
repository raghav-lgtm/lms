import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useStudentStore from "@/store/useStudentStore";
import { fetchStudentViewCourseDetailsService } from "@/services/studentservices/index";
import { Button } from "@/components/ui/button";
import { CheckCircle, PlayCircle, Lock } from "lucide-react";

function StudentCourseDetailsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const {
    studentViewCourseDetails,
    setStudentViewCourseDetails,
    loadingState,
    setLoadingState,
  } = useStudentStore();

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoadingState(true);
        const res = await fetchStudentViewCourseDetailsService(courseId);
        if (res?.success) setStudentViewCourseDetails(res.data);
      } catch (error) {
        console.error("Failed to fetch course details:", error);
      } finally {
        setLoadingState(false);
      }
    }

    fetchDetails();

    // clear details on unmount so stale data doesn't flash
    return () => setStudentViewCourseDetails(null);
  }, [courseId]);

  if (loadingState) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading course details...
      </div>
    );
  }

  if (!studentViewCourseDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500 gap-4">
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
    curriculam,
    students,
  } = studentViewCourseDetails;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gray-900 text-white py-10 px-4 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-3">{title}</h1>
          <p className="text-gray-300 text-lg mb-4">{subtitle}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <span>👨‍🏫 {instructor_name}</span>
            <span>🌐 {primaryLanguage}</span>
            <span>📊 {level}</span>
            <span>👥 {students?.length ?? 0} students enrolled</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — course info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Objectives */}
          <div className="bg-white rounded-lg p-6 border">
            <h2 className="text-xl font-bold mb-4">What you'll learn</h2>
            <p className="text-gray-700 whitespace-pre-line">{objectives}</p>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg p-6 border">
            <h2 className="text-xl font-bold mb-4">Course Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{description}</p>
          </div>

          {/* Welcome Message */}
          {welcomeMessage && (
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-bold mb-4">Welcome Message</h2>
              <p className="text-gray-700">{welcomeMessage}</p>
            </div>
          )}

          {/* Curriculum */}
          <div className="bg-white rounded-lg p-6 border">
            <h2 className="text-xl font-bold mb-4">
              Course Curriculum ({curriculam?.length ?? 0} lectures)
            </h2>
            <div className="space-y-2">
              {curriculam?.map((lecture, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {lecture.freePreview ? (
                      <PlayCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium">{lecture.title}</span>
                  </div>
                  {lecture.freePreview && (
                    <span className="text-xs text-green-600 font-semibold">
                      Free Preview
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — purchase card */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 shadow-md sticky top-6 bg-white">
            <img
              src={image}
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <p className="text-3xl font-bold mb-2">${pricing}</p>
            <p className="text-sm text-gray-500 mb-4">One-time payment</p>
            <Button className="w-full mb-2">Buy Now</Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentCourseDetailsPage;
