import { useLocation, Navigate } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import { Skeleton } from "../ui/skeleton";

function RouteGuard({ element }) {
  const { pathname } = useLocation();
  const { token, loading, getRole } = useAuthStore();
  const role = getRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  const isAuthenticated = !!token;

  if (!isAuthenticated && !pathname.startsWith("/auth")) {
    return <Navigate to="/auth" replace />;
  }

  if (isAuthenticated && pathname.startsWith("/auth")) {
    return <Navigate to="/home" replace />;
  }

  if (pathname.startsWith("/instructor") && role !== "instructor") {
    return <Navigate to="/home" replace />;
  }

  return element;
}

export default RouteGuard;
