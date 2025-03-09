import React, { useState } from 'react';
import VerificationForm from './VerificationForm';
import FullPageForm from './FullPageForm';
import GradientBackground from './GradientBackground';
import './LandingPage.css';

const LandingPage = () => {
  const [theme, setTheme] = useState('dark');
  const [showFullPageForm, setShowFullPageForm] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    // Also update the document theme for global styles
    document.documentElement.className = newTheme;
  };

  const handleStartNow = () => {
    setShowFullPageForm(true);
  };

  const handleCloseFullPageForm = () => {
    setShowFullPageForm(false);
  };

  return (
    <div className={`landing-page ${theme}`}>
      <GradientBackground theme={theme} />
      
      <header className="site-header">
        <div className="logo">
          <span className="logo-text">VerifyAI</span>
        </div>
        <nav className="main-nav">
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#resources">Resources</a></li>
          </ul>
        </nav>
        <div className="header-actions">
          <button className="sign-in-button">Sign in</button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <main className="two-column-layout">
        <div className="content-column">
          <h1 className="hero-title">
            Claim Verification <br />
            Infrastructure
          </h1>
          <div className="subtitle">
            to combat misinformation
          </div>
          <p className="hero-description">
            Join the movement against misinformation with AI-powered verification. 
            Analyze claims from videos and text, detect deepfakes, and build trust 
            in an era of uncertainty.
          </p>
          <div className="cta-container">
            <button className="cta-button" onClick={handleStartNow}>Start now →</button>
            <a href="#learn-more" className="learn-more">Learn more</a>
          </div>
        </div>
        
        <div className="form-column">
          <div className="form-container">
            <VerificationForm theme={theme} />
          </div>
        </div>
      </main>

      {showFullPageForm && (
        <FullPageForm theme={theme} onClose={handleCloseFullPageForm} />
      )}
    </div>
  );
};

export default LandingPage;