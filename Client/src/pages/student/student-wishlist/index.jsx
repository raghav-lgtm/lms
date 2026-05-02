import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import useAuthStore from "@/store/useAuthStore";
import { getWishlistService, toggleWishlistService } from "@/services/studentservices/index";
import { HeartOff, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function StudentWishlistPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [wishlistCourses, setWishlistCourses] = useState([]);

  async function fetchWishlist() {
    const response = await getWishlistService(user?.id);
    if (response?.success) {
      setWishlistCourses(response.data);
    }
  }

  useEffect(() => {
    if (user?.id) fetchWishlist();
  }, [user]);

  async function handleRemove(courseId) {
    const res = await toggleWishlistService(user?.id, courseId);
    if (res?.success) {
      toast.success("Course removed from wishlist");
      fetchWishlist();
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {wishlistCourses && wishlistCourses.length > 0 ? (
          wishlistCourses.map((course) => (
            <Card key={course?._id} className="flex flex-col relative">
              <Button
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 bg-white/70 hover:bg-white text-red-500 rounded-full z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(course._id);
                }}
              >
                <HeartOff className="h-5 w-5" />
              </Button>
              <CardContent 
                className="p-4 flex-grow cursor-pointer"
                onClick={() => navigate(`/course/details/${course?._id}`)}
              >
                <img
                  src={course?.image}
                  alt={course?.title}
                  className="h-52 w-full object-cover rounded-md mb-4"
                />
                <h3 className="font-bold mb-1">{course?.title}</h3>
                <p className="text-sm text-gray-700 mb-2">
                  {course?.instructor_name}
                </p>
                <p className="font-bold text-lg text-blue-600">${course?.pricing}</p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => navigate(`/course/details/${course?._id}`)}
                  className="flex-1"
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <h1 className="text-3xl font-bold text-muted-foreground w-full col-span-full mt-10">Your Wishlist is empty 💔</h1>
        )}
      </div>
    </div>
  );
}

export default StudentWishlistPage;
