import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { checkVerificationStatus } from '../utils/api';

const ProgressIndicator = ({ onComplete, onError }) => {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Starting verification process...');
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // This estimates a completion percentage based on time elapsed
  // Since we don't know the actual progress, this is just a visual estimate
  useEffect(() => {
    // We'll cap visual progress at 95% until we get actual completion
    const maxVisualProgress = 95;
    
    // Setup timer for elapsed time
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    // Assuming 10 minutes (600 seconds) max time, update the visual progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < maxVisualProgress) {
          // Exponentially slow down progress as it approaches maxVisualProgress
          const increment = (maxVisualProgress - prev) / 20;
          return prev + increment;
        }
        return prev;
      });
    }, 3000);
    
    // Poll for status
    const statusCheckInterval = setInterval(async () => {
      try {
        const status = await checkVerificationStatus();
        
        // If we got a consensus response, verification is complete
        if (status.consensus) {
          clearInterval(timer);
          clearInterval(progressInterval);
          clearInterval(statusCheckInterval);
          setProgress(100);
          onComplete(status);
        }
        
        // Update the status message based on backend response
        if (status.message && !status.message.includes("No verification")) {
          setStatusMessage(status.message);
        }
      } catch (error) {
        console.error('Error checking status:', error);
        // Don't stop polling on error, just continue
      }
    }, 10000);  // Check every 10 seconds
    
    // Cleanup intervals
    return () => {
      clearInterval(timer);
      clearInterval(progressInterval);
      clearInterval(statusCheckInterval);
    };
  }, [onComplete, onError]);
  
  // Format elapsed time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };
  
  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="flex flex-col items-center max-w-2xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        variants={childVariants}
        className="relative w-20 h-20 mb-6"
      >
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            className="text-gray-200 dark:text-gray-700"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
            r="42"
            cx="50"
            cy="50"
          />
          <circle
            className="text-indigo-600 dark:text-indigo-400"
            strokeWidth="10"
            strokeDasharray={264}
            strokeDashoffset={264 - (progress / 100) * 264}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="42"
            cx="50"
            cy="50"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-semibold text-gray-800 dark:text-white">{Math.round(progress)}%</span>
        </div>
      </motion.div>
      
      <motion.h3 
        variants={childVariants}
        className="text-xl font-bold text-gray-800 dark:text-white mb-2"
      >
        Verifying Your Claim
      </motion.h3>
      
      <motion.p 
        variants={childVariants}
        className="text-gray-600 dark:text-gray-300 text-center mb-4"
      >
        {statusMessage}
      </motion.p>
      
      <motion.div 
        variants={childVariants}
        className="text-sm text-gray-500 dark:text-gray-400 mb-6"
      >
        Time elapsed: {formatTime(elapsedTime)}
      </motion.div>
      
      <motion.div 
        variants={childVariants}
        className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 max-w-md text-center"
      >
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          <span className="font-medium">This process may take up to 10 minutes.</span> Our AI is analyzing the claim, gathering evidence, and consulting reliable sources to ensure accurate verification.
        </p>
        <div className="mt-3 flex justify-center space-x-2">
          {[1, 2, 3, 4].map((step) => (
            <div 
              key={step} 
              className={`w-2 h-2 rounded-full ${
                elapsedTime > step * 60 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            ></div>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {elapsedTime < 60 && "Analyzing claim content..."}
          {elapsedTime >= 60 && elapsedTime < 120 && "Searching for relevant evidence..."}
          {elapsedTime >= 120 && elapsedTime < 300 && "Evaluating sources and verifying information..."}
          {elapsedTime >= 300 && elapsedTime < 600 && "Generating final verification report..."}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ProgressIndicator;