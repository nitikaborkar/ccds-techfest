import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { verifyVideoUrl, verifyTextClaim, detectDeepfake, checkVerificationStatus } from '../utils/api';
import SvgStampAnimation from './SvgStampAnimation';
import './VerificationForm.css';

const VerificationForm = ({ theme, onSubmit, onClose }) => {
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
  const [showResultPage, setShowResultPage] = useState(false);
  const [submittedContent, setSubmittedContent] = useState(null);
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
          
          // Show the result page
          setShowResultPage(true);
          
          // Call the parent's onSubmit if provided
          if (onSubmit) {
            const formData = {
              type: activeTab,
              content: activeTab === 'video' ? videoUrl : 
                      activeTab === 'text' ? textClaim : 
                      selectedImage
            };
            setSubmittedContent(formData);
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
      let formData;
      
      // Store the submitted content for display on the result page
      if (activeTab === 'video') {
        formData = { type: 'video', content: videoUrl };
        response = await verifyVideoUrl(videoUrl);
      } else if (activeTab === 'text') {
        formData = { type: 'text', content: textClaim };
        response = await verifyTextClaim(textClaim);
      } else if (activeTab === 'image' && selectedImage) {
        formData = { type: 'image', content: selectedImage };
        // For image verification (deepfake detection), we get an immediate response
        response = await detectDeepfake(selectedImage);
        
        // Handle immediate response for deepfake detection
        setIsSubmitting(false);
        setIsSuccess(true);
        setVerificationResult(response);
        setSubmittedContent(formData);
        setShowResultPage(true);
        
        // Call parent's onSubmit if provided
        if (onSubmit) {
          onSubmit(formData, response);
        }
        
        return; // Don't start polling for image verification
      } else {
        throw new Error('Please select an image to analyze');
      }
      
      setSubmittedContent(formData);
      
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

  const handleBackToForm = () => {
    setShowResultPage(false);
    setVerificationResult(null);
    setIsSuccess(false);
  };

  const handleStampAnimationComplete = () => {
    // You can add additional logic here if needed after the stamp animation completes
    console.log("Stamp animation completed");
  };

  // Render the result page
  if (showResultPage && verificationResult) {
    const isDeepfakeResult = activeTab === 'image';
    const consensusResult = isDeepfakeResult 
      ? (verificationResult.is_deepfake ? 'False' : 'True') 
      : verificationResult.consensus;

    return (
      <div className="verification-result-page">
        <div className="result-header">
          {/* <button onClick={handleBackToForm} className="back-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button> */}
          <h2>Verification Results</h2>
        </div>
        
        {/* Display the submitted content */}
        <div className="submitted-content">
          <h3>Submitted {submittedContent?.type}</h3>
          {submittedContent?.type === 'video' && (
            <div className="content-preview">
              <p className="content-url">{submittedContent.content}</p>
            </div>
          )}
          {submittedContent?.type === 'text' && (
            <div className="content-preview">
              <p className="content-text">"{submittedContent.content}"</p>
            </div>
          )}
          {submittedContent?.type === 'image' && submittedContent.content && (
            <div className="content-preview">
              <img 
                src={URL.createObjectURL(submittedContent.content)} 
                alt="Verified content" 
                className="content-image"
              />
            </div>
          )}
        </div>
        
        {/* Stamp Animation */}
        <SvgStampAnimation 
          result={consensusResult} 
          onComplete={handleStampAnimationComplete} 
        />
        
        {/* Result Card */}
        <div className="result-card-large">
          <div className={`consensus-badge-large ${consensusResult?.toLowerCase()}`}>
            {consensusResult === "True" ? "Verified" : 
             consensusResult === "False" ? "Debunked" : 
             "Inconclusive"}
          </div>
          
          {isDeepfakeResult ? (
            <div className="result-details">
              <h4>Analysis Results:</h4>
              <p className="confidence">
                {verificationResult.is_deepfake ? 
                  `Deepfake detected with ${verificationResult.confidence}% confidence` : 
                  `Authentic image with ${verificationResult.confidence}% confidence`}
              </p>
            </div>
          ) : (
            <div className="result-details">
              <h4>Evidence:</h4>
              <p className="evidence">{verificationResult.evidence}</p>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="result-actions">
        <button onClick={handleBackToForm} className="back-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Try Another
          </button>
          {/* <button className="action-button share">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 19C21 20.6569 19.6569 22 18 22C16.3431 22 15 20.6569 15 19C15 17.3431 16.3431 16 18 16C19.6569 16 21 17.3431 21 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Share Result
          </button>
          <button className="action-button download">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 16L4 17C4 18.6569 5.34315 20 7 20L17 20C18.6569 20 20 18.6569 20 17L20 16M16 12L12 16M12 16L8 12M12 16L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download Report
          </button> */}
        </div>
      </div>
    );
  }

  // Render the form page (original form)
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
                  <p>Hang In there... Scanning the Truth for you</p>
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
            </div>
          </form>
        )}
      </motion.div>
      
      <div className="form-help">
        <p>Need help? <a href="#contact">Contact us</a></p>
      </div>
    </div>
  );
};

export default VerificationForm;