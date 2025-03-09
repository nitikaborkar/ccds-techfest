import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VerificationForm from './VerificationForm';
import SvgStampAnimation from './SvgStampAnimation';
import { getRandomMyth } from '../utils/api';
import './EnlightenMe.css';

const EnlightenMe = ({ theme, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [randomMyth, setRandomMyth] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [brainFacts, setBrainFacts] = useState([]);

  // Brain facts array
  useEffect(() => {
    setBrainFacts([
      {
        title: "Your brain uses 20% of your energy",
        text: "Despite being only 2% of your body weight, your brain consumes 20% of your body's energy and oxygen."
      },
      {
        title: "Brain weighs about 3 pounds",
        text: "The average adult human brain weighs about 3 pounds (1.4 kg) and contains approximately 86 billion neurons."
      },
      {
        title: "Neurons communicate at 150 mph",
        text: "Information travels along different neurons at different speeds, but some signals can travel as fast as 150 miles per hour."
      },
      {
        title: "Your brain can't feel pain",
        text: "While your brain processes pain signals from around your body, the brain tissue itself has no pain receptors."
      }
    ]);
  }, []);

  // Fetch a random medical myth when the component loads
  useEffect(() => {
    const fetchRandomMyth = async () => {
      try {
        const myth = await getRandomMyth();
        setRandomMyth(myth);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching random myth:', error);
        setRandomMyth('You only use 10% of your brain. If this were true, brain injuries would be 90% less concerning! We actually use all parts of our brain, just not all simultaneously.');
        setIsLoading(false);
      }
    };

    fetchRandomMyth();
  }, []);

  // Handle verification form submission
  const handleVerificationSubmit = (formData, result) => {
    setVerificationResult({ formData, result });
    setCurrentStep(3); // Jump to results step
  };

  // Reset verification to start again
  const resetVerification = () => {
    setCurrentStep(2);
  };

  // Handle stamp animation completion
  const handleStampAnimationComplete = () => {
    setHasAnimated(true);
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

  const contentVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        delay: 0.2
      } 
    },
    exit: { 
      opacity: 0,
      y: -50,
      transition: { duration: 0.3 } 
    }
  };

  // Helper function to render progress dots
  const renderProgressDots = () => {
    return (
      <div className="progress-dots">
        {[0, 1, 2, 3].map((step) => (
          <button 
            key={step}
            className={`progress-dot ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
            onClick={() => {
              // Only allow going to steps that are available
              if (step < 3 || verificationResult) {
                setCurrentStep(step);
              }
            }}
            disabled={step === 3 && !verificationResult}
          />
        ))}
      </div>
    );
  };

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div 
            className="enlighten-step intro-step"
            key="step-0"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="step-heading">
              <div className="step-number">1</div>
              <h2>The Dose of Truth</h2>
            </div>
            
            <div className="brain-myth-showcase">
              <div className="brain-visual">
                <div className="brain-container">
                  <svg viewBox="0 0 100 100" className="brain-svg">
                    <path className="brain-path" d="M70,50 C70,40 60,30 50,30 C40,30 30,40 30,50 C30,60 40,70 50,70 C60,70 70,60 70,50 Z" />
                    <path className="brain-highlight" d="M50,35 C55,35 60,40 60,50 C60,60 55,65 50,65" />
                    <circle className="active-area" cx="50" cy="50" r="8" />
                    <circle className="active-area" cx="60" cy="45" r="5" />
                    <circle className="active-area" cx="40" cy="45" r="6" />
                    <circle className="active-area" cx="45" cy="60" r="7" />
                  </svg>
                  <div className="brain-percentage">100%</div>
                </div>
              </div>
              
              <div className="myth-explanation">
                {isLoading ? (
                  <div className="myth-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading medical myth...</p>
                  </div>
                ) : (
                  <>
                    <div className="myth-card">
                      <h3>The Myth</h3>
                      {randomMyth.includes('MYTH:') ? (
                        <p>"{randomMyth.split('MYTH:')[1].split('\n\nFACT:')[0].trim()}"</p>
                      ) : (
                        <p>"{randomMyth.split('\n')[0]}"</p>
                      )}
                    </div>
                    
                    <div className="fact-card">
                      <h3>The Reality</h3>
                      {randomMyth.includes('FACT:') ? (
                        <p>{randomMyth.split('FACT:')[1].split('\n\nSOURCE:')[0].trim()}</p>
                      ) : (
                        <p>{randomMyth.split('\n').slice(1).join(' ')}</p>
                      )}
                      <div className="source">
                        Source: {randomMyth.includes('SOURCE:') ? 
                          randomMyth.split('SOURCE:')[1].trim() : 
                          'Medical Research'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="step-actions">
              <button className="next-button" onClick={() => setCurrentStep(1)}>
                Learn More <span className="arrow">→</span>
              </button>
            </div>
          </motion.div>
        );
        
      case 1:
        return (
          <motion.div 
            className="enlighten-step facts-step"
            key="step-1"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="step-heading">
              <div className="step-number">2</div>
              <h2>Fascinating Brain Facts</h2>
            </div>
            
            <div className="brain-facts-grid">
              {brainFacts.map((fact, index) => (
                <motion.div 
                  className="brain-fact-card"
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: 0.1 * index } 
                  }}
                >
                  <h3>{fact.title}</h3>
                  <p>{fact.text}</p>
                </motion.div>
              ))}
            </div>
            
            <div className="more-myths">
              <h3>Common Medical Myths</h3>
              <div className="myths-carousel">
                <div className="myth-slide">
                  <h4>Vaccines cause autism</h4>
                  <p>This myth originated from a debunked study. Extensive research has found no link between vaccines and autism.</p>
                </div>
                <div className="myth-slide">
                  <h4>We only use 10% of our brain</h4>
                  <p>We use our entire brain, though different parts are active at different times depending on the task.</p>
                </div>
                <div className="myth-slide">
                  <h4>Vitamin C prevents colds</h4>
                  <p>While vitamin C is important for immune function, research doesn't support that it prevents colds.</p>
                </div>
              </div>
            </div>
            
            <div className="step-actions dual-actions">
              <button className="back-button" onClick={() => setCurrentStep(0)}>
                <span className="arrow">←</span> Back
              </button>
              <button className="next-button" onClick={onClose}>
                Verify a Claim <span className="arrow">→</span>
              </button>
            </div>
          </motion.div>
        );
        
      case 2:
        return (
          <motion.div 
            className="enlighten-step verify-step"
            key="step-2"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="step-heading">
              <div className="step-number">3</div>
              <h2>Verify a Medical Claim</h2>
            </div>
            
            <div className="verification-container">
              <p className="verification-intro">
                Ready to test a medical claim? Enter a claim from social media, news, or anywhere else you've encountered health information you're unsure about.
              </p>
              
              <div className="verification-form-wrapper">
                <VerificationForm 
                  theme={theme} 
                  onSubmit={handleVerificationSubmit}
                />
              </div>
            </div>
            
            <div className="step-actions dual-actions">
              <button className="back-button" onClick={() => setCurrentStep(1)}>
                <span className="arrow">←</span> Back
              </button>
            </div>
          </motion.div>
        );
        
      case 3:
        return (
          <motion.div 
            className="enlighten-step results-step"
            key="step-3"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="step-heading">
              <div className="step-number">4</div>
              <h2>Verification Results</h2>
            </div>
            
            {verificationResult && (
              <div className="results-container">
                {/* Submitted content display */}
                <div className="submitted-content">
                  <h3>You asked about:</h3>
                  {verificationResult.formData.type === 'video' && (
                    <div className="content-preview">
                      <div className="content-label">Video URL</div>
                      <p className="content-url">{verificationResult.formData.content}</p>
                    </div>
                  )}
                  
                  {verificationResult.formData.type === 'text' && (
                    <div className="content-preview">
                      <div className="content-label">Claim</div>
                      <p className="content-text">"{verificationResult.formData.content}"</p>
                    </div>
                  )}
                  
                  {verificationResult.formData.type === 'image' && verificationResult.formData.content && (
                    <div className="content-preview">
                      <div className="content-label">Image</div>
                      <div className="content-image-container">
                        <img 
                          src={URL.createObjectURL(verificationResult.formData.content)} 
                          alt="Submitted content" 
                          className="content-image"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Stamp Animation */}
                {!hasAnimated && (
                  <SvgStampAnimation 
                    result={verificationResult.formData.type === 'image' 
                      ? (verificationResult.result.is_deepfake ? 'False' : 'True') 
                      : verificationResult.result.consensus} 
                    onComplete={handleStampAnimationComplete} 
                  />
                )}
                
                {/* Result Card */}
                <div className="result-card">
                  <div className={`result-badge ${
                    verificationResult.formData.type === 'image'
                      ? (verificationResult.result.is_deepfake ? 'false' : 'true')
                      : verificationResult.result.consensus?.toLowerCase()
                  }`}>
                    {verificationResult.formData.type === 'image'
                      ? (verificationResult.result.is_deepfake ? "Deepfake Detected" : "Authentic Image")
                      : (verificationResult.result.consensus === "True" ? "Verified" : 
                         verificationResult.result.consensus === "False" ? "Debunked" : 
                         "Inconclusive")
                    }
                  </div>
                  
                  {verificationResult.formData.type === 'image' ? (
                    <div className="result-details">
                      <h4>Analysis Results:</h4>
                      <p className="confidence">
                        {verificationResult.result.is_deepfake ? 
                          `Deepfake detected with ${verificationResult.result.confidence}% confidence` : 
                          `Authentic image with ${verificationResult.result.confidence}% confidence`}
                      </p>
                      <div className="explanation">
                        <h4>What does this mean?</h4>
                        <p>
                          {verificationResult.result.is_deepfake 
                            ? "This image shows signs of digital manipulation or AI generation. Be cautious about its authenticity." 
                            : "This image appears to be authentic without signs of digital manipulation or AI generation."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="result-details">
                      <h4>Evidence:</h4>
                      <p className="evidence">{verificationResult.result.evidence}</p>
                      
                      <div className="explanation">
                        <h4>What does this mean?</h4>
                        <p>
                          {verificationResult.result.consensus === "True" 
                            ? "This claim is supported by current scientific evidence and medical consensus." 
                            : verificationResult.result.consensus === "False" 
                            ? "This claim contradicts current scientific evidence and medical consensus."
                            : "Current evidence is insufficient or conflicting to make a definitive determination about this claim."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="insights-section">
                  <h3>Critical Thinking Insights</h3>
                  <div className="insights-grid">
                    <div className="insight-card">
                      <h4>Look for Scientific Consensus</h4>
                      <p>Instead of relying on a single study, look for scientific consensus across multiple peer-reviewed studies.</p>
                    </div>
                    <div className="insight-card">
                      <h4>Check Primary Sources</h4>
                      <p>Go to the original research when possible, rather than relying on secondhand interpretations.</p>
                    </div>
                    <div className="insight-card">
                      <h4>Consider the Evidence Quality</h4>
                      <p>Large, randomized controlled trials provide stronger evidence than anecdotes or small studies.</p>
                    </div>
                  </div>
                </div>
                
                <div className="result-actions">
                  <motion.button 
                    className="share-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 19C21 20.6569 19.6569 22 18 22C16.3431 22 15 20.6569 15 19C15 17.3431 16.3431 16 18 16C19.6569 16 21 17.3431 21 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Share Results
                  </motion.button>
                  
                  <motion.button 
                    className="verify-again-button"
                    onClick={resetVerification}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Verify Another Claim
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div 
      className={`enlighten-me-container ${theme}`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="enlighten-me-header">
        <div className="enlighten-me-brand">
          <h1>MedBuster<span className="dot">.</span></h1>
          <div className="tagline">From Myth to Science</div>
        </div>
        
        <div className="header-actions">
          {renderProgressDots()}
          
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="enlighten-me-content">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </div>
      
      <div className="enlighten-me-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="#about">About</a>
            <a href="#resources">Resources</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="copyright">
            © {new Date().getFullYear()} MedBuster | Medical Fact-Checking
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EnlightenMe;