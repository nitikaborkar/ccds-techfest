import React from 'react';
import { motion } from 'framer-motion';

const LoadingIndicator = () => {
  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const pulseVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };
  
  const ringVariants = {
    animate: {
      scale: [0.8, 1, 0.8],
      opacity: [0.3, 0.5, 0.3],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
  
  const dotVariants = {
    initial: { y: 0 },
    animate: index => ({
      y: [0, -10, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        delay: index * 0.2,
        ease: "easeInOut"
      }
    })
  };

  return (
    <motion.div 
      className="flex flex-col items-center"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="relative w-24 h-24 mb-8">
        {/* Outer animated rings */}
        <motion.div 
          className="absolute inset-0 rounded-full border-2 border-indigo-500 opacity-30"
          variants={ringVariants}
          animate="animate"
        ></motion.div>
        
        <motion.div 
          className="absolute inset-2 rounded-full border-2 border-indigo-400 opacity-30"
          variants={ringVariants}
          animate="animate"
          style={{ animationDelay: "0.3s" }}
        ></motion.div>
        
        <motion.div 
          className="absolute inset-4 rounded-full border-2 border-indigo-300 opacity-30"
          variants={ringVariants}
          animate="animate"
          style={{ animationDelay: "0.6s" }}
        ></motion.div>
        
        {/* Central pulse circle */}
        <motion.div 
          className="absolute inset-0 w-full h-full flex items-center justify-center"
          variants={pulseVariants}
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-75"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/50">
              <svg className="w-8 h-8 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        className="text-center space-y-3"
        variants={pulseVariants}
      >
        <h3 className="text-xl font-bold text-gray-800 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
          Verifying Claim
        </h3>
        
        <div className="flex items-center justify-center space-x-2">
          {[0, 1, 2].map(index => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full"
              custom={index}
              variants={dotVariants}
              animate="animate"
            />
          ))}
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm max-w-xs">
          Our AI is analyzing the claim and gathering evidence from reliable sources
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LoadingIndicator;