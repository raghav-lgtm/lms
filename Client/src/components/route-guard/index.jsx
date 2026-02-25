import { useContext } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { AuthContext } from "@/context/auth-context";
import { Skeleton } from "../ui/skeleton";

function RouteGuard({ element }) {
  const { pathname } = useLocation();
  const { auth, role, loading } = useContext(AuthContext);

  // Show loading skeleton while checking auth
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

  const isAuthenticated = !!auth?.token;

  // Not logged in → redirect to auth
  if (!isAuthenticated && !pathname.startsWith("/auth")) {
    return <Navigate to="/auth" replace />;
  }

  // Logged in should not see auth pages
  if (isAuthenticated && pathname.startsWith("/auth")) {
    return <Navigate to="/home" replace />;
  }

  // Instructor-only routes
  if (pathname.startsWith("/instructor") && role !== "instructor") {
    return <Navigate to="/home" replace />;
  }

  return element;
}

export default RouteGuard;
