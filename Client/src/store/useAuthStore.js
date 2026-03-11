import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: true,

      // Derived value as a getter
      getRole: () => get().user?.role || null,

      login: (userData, accessToken) => {
        set({ user: userData, token: accessToken });
      },

      logout: () => {
        set({ user: null, token: null });
      },

      setLoading: (loading) => set({ loading }),
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({ user: state.user, token: state.token }), // only persist auth data, not loading
    },
  ),
);

export default useAuthStore;
