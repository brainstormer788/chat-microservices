import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 10000,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      error.userMessage = "Request timed out. Check API Gateway and services.";
    } else if (!error.response) {
      error.userMessage = "Cannot reach API Gateway. Ensure gateway is running on port 5000.";
    }
    return Promise.reject(error);
  }
);

export default api;
