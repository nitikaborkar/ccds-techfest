import axios from 'axios';

// Base URL for API requests
const API_BASE_URL = 'http://localhost:8000';

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
    // Start the verification process
    const response = await apiClient.post('/verify-video', { url });
    
    // Return just the initial response - the actual status checking will be done separately
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

// Function to verify text claim (placeholder for future implementation)
export const verifyTextClaim = async (claim) => {
  try {
    // This is a mock implementation since the endpoint doesn't exist in the backend
    // In a real implementation, you would call an actual API endpoint
    
    // Simulating API call with 3-second delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // For now, return a mock response
    return {
      consensus: ['True', 'False', 'Neutral'][Math.floor(Math.random() * 3)],
      evidence: 'This is a placeholder response for text claim verification. Your backend needs to implement this functionality.',
      claim: claim
    };
  } catch (error) {
    console.error('Error verifying text claim:', error);
    throw new Error(error.response?.data?.detail || 'Failed to verify claim. Please try again later.');
  }
};

// Function to check if an image is a deepfake
export const checkDeepfake = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_BASE_URL}/api/detect-deepfake/`, formData, {
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

export default {
  verifyVideoUrl,
  verifyTextClaim,
  checkDeepfake,
};