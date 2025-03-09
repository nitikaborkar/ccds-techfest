import React from 'react';
import './AboutUs.css';
import GradientBackground from './GradientBackground';
import { Link, useNavigate } from 'react-router-dom';
import nitikaImage from './images/Nitika.jpeg';
import mokshitImage from './images/mokshit.jpg';
import anantImage from './images/anant.jpg';


const AboutUs = ({ theme }) => {
  const navigate = useNavigate();
  
  // Function to navigate back to home page
  const goToHome = () => {
    navigate('/');
  };
  
  // Array of founder information
  const founderArray = [
    {
      name: "Anant Kabra",
      position: "CEO & Co-Founder",
      image: anantImage, // Corrected path
    },
    {
      name: "Nitika Borkar",
      position: "CEO & Co-Founder",
      image: nitikaImage, // Corrected path
    },
    {
      name: "Mokshit Jain",
      position: "CEO & Co-Founder",
      image: mokshitImage, // Corrected path
    }
  ];

  return (
    <div className={`about-page ${theme}`}>
      <div className={`about-gradient-background ${theme}-mode`}>
        <div className="about-gradient-overlay"></div>
      </div>
      
      {/* Using the same header structure as LandingPage */}
      <header className="site-header">
        <div className="logo">
          <span className="logo-text">MedBuster</span>
        </div>
        <nav className="main-nav">
          <ul>
            {/* <li><Link to="/">Home</Link></li> */}
            {/* You can uncomment and add more navigation links as needed */}
          </ul>
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
        </div>
      </header>
      
      <div className="about-us-container">
        <header className="about-header">
          <h1 className="about-title">About MedBuster</h1>
          <p className="about-subtitle">From "Trust Me, Bro" to "Science Says So"</p>
        </header>
        
        <div className="about-box-hero">
          <div className="about-box-hero-left">
            <h2>Our Mission</h2>
            <p>
              At MedBuster, we're dedicated to combating medical misinformation through 
              cutting-edge AI technology. Our platform empowers users to verify claims, 
              detect deepfakes, and access reliable information in an era of uncertainty.
            </p>
            <p>
              Founded in 2025, our team of experts in AI, healthcare, and information 
              security work tirelessly to build trust in digital content and promote 
              scientific literacy.
            </p>
          </div>
        </div>
        
        <div className="about-box-title">
          <h2>Meet Our Founders</h2>
          <p>The brilliant minds behind MedBuster's mission to fight misinformation</p>
        </div>
        
        <div className="founders-grid">
          {founderArray.map((founder, i) => (
            <div className="founder-card" key={i}>
              <div className="founder-image-container">
                <img
                  src={founder.image}
                  alt={founder.name}
                  className="founder-image"
                />
              </div>
              <h3 className="founder-name">{founder.name}</h3>
              <p className="founder-position">{founder.position}</p>
            </div>
          ))}
        </div>
        
        <div className="back-home">
          <button className="back-button" onClick={goToHome}>← Back to Home</button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;