import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import VerificationForm from './components/VerificationForm';
import ResultCard from './components/ResultCard';
import LoadingIndicator from './components/LoadingIndicator';
import ProgressIndicator from './components/ProgressIndicator';
import SvgStampAnimation from './components/SvgStampAnimation';
import './index.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // For long-running processes
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('video');
  const [error, setError] = useState(null);
  const [showStamp, setShowStamp] = useState(false);

  // Track theme changes for background animation
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkNow = document.documentElement.classList.contains('dark');
          setTheme(isDarkNow ? 'dark' : 'light');
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const handleReset = () => {
    setResult(null);
    setError(null);
    setShowStamp(false);
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Dynamic background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div 
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 120, 
            ease: "linear", 
            repeat: Infinity,
            repeatType: "loop"
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-100/40 via-transparent to-transparent dark:from-indigo-900/20 blur-3xl"
        />
        <motion.div 
          animate={{ 
            rotate: [0, -360],
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 100, 
            ease: "linear", 
            repeat: Infinity,
            repeatType: "loop"
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-100/40 via-transparent to-transparent dark:from-purple-900/20 blur-3xl"
        />
      </div>

      <Header />
      
      <motion.main 
        className="container mx-auto px-4 py-8 max-w-4xl relative z-10"
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        <AnimatePresence mode="wait">
          {/* Show the stamp animation when needed */}
          {showStamp && result && (result.consensus === 'True' || result.consensus === 'False') && (
            <SvgStampAnimation 
              result={result.consensus} 
              onComplete={() => setShowStamp(false)} 
            />
          )}
          
          {error && (
            <motion.div 
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-md dark:bg-red-900/30 dark:text-red-300"
              role="alert"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium">Error</p>
                  <p className="mt-1">{error}</p>
                  <button 
                    onClick={() => setError(null)}
                    className="mt-2 text-sm text-red-700 dark:text-red-300 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!isLoading && !result && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <VerificationForm 
                setIsLoading={setIsLoading}
                setIsProcessing={setIsProcessing}
                setResult={setResult} 
                setError={setError}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setShowStamp={setShowStamp}
              />
            </motion.div>
          )}

          {isLoading && !isProcessing && (
            <motion.div 
              key="loading"
              className="flex flex-col items-center justify-center mt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LoadingIndicator />
            </motion.div>
          )}
          
          {isProcessing && (
            <motion.div 
              key="processing"
              className="flex flex-col items-center justify-center mt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProgressIndicator 
                onComplete={(data) => {
                  setResult(data);
                  setIsProcessing(false);
                  // Show stamp animation when verification is complete
                  setShowStamp(true);
                }}
                onError={(errorMsg) => {
                  setError(errorMsg);
                  setIsProcessing(false);
                }}
              />
            </motion.div>
          )}

          {result && (
            <motion.div 
              key="result"
              className="mt-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ResultCard result={result} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
      
      <footer className="relative z-10 text-center py-8 text-gray-600 dark:text-gray-400 mt-auto">
        <div className="container mx-auto px-4">
          <p>© 2025 VerifyAI • Combating misinformation with AI</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">Powered by advanced machine learning algorithms</p>
        </div>
      </footer>
    </div>
  );
}

export default App;