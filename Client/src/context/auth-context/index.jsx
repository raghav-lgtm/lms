import { createContext, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const AuthContext = createContext(null);

const getInitialAuth = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return {
    token: token || null,
    user: user ? JSON.parse(user) : null,
  };
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(getInitialAuth);
  const [loading, setLoading] = useState(true);

  // Derive role directly from auth state
  const role = auth?.user?.role || null;

  // Simulate initial loading or use for async auth checks
  useEffect(() => {
    // You can add async auth verification here if needed
    // For now, just set loading to false after mount
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100); // Small delay to prevent flash

    return () => clearTimeout(timer);
  }, []);

  const login = (userData, accessToken) => {
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setAuth({
      user: userData,
      token: accessToken,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({
      user: null,
      token: null,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, role, login, logout, loading }}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="space-y-4 w-full max-w-md p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
