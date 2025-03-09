import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { verifyVideoUrl, verifyTextClaim, detectDeepfake, checkVerificationStatus } from '../utils/api';
import './VerificationForm.css';

const VerificationForm = ({ theme, onSubmit }) => {
  const [activeTab, setActiveTab] = useState('video');
  const [videoUrl, setVideoUrl] = useState('');
  const [textClaim, setTextClaim] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [pollingProgress, setPollingProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState(null);
  const pollingIntervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const MAX_POLLING_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds
  const POLLING_INTERVAL = 5000; // 5 seconds

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const startPolling = () => {
    setIsPolling(true);
    setPollingProgress(0);
    
    const startTime = Date.now();
    
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        // Check status from the backend
        const response = await checkVerificationStatus();
        
        // Calculate how far along we are in the maximum polling time
        const elapsedTime = Date.now() - startTime;
        const progressPercentage = Math.min((elapsedTime / MAX_POLLING_TIME) * 100, 99);
        setPollingProgress(progressPercentage);
        
        // If we have a result with consensus, polling is complete
        if (response && response.consensus) {
          clearInterval(pollingIntervalRef.current);
          setIsPolling(false);
          setIsSubmitting(false);
          setPollingProgress(100);
          setVerificationResult(response);
          setIsSuccess(true);
          
          // Call the parent's onSubmit if provided
          if (onSubmit) {
            const formData = {
              type: activeTab,
              content: activeTab === 'video' ? videoUrl : 
                      activeTab === 'text' ? textClaim : 
                      selectedImage
            };
            onSubmit(formData, response);
          }
        }
        
        // If we've reached the maximum polling time, stop polling
        if (elapsedTime >= MAX_POLLING_TIME) {
          clearInterval(pollingIntervalRef.current);
          setIsPolling(false);
          setIsSubmitting(false);
          setErrorMessage('Verification is taking longer than expected. Please check back later.');
        }
      } catch (error) {
        console.error('Error while polling:', error);
        // Don't stop polling on individual errors - the process might still be running
      }
    }, POLLING_INTERVAL);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setVerificationResult(null);
    
    try {
      let response;
      
      // Handle different verification methods
      if (activeTab === 'video') {
        response = await verifyVideoUrl(videoUrl);
      } else if (activeTab === 'text') {
        response = await verifyTextClaim(textClaim);
      } else if (activeTab === 'image' && selectedImage) {
        // For image verification (deepfake detection), we get an immediate response
        response = await detectDeepfake(selectedImage);
        
        // Handle immediate response for deepfake detection
        setIsSubmitting(false);
        setIsSuccess(true);
        setVerificationResult(response);
        setTimeout(() => setIsSuccess(false), 3000);
        
        // Call parent's onSubmit if provided
        if (onSubmit) {
          const formData = { type: 'image', content: selectedImage };
          onSubmit(formData, response);
        }
        
        return; // Don't start polling for image verification
      } else {
        throw new Error('Please select an image to analyze');
      }
      
      // Start polling for video and text verification results
      startPolling();
      
    } catch (error) {
      console.error('Submission error:', error);
      setErrorMessage(error.message || 'An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedImage(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4 }
    }
  };

  const tabVariants = {
    inactive: { opacity: 0.7 },
    active: { 
      opacity: 1, 
      scale: 1.03,
      transition: { duration: 0.2 } 
    }
  };

  const handleImageContainerClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="verification-form-wrapper">
      <div className="form-header">
        <h2>Verify Claims</h2>
        <p>Choose a verification method</p>
      </div>
      
      <div className="tabs">
        <motion.button
          variants={tabVariants}
          animate={activeTab === 'video' ? 'active' : 'inactive'}
          onClick={() => setActiveTab('video')}
          className={`tab ${activeTab === 'video' ? 'active' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <span>Video</span>
        </motion.button>
        
        <motion.button
          variants={tabVariants}
          animate={activeTab === 'text' ? 'active' : 'inactive'}
          onClick={() => setActiveTab('text')}
          className={`tab ${activeTab === 'text' ? 'active' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <span>Text</span>
        </motion.button>
        
        <motion.button
          variants={tabVariants}
          animate={activeTab === 'image' ? 'active' : 'inactive'}
          onClick={() => setActiveTab('image')}
          className={`tab ${activeTab === 'image' ? 'active' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <span>Image</span>
        </motion.button>
      </div>
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      
      <motion.div
        key={activeTab}
        initial="hidden"
        animate="visible"
        variants={formVariants}
        className="form-container"
      >
        {activeTab === 'video' && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="videoUrl">Video URL</label>
              <input
                type="url"
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste video URL here"
                required
              />
              <p className="input-help">We'll analyze the content for claims</p>
            </div>
            
            <div className="form-footer">
              <button 
                type="submit" 
                className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting || isPolling}
              >
                {isSubmitting || isPolling ? 'Processing...' : 'Verify Video'}
              </button>
              
              {isPolling && (
                <div className="polling-status">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pollingProgress}%` }}></div>
                  </div>
                  <p>Analyzing content... This may take up to 10 minutes</p>
                </div>
              )}
              
              {isSuccess && (
                <div className="success-message">
                  Verification complete!
                </div>
              )}
            </div>
          </form>
        )}
        
        {activeTab === 'text' && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="textClaim">Claim Text</label>
              <textarea
                id="textClaim"
                value={textClaim}
                onChange={(e) => setTextClaim(e.target.value)}
                placeholder="Enter the claim to verify..."
                rows="4"
                required
              ></textarea>
              <p className="input-help">Example: "Drinking lemon water boosts metabolism"</p>
            </div>
            
            <div className="form-footer">
              <button 
                type="submit" 
                className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting || isPolling}
              >
                {isSubmitting || isPolling ? 'Processing...' : 'Verify Claim'}
              </button>
              
              {isPolling && (
                <div className="polling-status">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pollingProgress}%` }}></div>
                  </div>
                  <p>Analyzing claim... This may take up to 10 minutes</p>
                </div>
              )}
              
              {isSuccess && (
                <div className="success-message">
                  Verification complete!
                </div>
              )}
            </div>
          </form>
        )}
        
        {activeTab === 'image' && (
          <form onSubmit={handleSubmit}>
            <div className="form-group image-upload">
              <label htmlFor="imageUpload">Upload Image</label>
              <div 
                className="file-upload-container"
                onClick={handleImageContainerClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  className="file-input"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                {selectedImage ? (
                  <div className="selected-image-preview">
                    <img 
                      src={URL.createObjectURL(selectedImage)} 
                      alt="Selected" 
                      className="preview-image"
                    />
                    <p>{selectedImage.name}</p>
                  </div>
                ) : (
                  <>
                    <div className="file-upload-button">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                      <span>Select Image</span>
                    </div>
                    <p className="file-upload-hint">Drag & drop or click to browse</p>
                  </>
                )}
              </div>
            </div>
            
            <div className="form-footer">
              <button 
                type="submit" 
                className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting || !selectedImage}
              >
                {isSubmitting ? 'Processing...' : 'Check Image'}
              </button>
              
              {isSuccess && verificationResult && (
                <div className="success-message">
                  {verificationResult.is_deepfake ? 
                    `Deepfake detected (${verificationResult.confidence}% confidence)` : 
                    `Authentic image (${verificationResult.confidence}% confidence)`}
                </div>
              )}
            </div>
          </form>
        )}
      </motion.div>
      
      {/* Display verification results if available */}
      {verificationResult && (activeTab === 'video' || activeTab === 'text') && (
        <div className="verification-results">
          <h3>Verification Results</h3>
          <div className="result-card">
            <div className={`consensus-badge ${verificationResult.consensus?.toLowerCase()}`}>
              {verificationResult.consensus === "True" ? "Verified" : 
               verificationResult.consensus === "False" ? "Debunked" : 
               "Inconclusive"}
            </div>
            <p className="evidence">{verificationResult.evidence}</p>
          </div>
        </div>
      )}
      
      <div className="form-help">
        <p>Need help? <a href="#contact">Contact us</a></p>
      </div>
    </div>
  );
};

export default VerificationForm;