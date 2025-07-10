import axios from "axios";

// Custom axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  withCredentials: true, // Cookie'leri otomatik olarak gönder
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Browser environment'da çalışıyorsa
    if (typeof window !== "undefined") {
      // Next.js'in cookie'lerini manuel olarak al
      const cookies = document.cookie;

      if (cookies) {
        // Cookie header'ını ekle (server-side routing için)
        config.headers["Cookie"] = cookies;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Bir hata oluştu";

    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: message,
      headers: error.config?.headers,
    });

    return Promise.reject(error);
  }
);

export default axiosInstance;
