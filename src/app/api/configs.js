
import axios from 'axios';

// Get base URL from environment variable
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://aiahm.onrender.com';

// Create the main Axios instance
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Separate client for refresh requests.
// This avoids triggering the main response interceptor recursively.
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage keys
const ACCESS_TOKEN_KEY = 'avi_india_token';
const REFRESH_TOKEN_KEY = 'avi_india_refresh_token';

// Set access token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);

    axiosInstance.defaults.headers.common.Authorization =
      `Bearer ${token}`;
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

// Get access token
export const getAuthToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Set refresh token
export const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

// Get refresh token
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// Remove both tokens
export const removeAuthToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);

  delete axiosInstance.defaults.headers.common.Authorization;
};

// Restore access token when the app loads
const initializeToken = () => {
  const storedToken = getAuthToken();

  if (storedToken) {
    axiosInstance.defaults.headers.common.Authorization =
      `Bearer ${storedToken}`;
  }
};

initializeToken();

// Attach the latest access token to each request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers) {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Share one refresh request across simultaneous failed requests
let refreshPromise = null;

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token is available.');
  }

  const response = await refreshClient.post('/auth/refresh-token', {
    refreshToken,
  });

  const data = response.data;

  if (!data?.accessToken) {
    throw new Error('Refresh response did not contain an access token.');
  }

  // Save the new access token
  setAuthToken(data.accessToken);

  // Save the rotated refresh token, if returned
  if (data.refreshToken) {
    setRefreshToken(data.refreshToken);
  }

  return data.accessToken;
};

// Refresh on 401 and retry the original request once
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh-token')
    ) {
      return Promise.reject(error);
    }

    // Avoid trying to refresh during login/OTP authentication flows.
    if (
      /\/auth\/(verify-otp|request-login-otp|resend-otp|verify-email)$/.test(
        originalRequest.url || ''
      )
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      removeAuthToken();

      // Let your existing authentication flow handle navigation if needed.
      window.dispatchEvent(new Event('avi-auth-expired'));

      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
