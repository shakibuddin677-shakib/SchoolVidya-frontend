import axios from "axios";

// baseURL - .env se aata hai, taaki local aur production mein alag URL use ho sakein
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  // TRUE hona ZAROORI hai - warna backend ka httpOnly cookie (jisme JWT hai) browser bhejega hi nahi, aur har request "not authorized" degi
  withCredentials: true,
});

// Yeh saare PUBLIC pages hain jahan user LOGGED IN hone ki zaroorat nahi - (jaise ek Password Reset link se aaya visitor).
const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password", "/unauthorized"];

// 401 milne par session expire samjho aur user ko login page pe bhej do
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const onPublicPage = PUBLIC_PATHS.some((p) => window.location.pathname.startsWith(p));
      if (!onPublicPage) {
        // Yahan hum sirf redirect kar rahe hain - Redux state clear karna authSlice khud handle karega jab login-check fail hoga
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
