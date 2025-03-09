import React, { useEffect } from 'react';
import './GradientBackground.css';

const GradientBackground = ({ theme }) => {
  useEffect(() => {
    const handleMove = (e) => {
      // Track mouse or touch movement for dynamic gradient adjustment
      const x = e.pageX || (e.touches && e.touches[0].clientX) || window.innerWidth / 2;
      const y = e.pageY || (e.touches && e.touches[0].clientY) || window.innerHeight / 2;
      
      // Adjust gradient variables based on cursor position
      document.documentElement.style.setProperty('--x-position', `${(x / window.innerWidth) * 100}%`);
      document.documentElement.style.setProperty('--y-position', `${(y / window.innerHeight) * 100}%`);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, []);

  return (
    <div className={`gradient-background ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      <div className="gradient-overlay"></div>
    </div>
  );
};

export default GradientBackground;