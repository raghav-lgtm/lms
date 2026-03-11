import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import useAuthStore from "@/store/useAuthStore";

export default function AuthProvider({ children }) {
  const { loading, setLoading } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

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

  return children;
}
