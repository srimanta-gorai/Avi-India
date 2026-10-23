import axiosInstance from "./configs";

const getTeamMembers = async (search = '', page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get('/organisations/teams', {
      params: {
        search,
        page,
        limit
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get team members error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to fetch team members'
    };
  }
};

const createTeamMember = async (memberData) => {
  try {
    const response = await axiosInstance.post('/organisations/teams', memberData);
    return response.data;
  } catch (error) {
    console.error('Create team member error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to create team member'
    };
  }
};

const updateTeamMember = async (userId, memberData) => {
  try {
    const response = await axiosInstance.put(`/organisations/teams/${userId}`, memberData);
    return response.data;
  } catch (error) {
    console.error('Update team member error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to update team member'
    };
  }
};

const resendInvite = async (data) => {
  try {
    const response = await axiosInstance.post('/organisations/teams/resend-link', data);
    return response.data;
  } catch (error) {
    console.error('Resend invite error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to resend invite'
    };
  }
};


//  const uploadFile = async (file) => {
//   try {
//     const formData = new FormData();
//     formData.append('file', file);
    
//     const response = await axiosInstance.post('/shared/upload-file', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('File upload error:', error);
//     return error?.response?.data || {
//       success: false,
//       message: 'Failed to upload file'
//     };
//   }
// };

const uploadFile = async (file, folderName) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderName', folderName);
    
    const response = await axiosInstance.post('/shared/upload-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('File upload error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to upload file'
    };
  }
};

export { 
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  resendInvite,
  uploadFile
};