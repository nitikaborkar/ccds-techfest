import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// SVG Stamps defined inline to avoid needing external files
const SvgStampAnimation = ({ result, onComplete }) => {
  const [visible, setVisible] = useState(true);
  
  // Animation variants
  const stampVariants = {
    hidden: { 
      opacity: 0,
      scale: 5,
      rotate: 30
    },
    visible: { 
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { 
        type: "spring",
        duration: 0.5,
        bounce: 0.4
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { 
        duration: 0.3, 
        ease: "easeOut" 
      }
    }
  };
  
  // Set a timeout to hide the stamp after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  // If not visible, don't render anything
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="relative w-full h-full max-w-xl max-h-xl">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={stampVariants}
        >
          {result === 'True' ? (
            // VERIFIED Stamp (Green)
            <motion.svg
              width="300"
              height="150"
              viewBox="0 0 300 150"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, -1, 1, -1, 0],
              }}
              transition={{
                duration: 0.5,
                delay: 0.5,
                ease: "easeInOut",
              }}
              className="drop-shadow-2xl"
            >
              <rect x="10" y="10" width="280" height="130" rx="15" ry="15" fill="none" stroke="#4CAF50" strokeWidth="8" strokeDasharray="15 5" />
              <text x="150" y="90" fontFamily="Impact, sans-serif" fontSize="48" fontWeight="bold" fill="#4CAF50" textAnchor="middle">VERIFIED</text>
            </motion.svg>
          ) : (
            // BUSTED Stamp (Red)
            <motion.svg
              width="300"
              height="150"
              viewBox="0 0 300 150"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, -1, 1, -1, 0],
              }}
              transition={{
                duration: 0.5,
                delay: 0.5,
                ease: "easeInOut",
              }}
              className="drop-shadow-2xl"
            >
              <rect x="10" y="10" width="280" height="130" rx="15" ry="15" fill="none" stroke="#FF5252" strokeWidth="8" strokeDasharray="15 5" />
              <text x="150" y="90" fontFamily="Impact, sans-serif" fontSize="48" fontWeight="bold" fill="#FF5252" textAnchor="middle">BUSTED!</text>
            </motion.svg>
          )}
          
          {/* Optional: Play a sound effect if available */}
          <audio 
            src={`/sounds/stamp-sound.mp3`} 
            autoPlay 
          />
        </motion.div>
      </div>
    </div>
  );
};

export default SvgStampAnimation;