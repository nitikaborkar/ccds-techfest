import React from 'react';
import { motion } from 'framer-motion';
import VerificationStats from './VerificationStats';

const ResultCard = ({ result, onReset }) => {
  const getStatusColor = (consensus) => {
    switch (consensus) {
      case 'True':
        return {
          bg: 'bg-green-500',
          gradient: 'from-green-400 to-green-600',
          text: 'text-green-600 dark:text-green-400',
          border: 'border-green-200 dark:border-green-800'
        };
      case 'False':
        return {
          bg: 'bg-red-500',
          gradient: 'from-red-400 to-red-600',
          text: 'text-red-600 dark:text-red-400',
          border: 'border-red-200 dark:border-red-800'
        };
      case 'Neutral':
        return {
          bg: 'bg-yellow-500',
          gradient: 'from-yellow-400 to-yellow-600',
          text: 'text-yellow-600 dark:text-yellow-400',
          border: 'border-yellow-200 dark:border-yellow-800'
        };
      default:
        return {
          bg: 'bg-gray-500',
          gradient: 'from-gray-400 to-gray-600',
          text: 'text-gray-600 dark:text-gray-400',
          border: 'border-gray-200 dark:border-gray-700'
        };
    }
  };

  const getStatusLabel = (consensus) => {
    switch (consensus) {
      case 'True':
        return 'Verified True';
      case 'False':
        return 'Verified False';
      case 'Neutral':
        return 'Inconclusive';
      default:
        return 'Insufficient Data';
    }
  };

  const getStatusIcon = (consensus) => {
    switch (consensus) {
      case 'True':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'False':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'Neutral':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
    }
  };

  const colorScheme = getStatusColor(result.consensus);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
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

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300 transform"
    >
      <div className="relative">
        <div className={`absolute inset-0 opacity-10 bg-gradient-to-r ${colorScheme.gradient}`}></div>
        <div className="p-6 md:p-8 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <motion.div variants={itemVariants} className="flex items-center">
              <div className={`relative group mr-4`}>
                <div className="absolute -inset-0.5 bg-gradient-to-r opacity-75 rounded-full blur-sm"></div>
                <div className={`relative w-12 h-12 rounded-full ${colorScheme.bg} flex items-center justify-center`}>
                  {getStatusIcon(result.consensus)}
                </div>
              </div>
              <div>
                <h3 className={`text-xl font-bold ${colorScheme.text}`}>
                  {getStatusLabel(result.consensus)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-powered verification result
                </p>
              </div>
            </motion.div>
            
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReset}
              className="flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow transition duration-200 self-start"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Verify Another
            </motion.button>
          </div>
          
          {result.claim && (
            <motion.div 
              variants={itemVariants}
              className={`mb-6 p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border ${colorScheme.border}`}
            >
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Claim Under Verification
              </h4>
              <p className="text-gray-800 dark:text-gray-200 text-lg italic">
                "{result.claim}"
              </p>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="mb-8">
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Evidence & Verification
            </h4>
            <div className="prose prose-indigo dark:prose-invert max-w-none bg-white dark:bg-gray-700/30 rounded-lg p-5 shadow-sm">
              <p className="text-gray-800 dark:text-gray-200">
                {result.evidence || "No evidence available"}
              </p>
            </div>
          </motion.div>

          {result.supporting_count !== undefined && (
            <motion.div variants={itemVariants}>
              <VerificationStats
                supporting={result.supporting_count}
                opposing={result.opposing_count}
                total={result.total_valid_ratings}
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ResultCard;