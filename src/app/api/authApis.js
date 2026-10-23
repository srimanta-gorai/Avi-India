import { axiosInstance, setAuthToken } from './configs';

// Register a new user
const register = async (userData) => {
  try {
    const payload = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
    };

    const res = await axiosInstance.post('/auth/register', payload);
    return res.data;
  } catch (error) {
    return (
      error?.response?.data || {
        success: false,
        message: error.message,
      }
    );
  }
};

// Request a login OTP
const login = async (identifier, password) => {
  try {
    const res = await axiosInstance.post('/auth/request-login-otp', {
      identifier,
      password,
    });

    return res.data;
  } catch (error) {
    return (
      error?.response?.data || {
        success: false,
        message: error.message,
      }
    );
  }
};

// Verify login OTP and store tokens
  const verifyOTP = async (identifier, otp) => {
    try {
      const response = await axiosInstance.post("/auth/verify-otp", {
        identifier,
        otp,
      });

      const data = response.data;

      if (data.accessToken) {
        setAuthToken(data.accessToken);
      }

      if (data.refreshToken) {
        localStorage.setItem(
          "avi_india_refresh_token",
          data.refreshToken
        );
      }

      return data;
    } catch (error) {
      return error?.response?.data || {
        message: error.message,
      };
    }
  };

// Verify email address using email and OTP
const verifyEmail = async (payload) => {
  try {
    const res = await axiosInstance.post('/auth/verify-email', {
      email: payload.email,
      otp: payload.otp,
    });

    return res.data;
  } catch (error) {
    return (
      error?.response?.data || {
        success: false,
        message: error.message,
      }
    );
  }
};

// Resend OTP using email
const resendOTP = async (payload) => {
  try {
    const email =
      typeof payload === 'string' ? payload : payload?.email;

    const res = await axiosInstance.post('/auth/resend-otp', {
      email,
    });

    return res.data;
  } catch (error) {
    return (
      error?.response?.data || {
        success: false,
        message: error.message,
      }
    );
  }
};

// Refresh authentication tokens
const refreshToken = async (payload = {}) => {
  try {
    const storedRefreshToken = localStorage.getItem(
      'avi_india_refresh_token'
    );

    const res = await axiosInstance.post('/auth/refresh-token', {
      ...payload,
      ...(storedRefreshToken
        ? { refreshToken: storedRefreshToken }
        : {}),
    });

    const accessToken =
      res.data?.accessToken ||
      res.data?.data?.accessToken ||
      res.data?.token ||
      res.data?.data?.token;

    const newRefreshToken =
      res.data?.refreshToken ||
      res.data?.data?.refreshToken;

    if (accessToken) {
      setAuthToken(accessToken);
    }

    if (newRefreshToken) {
      localStorage.setItem(
        'avi_india_refresh_token',
        newRefreshToken
      );
    }

    return res.data;
  } catch (error) {
    return (
      error?.response?.data || {
        success: false,
        message: error.message,
      }
    );
  }
};

// Log out
const logout = async (payload = {}) => {
  try {
    const res = await axiosInstance.post('/auth/logout', payload);
    return res.data;
  } catch (error) {
    return (
      error?.response?.data || {
        success: false,
        message: error.message,
      }
    );
  } finally {
    setAuthToken(null);
    localStorage.removeItem('avi_india_refresh_token');
  }
};

// Get user profile
const getProfile = async () => {
  try {
    const res = await axiosInstance.get('/users/profile');
    return res.data;
  } catch (error) {
    return (
      error?.response?.data || {
        success: false,
        message: error.message,
      }
    );
  }
};

// Update user profile
const updateProfile = async (profileData) => {
  try {
    const res = await axiosInstance.put(
      '/users/profile',
      profileData
    );

    return res.data;
  } catch (error) {
    return (
      error?.response?.data || {
        success: false,
        message: error.message,
      }
    );
  }
};

// Verify invitation link
const verifyInviteLink = async (data) => {
  try {
    const res = await axiosInstance.post(
      '/api/auth/verify-link',
      data
    );

    return res.data;
  } catch (error) {
    return (
      error?.response?.data || {
        success: false,
        message: error.message,
      }
    );
  }
};

export {
  register,
  login,
  verifyOTP,
  verifyEmail,
  resendOTP,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  verifyInviteLink,
};