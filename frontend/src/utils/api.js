// api.js - Backend integration utilities
const API_BASE_URL = 'http://localhost:8000'; // Adjust this to your backend URL

/**
 * Verify a claim through video URL
 * @param {string} videoUrl - The URL of the video to analyze
 * @returns {Promise} - Promise with the verification request response
 */
export const verifyVideoUrl = async (videoUrl) => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: videoUrl }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to submit video for verification');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error verifying video:', error);
    throw error;
  }
};

/**
 * Verify a text claim
 * @param {string} claimText - The text claim to verify
 * @returns {Promise} - Promise with the verification request response
 */
export const verifyTextClaim = async (claimText) => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ claim: claimText }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to submit claim for verification');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error verifying claim:', error);
    throw error;
  }
};

/**
 * Check verification status
 * @returns {Promise} - Promise with the verification status
 */
export const checkVerificationStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/verification-status`);
    
    if (response.status === 404) {
      return { message: "No verification has been run yet" };
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to check verification status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking verification status:', error);
    throw error;
  }
};

/**
 * Detect deepfake in an image
 * @param {File} imageFile - The image file to analyze
 * @returns {Promise} - Promise with the deepfake detection results
 */
export const detectDeepfake = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const response = await fetch(`${API_BASE_URL}/api/detect-deepfake/`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to analyze image');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error detecting deepfake:', error);
    throw error;
  }
};

/**
 * Poll for verification status until complete
 * @param {function} onStatusUpdate - Callback for status updates
 * @param {function} onComplete - Callback when verification is complete
 * @param {function} onError - Callback for errors
 * @param {number} interval - Polling interval in ms (default: 2000)
 * @returns {object} - Object with cancel method to stop polling
 */
export const pollVerificationStatus = (onStatusUpdate, onComplete, onError, interval = 2000) => {
  let isCancelled = false;
  
  const poll = async () => {
    if (isCancelled) return;
    
    try {
      const status = await checkVerificationStatus();
      
      // If we have a consensus, the verification is complete
      if (status.consensus) {
        onComplete(status);
        return;
      }
      
      // Otherwise, provide a status update and continue polling
      if (onStatusUpdate) {
        onStatusUpdate(status);
      }
      
      // Continue polling
      setTimeout(poll, interval);
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }
  };
  
  // Start polling
  poll();
  
  // Return object with method to cancel polling
  return {
    cancel: () => {
      isCancelled = true;
    }
  };
};