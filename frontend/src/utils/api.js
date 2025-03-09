import axios from 'axios';

// Base URL for API requests
const API_BASE_URL = 'https://ccds-techfest.onrender.com';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to verify video URL
export const verifyVideoUrl = async (url) => {
  try {
    const response = await apiClient.post('/verify-video', { url });
    return {
      message: "Verification process started. This may take up to 10 minutes to complete.",
      jobStarted: true
    };
  } catch (error) {
    console.error('Error verifying video URL:', error);
    throw new Error(error.response?.data?.detail || 'Failed to verify video. Please try again later.');
  }
};

// Function to check verification status
export const checkVerificationStatus = async () => {
  try {
    const response = await apiClient.get('/verification-status');
    return response.data;
  } catch (error) {
    console.error('Error checking verification status:', error);
    throw new Error(error.response?.data?.detail || 'Failed to check verification status.');
  }
};

// Function to verify text claim
export const verifyTextClaim = async (claim) => {
  try {
    const response = await apiClient.post('/verify-claim', { claim });
    return {
      message: "Verification process started. This may take up to 10 minutes to complete.",
      jobStarted: true
    };
  } catch (error) {
    console.error('Error verifying text claim:', error);
    throw new Error(error.response?.data?.detail || 'Failed to verify claim. Please try again later.');
  }
};

// Function to check if an image is a deepfake
export const detectDeepfake = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_BASE_URL}/detect-deepfake/`, formData, { // ✅ Fixed URL
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error checking deepfake:', error);
    throw new Error(error.response?.data?.detail || 'Failed to analyze image. Please try again later.');
  }
};

export const getRandomMyth = async () => {
  try {
    const response = await apiClient.get('/get-myth');
    return response.data.myth;
  } catch (error) {
    console.error('Error fetching myth:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch myth. Please try again later.');
  }
};

export default {
  verifyVideoUrl,
  verifyTextClaim,
  detectDeepfake,
  getRandomMyth, // ✅ New function added here
};
