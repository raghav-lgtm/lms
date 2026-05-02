import { courseCategories } from "@/config";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useStudentStore from "@/store/useStudentStore";
import useAuthStore from "@/store/useAuthStore";
import { fetchAllStudentCoursesService, toggleWishlistService } from "@/services/studentservices/index";
import { Heart } from "lucide-react";
import { toast } from "sonner";

function StudentHomePage() {
  const navigate = useNavigate();
  const {
    studentViewCoursesList,
    setStudentViewCoursesList,
    loadingState,
    setLoadingState,
  } = useStudentStore();
  const { getRole } = useAuthStore();
  const role = getRole();

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoadingState(true);
        const res = await fetchAllStudentCoursesService();
        if (res?.success) setStudentViewCoursesList(res.data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoadingState(false);
      }
    }
    fetchCourses();
  }, []);

  function handleNavigateToCoursesPage(getCurrentId) {
    sessionStorage.removeItem("filters");
    const currentFilter = { category: [getCurrentId] };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate("/courses");
  }

  function handleCourseNavigate(courseId) {
    navigate(`/course/details/${courseId}`);
  }

  async function handleToggleWishlist(courseId) {
    const userObj = useAuthStore.getState().user;
    if (!userObj?.id) return;
    const res = await toggleWishlistService(userObj.id, courseId);
    if (res?.success) {
      toast.success(res.message);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {role === "instructor" && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center justify-between">
          <p className="text-sm text-yellow-800 font-medium">
            You are logged in as an Instructor
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/instructor")}
            className="border-yellow-400 text-yellow-800 hover:bg-yellow-100"
          >
            Go to Instructor Dashboard
          </Button>
        </div>
      )}

      <section className="flex flex-col lg:flex-row items-center justify-between py-12 px-4 lg:px-8 bg-gradient-to-r from-violet-50/50 via-background to-purple-50/50 dark:from-indigo-950/20 dark:via-background dark:to-violet-950/20">
        <div className="lg:w-1/2 lg:pr-12">
          <h1 className="text-5xl font-extrabold mb-6 text-foreground tracking-tight leading-tight">
            Learning that gets you <span className="text-primary">hired.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-lg">
            Skills for your present and your future. Get Started with US.
          </p>
        </div>
        <div className="lg:w-full mb-8 lg:mb-0">
          <img
            src="/banner-img.png"
            width={600}
            height={400}
            className="w-full h-auto rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
            alt="Hero Banner"
          />
        </div>
      </section>

      <section className="py-12 px-4 lg:px-8 bg-background">
        <h2 className="text-3xl font-bold mb-8 text-foreground">Explore Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {courseCategories.map((categoryItem) => (
            <Button
              className="justify-start shadow-sm hover:-translate-y-1 hover:shadow-md transition-all font-medium py-6 bg-muted/50 border-border text-foreground hover:bg-background hover:text-primary hover:border-primary"
              variant="outline"
              key={categoryItem.id}
              onClick={() => handleNavigateToCoursesPage(categoryItem.id)}
            >
              {categoryItem.label}
            </Button>
          ))}
        </div>
      </section>

      <section className="py-12 px-4 lg:px-8">
        <h2 className="text-2xl font-bold mb-6">Featured Courses</h2>
        {loadingState ? (
          <div className="text-center py-12 text-gray-500">
            Loading courses...
          </div>
        ) : studentViewCoursesList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {studentViewCoursesList.map((courseItem) => (
              <div
                key={courseItem._id}
                onClick={() => handleCourseNavigate(courseItem._id)}
                className="border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-card group relative"
              >
                <Button
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 bg-white/70 hover:bg-white text-muted-foreground hover:text-red-500 rounded-full z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleWishlist(courseItem._id);
                  }}
                >
                  <Heart className="h-5 w-5" />
                </Button>
                <div className="overflow-hidden">
                  <img
                    src={courseItem.image}
                    width={300}
                    height={150}
                    className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={courseItem.title}
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 text-foreground line-clamp-2">{courseItem.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {courseItem.instructor_name}
                  </p>
                  <p className="font-extrabold text-[18px] text-primary">${courseItem.pricing}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No courses available at the moment.
          </div>
        )}
      </section>
    </div>
  );
}

export default StudentHomePage;
