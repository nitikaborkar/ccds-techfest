import React, { useState } from 'react';
import VerificationForm from './VerificationForm';
import EnlightenMe from './EnlightenMe';
import GradientBackground from './GradientBackground';
import './LandingPage.css';

const LandingPage = () => {
    const [theme, setTheme] = useState('dark');
    const [showEnlightenMe, setShowEnlightenMe] = useState(false);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        // Also update the document theme for global styles
        document.documentElement.className = newTheme;
    };

    const handleStartNow = () => {
        setShowEnlightenMe(true);
    };

    const handleCloseFullPageForm = () => {
        setShowEnlightenMe(false);
    };

    return (
        <div className={`landing-page ${theme}`}>
            <GradientBackground theme={theme} />

            <header className="site-header">
                <div className="logo">
                    <span className="logo-text">MedBuster</span>
                </div>
                <nav className="main-nav">
                    {/* <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#resources">Resources</a></li>
          </ul> */}
                </nav>
                <div className="header-actions">
                    <a
                        href="https://github.com/nitikaborkar/ccds-techfest"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill={theme === "dark" ? "white" : "black"}
                        >
                            <path
                                d="M12 0a12 12 0 0 0-3.79 23.37c.6.11.82-.26.82-.58v-2.16c-3.34.73-4.04-1.61-4.04-1.61-.54-1.37-1.33-1.73-1.33-1.73-1.09-.74.08-.72.08-.72 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.48.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.16 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.28-1.55 3.3-1.23 3.3-1.23.65 1.64.24 2.86.12 3.16.76.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.93.43.37.81 1.1.81 2.22v3.3c0 .32.22.7.82.58A12 12 0 0 0 12 0z"
                            />
                        </svg>
                    </a>

                    <button className="theme-toggle" onClick={toggleTheme}>
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>
            </header>

            <main className="two-column-layout">
                <div className="content-column">
                    <h1 className="hero-title">
                        MedBuster <br />
                    </h1>
                    <div className="subtitle">
                        From "Trust Me, Bro" to "Science Says So"
                    </div>
                    <p className="hero-description">
                        Join the movement against misinformation with AI-powered verification.
                        Analyze claims from videos and text, detect deepfakes, and build trust
                        in an era of uncertainty.
                    </p>
                    <div className="cta-container">
                        <button className="cta-button" onClick={handleStartNow}>Enlighten →</button>
                        <a href="#learn-more" className="learn-more">Learn more</a>
                    </div>
                </div>

                <div className="form-column">
                    <div className="form-container">
                        <VerificationForm theme={theme} />
                    </div>
                </div>
            </main>

            {showEnlightenMe && (
                <EnlightenMe theme={theme} onClose={handleCloseFullPageForm} />
            )}
        </div>
    );
};

export default LandingPage;