import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { verifyVideoUrl, verifyTextClaim, checkDeepfake } from '../utils/api';
import ImageUploader from './ImageUploader';

const VerificationForm = ({ setIsLoading, setResult, setError, activeTab, setActiveTab, setIsProcessing, setShowStamp }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [textClaim, setTextClaim] = useState('');
  const [isUrlValid, setIsUrlValid] = useState(true);
  
  const validateUrl = (url) => {
    // Basic URL validation
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
      'i'
    );
    return pattern.test(url);
  };

  const handleVideoUrlChange = (e) => {
    const url = e.target.value;
    setVideoUrl(url);
    setIsUrlValid(url === '' || validateUrl(url));
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    
    if (!videoUrl.trim()) {
      setError("Please enter a video URL");
      return;
    }
    
    if (!validateUrl(videoUrl)) {
      setIsUrlValid(false);
      setError("Please enter a valid URL");
      return;
    }
    
    try {
      setIsLoading(true);
      const data = await verifyVideoUrl(videoUrl);
      
      // Check if we received a job started response
      if (data.jobStarted) {
        // Switch to the processing state for long-running verification
        setIsLoading(false);
        setIsProcessing(true);
      } else {
        // Regular response flow
        setResult(data);
        setIsLoading(false);
      }
    } catch (error) {
      setError(error.message || "An error occurred while verifying the video");
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    
    if (!textClaim.trim()) {
      setError("Please enter a claim to verify");
      return;
    }
    
    try {
      setIsLoading(true);
      // Call the API endpoint
      const data = await verifyTextClaim(textClaim);
      
      // Check if we received a job started response
      if (data.jobStarted) {
        // Switch to the processing state for long-running verification
        setIsLoading(false);
        setIsProcessing(true);
      } else {
        // Regular response flow
        setResult(data);
        setIsLoading(false);
      }
    } catch (error) {
      setError(error.message || "An error occurred while verifying the claim");
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setIsLoading(true);
      const data = await checkDeepfake(file);
      // Format the result to match the expected format
      const formattedResult = {
        consensus: data.is_deepfake ? "False" : "True",
        evidence: data.is_deepfake 
          ? `This image appears to be a deepfake with ${data.confidence}% confidence.` 
          : `This image appears to be authentic with ${data.confidence}% confidence.`,
        claim: "Is this image authentic?"
      };
      setResult(formattedResult);
      setShowStamp(true); // Show the stamp animation
      setIsLoading(false);
    } catch (error) {
      setError(error.message || "An error occurred while analyzing the image");
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const tabVariants = {
    inactive: { opacity: 0.7 },
    active: { 
      opacity: 1,
      scale: 1.05,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden backdrop-blur-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-b from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-t from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="p-6 md:p-8">
          <motion.div variants={itemVariants} className="flex items-center justify-center mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2">
                Claim Verification
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Verify claims from videos, text, or check images for deepfakes
              </p>
            </div>
          </motion.div>
          
          {/* Tabs */}
          <motion.div 
            variants={itemVariants}
            className="rounded-xl bg-gray-100 dark:bg-gray-700/50 p-1 mb-8 backdrop-blur-sm"
          >
            <div className="flex space-x-1">
              <motion.button
                variants={tabVariants}
                animate={activeTab === 'video' ? 'active' : 'inactive'}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-3 text-sm font-medium leading-5 rounded-lg ${
                  activeTab === 'video'
                    ? 'bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'
                } transition-all duration-200`}
                onClick={() => setActiveTab('video')}
              >
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Verify Video
                </div>
              </motion.button>
              
              <motion.button
                variants={tabVariants}
                animate={activeTab === 'text' ? 'active' : 'inactive'}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-3 text-sm font-medium leading-5 rounded-lg ${
                  activeTab === 'text'
                    ? 'bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'
                } transition-all duration-200`}
                onClick={() => setActiveTab('text')}
              >
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Verify Text
                </div>
              </motion.button>
              
              <motion.button
                variants={tabVariants}
                animate={activeTab === 'image' ? 'active' : 'inactive'}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-3 text-sm font-medium leading-5 rounded-lg ${
                  activeTab === 'image'
                    ? 'bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'
                } transition-all duration-200`}
                onClick={() => setActiveTab('image')}
              >
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Deepfake Check
                </div>
              </motion.button>
            </div>
          </motion.div>
          
          {/* Form content based on active tab */}
          <div className="mb-8">
            {activeTab === 'video' && (
              <motion.form 
                onSubmit={handleVideoSubmit}
                variants={itemVariants}
                className="space-y-6"
              >
                <div>
                  <label 
                    htmlFor="videoUrl" 
                    className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Video URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg 
                        className="w-5 h-5 text-gray-500 dark:text-gray-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="videoUrl"
                      value={videoUrl}
                      onChange={handleVideoUrlChange}
                      className={`bg-gray-50 border ${
                        isUrlValid ? 'border-gray-300 dark:border-gray-600' : 'border-red-500'
                      } text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:placeholder-gray-400`}
                      placeholder="https://example.com/video.mp4"
                      required
                    />
                  </div>
                  {!isUrlValid && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      Please enter a valid URL
                    </p>
                  )}
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-3 text-center text-white dark:focus:ring-indigo-800 transition-all duration-200 shadow-lg hover:shadow-indigo-500/50"
                >
                  Verify Claim from Video
                </motion.button>
              </motion.form>
            )}
            
            {activeTab === 'text' && (
              <motion.form 
                onSubmit={handleTextSubmit}
                variants={itemVariants}
                className="space-y-6"
              >
                <div>
                  <label 
                    htmlFor="textClaim" 
                    className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Claim Text
                  </label>
                  <textarea
                    id="textClaim"
                    value={textClaim}
                    onChange={(e) => setTextClaim(e.target.value)}
                    rows="4"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    placeholder="Enter the claim you want to verify..."
                    required
                  ></textarea>
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-3 text-center text-white dark:focus:ring-indigo-800 transition-all duration-200 shadow-lg hover:shadow-indigo-500/50"
                >
                  Verify Text Claim
                </motion.button>
              </motion.form>
            )}
            
            {activeTab === 'image' && (
              <motion.div
                variants={itemVariants}
                className="space-y-6"
              >
                <p className="text-gray-700 dark:text-gray-300">
                  Upload an image to check if it's potentially a deepfake
                </p>
                <ImageUploader onImageUpload={handleImageUpload} />
              </motion.div>
            )}
          </div>
          
          <motion.div
            variants={itemVariants}
            className="pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-3">
                How it works
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium text-gray-800 dark:text-gray-200">AI-powered claim verification</span> - Our system uses advanced NLP to extract and verify claims
                  </span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium text-gray-800 dark:text-gray-200">Deepfake detection</span> - Computer vision models identify manipulated media with high accuracy
                  </span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium text-gray-800 dark:text-gray-200">Evidence-based verification</span> - Results are backed by scientific evidence and reliable sources
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default VerificationForm;