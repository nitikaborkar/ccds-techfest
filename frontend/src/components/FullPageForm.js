import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VerificationForm from './VerificationForm';
import LoadingIndicator from './LoadingIndicator';
import ResultCard from './ResultCard';
import GradientBackground from './GradientBackground';
import './FullPageForm.css';

const FullPageForm = ({ theme, onClose }) => {
  const [formState, setFormState] = useState('form'); // 'form', 'loading', 'result'
  const [resultData, setResultData] = useState(null);
  
  // Define animation variants
  const pageVariants = {
    initial: {
      opacity: 0,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for smooth animation
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const contentVariants = {
    initial: { 
      opacity: 0, 
      y: 40 
    },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: { 
      opacity: 0, 
      y: -40,
      transition: {
        duration: 0.3
      }
    }
  };

  const handleFormSubmit = (formData) => {
    // When form is submitted, show loading state
    setFormState('loading');
    
    // Simulate API call - would be replaced with real API call in production
    setTimeout(() => {
      // Mock result data
      const mockResult = {
        claim: formData.type === 'text' ? formData.content : "This is a sample claim extracted from the content",
        consensus: ['True', 'False', 'Neutral'][Math.floor(Math.random() * 3)],
        evidence: "Based on our analysis of multiple reputable sources, we've found evidence that supports/disputes this claim...",
        supporting_count: Math.floor(Math.random() * 30) + 10,
        opposing_count: Math.floor(Math.random() * 20) + 5,
        total_valid_ratings: Math.floor(Math.random() * 50) + 30
      };
      
      setResultData(mockResult);
      setFormState('result');
    }, 3000);
  };

  const handleReset = () => {
    setFormState('form');
    setResultData(null);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="full-page-form"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        key="full-page-form"
      >
        <GradientBackground theme={theme} />
        
        <div className="form-page-header">
          <motion.button 
            onClick={onClose}
            className="back-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Home</span>
          </motion.button>
          
          <motion.div 
            className="logo"
            whileHover={{ scale: 1.05 }}
          >
            <span className="logo-text">VerifyAI</span>
          </motion.div>
        </div>
        
        <AnimatePresence mode="wait">
          {formState === 'form' && (
            <motion.div 
              className="full-page-form-content" 
              key="form"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={contentVariants}
            >
              <div className="form-heading">
                <h1>Start Verifying Claims</h1>
                <p>Choose your preferred verification method below</p>
              </div>
              
              <div className="form-wrapper">
                <VerificationForm theme={theme} onSubmit={handleFormSubmit} />
              </div>
            </motion.div>
          )}

          {formState === 'loading' && (
            <motion.div 
              className="full-page-form-content" 
              key="loading"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={contentVariants}
            >
              <div className="loading-container">
                <LoadingIndicator />
              </div>
            </motion.div>
          )}

          {formState === 'result' && resultData && (
            <motion.div 
              className="full-page-form-content" 
              key="result"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={contentVariants}
            >
              <div className="result-container">
                <ResultCard result={resultData} onReset={handleReset} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default FullPageForm;