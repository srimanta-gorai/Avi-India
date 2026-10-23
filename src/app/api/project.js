import axiosInstance from "./configs";

export const getRoles = async () => {
  try {
    const response = await axiosInstance.get('/roles');
    return response.data;
  } catch (error) {
    console.error('Get roles error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to fetch roles'
    };
  }
};

export const getModules = async () => {
  try {
    const response = await axiosInstance.get('/projects/modules');
    return response.data;
  } catch (error) {
    console.error('Get modules error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to fetch modules'
    };
  }
};

export const createProject = async (projectData) => {
  try {
    const response = await axiosInstance.post('/projects/create', projectData);
    return response.data;
  } catch (error) {
    console.error('Create project error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to create project'
    };
  }
};

export const getProjects = async ({ pageSize = 10, pageNo = 1, name = '', status = '' }) => {
  try {
    let url = `/projects?pageSize=${pageSize}&pageNo=${pageNo}`;
    if (name) {
      url += `&name=${encodeURIComponent(name)}`;
    }
    if (status) {
      url += `&status=${status}`;
    }
    
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Get projects error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to fetch projects'
    };
  }
};

export const checkProjectExistence = async () => {
  try {
    const response = await axiosInstance.get('/projects/check-existence');
    return response.data;
  } catch (error) {
    console.error('Check project existence error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to check project existence',
    };
  }
};