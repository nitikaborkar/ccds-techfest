import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Import stamp images (we'll need to save these to your public folder)
// You'll need to download the images you shared and place them in your public/images folder
const verifiedStamp = '/images/verified-stamp.png';
const bustedStamp = '/images/busted-stamp.png';

const StampAnimation = ({ result, onComplete }) => {
  const [visible, setVisible] = useState(true);
  
  // Determine which stamp to use based on the result
  const stampImage = result === 'True' ? verifiedStamp : bustedStamp;
  
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
          <motion.img
            src={stampImage}
            alt={result === 'True' ? 'Verified' : 'Busted'}
            className="w-64 h-auto drop-shadow-2xl"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, -1, 1, -1, 0],
            }}
            transition={{
              duration: 0.5,
              delay: 0.5,
              ease: "easeInOut",
            }}
          />
          
          {/* Sound effect */}
          <audio 
            src={`/sounds/stamp-sound.mp3`} 
            autoPlay 
          />
        </motion.div>
      </div>
    </div>
  );
};

export default StampAnimation;