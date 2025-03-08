import React from 'react';
import { motion } from 'framer-motion';

const VerificationStats = ({ supporting, opposing, total }) => {
  // Calculate percentages
  const supportingPercentage = Math.round((supporting / total) * 100) || 0;
  const opposingPercentage = Math.round((opposing / total) * 100) || 0;
  
  // Animation variants
  const barVariants = {
    initial: { width: 0 },
    animate: percentage => ({ 
      width: `${percentage}%`,
      transition: { duration: 1, ease: "easeOut" }
    })
  };
  
  const countVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
      <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">
        Verification Statistics
      </h4>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Supporting Evidence */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Supporting Evidence
            </span>
            <motion.span 
              className="text-sm font-semibold text-gray-800 dark:text-gray-200"
              variants={countVariants}
              initial="initial"
              animate="animate"
            >
              {supporting} sources ({supportingPercentage}%)
            </motion.span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden">
            <motion.div 
              className="bg-green-500 h-2.5 rounded-full"
              custom={supportingPercentage}
              variants={barVariants}
              initial="initial"
              animate="animate"
            ></motion.div>
          </div>
        </div>
        
        {/* Opposing Evidence */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Opposing Evidence
            </span>
            <motion.span 
              className="text-sm font-semibold text-gray-800 dark:text-gray-200"
              variants={countVariants}
              initial="initial"
              animate="animate"
            >
              {opposing} sources ({opposingPercentage}%)
            </motion.span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden">
            <motion.div 
              className="bg-red-500 h-2.5 rounded-full"
              custom={opposingPercentage}
              variants={barVariants}
              initial="initial"
              animate="animate"
            ></motion.div>
          </div>
        </div>
        
        {/* Total Stats */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-600 mt-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Verified Sources
            </span>
            <motion.span 
              className="text-sm font-semibold text-gray-800 dark:text-gray-200"
              variants={countVariants}
              initial="initial"
              animate="animate"
            >
              {total}
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationStats;