import React from 'react';
import './Header.css';

const Header = ({ theme, toggleTheme }) => {
  return (
    <header className="site-header">
      <div className="header-container">
        {/* Left: Website name */}
        <div className="logo">
          <a href="/" className="logo-link">VerifyAI</a>
        </div>
        
        {/* Center: Navigation links */}
        <nav className="main-nav">
          <ul className="nav-list">
            <li className="nav-item"><a href="/features" className="nav-link">Features</a></li>
            <li className="nav-item"><a href="/about" className="nav-link">About</a></li>
            <li className="nav-item"><a href="/pricing" className="nav-link">Pricing</a></li>
            <li className="nav-item"><a href="/resources" className="nav-link">Resources</a></li>
          </ul>
        </nav>
        
        {/* Right: Sign in and theme toggle */}
        <div className="header-actions">
          <a href="/signin" className="signin-button">Sign in</a>
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;