import axios from "axios";
import store from "@/store";
import { clearAuth } from "@/store/auth";

const unauthorizedCode = [401];

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || "https://api.example.com"}/api/v1`,
  timeout: 50000, // Timeout limit (optional)
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    let accessToken;

    if (!accessToken) {
      const { auth } = store.getState();
      accessToken = auth.token;
    }
    config.headers["x-api-key"] = "8c2d1c7f4e7d2c4a98bfa7350cbe8a8f1d75c8f20d0c7a1fbd2fc4b22a6b0a8a";

    if (accessToken) {
      config.headers.Authorization = accessToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    const { response } = error;

    if (response && unauthorizedCode.includes(response.status)) {
      console.error("API Error:", error);
      store.dispatch(clearAuth());
      location.replace("/dashboard/login");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
