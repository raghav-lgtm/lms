import axios from "axios";

export const AUTH_KEYS = {
  TOKEN: "token",
  USER: "user",
};

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_KEYS.TOKEN);

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] =
        config.headers["Content-Type"] || "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error("Network error. Please try again."));
    }

    const { status } = error.response;

    if (status === 401) {
      localStorage.removeItem(AUTH_KEYS.TOKEN);
      localStorage.removeItem(AUTH_KEYS.USER);
      window.location.href = "/auth";
      return new Promise(() => { });
    }

    if (status === 403) {
      console.warn("Access forbidden — insufficient permissions");
    }

    if (status >= 500) {
      console.error("Server error — something went wrong on the backend");
    }

    return Promise.reject(error);
  }
);