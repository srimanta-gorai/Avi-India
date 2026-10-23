
import axiosInstance from './configs';


export const getDashboardData = async () => {
  const response = await axiosInstance.get("/account/dashboard");
  return response.data;
};


// GET /management/students
export const getStudents = async () => {
  const response = await axiosInstance.get('/management/students');
  return response.data;
};

// GET /management/students/active
export const getActiveStudents = async () => {
  const response = await axiosInstance.get('/management/students/active');
  return response.data;
};

// GET /management/employees
export const getEmployees = async () => {
  const response = await axiosInstance.get('/management/employees');
  return response.data;
};
