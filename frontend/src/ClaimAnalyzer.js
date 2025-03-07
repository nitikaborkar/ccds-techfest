import React, { useState } from 'react';
import axios from 'axios';

function ClaimAnalyzer({ transcriptionText, transcriptionFile }) {
  const [claims, setClaims] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  
  // Function to extract claims from transcription
  const extractClaims = async () => {
    if (!transcriptionText) {
      setError('No transcription available to analyze');
      return;
    }
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      // This would be your backend endpoint that processes the transcription
      const response = await axios.post('http://localhost:5000/analyze-claims', {
        transcription: transcriptionText
      });
      
      setClaims(response.data.claims);
    } catch (error) {
      console.error('Error analyzing claims:', error);
      setError(`Error: ${error.response?.data?.error || error.message}`);
      
      // For development/demo: Generate sample claims if backend is not available
      // Remove this in production
      const sampleClaims = generateSampleClaims(transcriptionText);
      setClaims(sampleClaims);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Demo function to generate sample claims - remove in production
  const generateSampleClaims = (text) => {
    // Split text into sentences (simplistic approach)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Select up to 3 sentences as "claims"
    const selectedClaims = sentences
      .slice(0, Math.min(3, sentences.length))
      .map((sentence, index) => ({
        id: index + 1,
        claim: sentence.trim(),
        confidence: Math.floor(Math.random() * 40) + 60, // Random between 60-100
        status: Math.random() > 0.3 ? 'Verified' : 'Needs verification'
      }));
      
    return selectedClaims;
  };
  
  return (
    <div className="claim-analyzer">
      <h3>Claim Analysis</h3>
      
      {!transcriptionText ? (
        <p>No transcription available for analysis</p>
      ) : (
        <>
          <div className="analyzer-actions">
            <button 
              onClick={extractClaims}
              disabled={isAnalyzing}
              className="analyze-button"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze for Claims'}
            </button>
            
            {transcriptionFile && (
              <div className="transcription-info">
                <p>Source: {transcriptionFile}</p>
              </div>
            )}
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          {isAnalyzing && (
            <div className="analyzing-indicator">
              <div className="loading-spinner"></div>
              <p>Analyzing transcription for claims...</p>
            </div>
          )}
          
          {claims.length > 0 && (
            <div className="claims-results">
              <h4>Detected Claims</h4>
              <ul className="claims-list">
                {claims.map((claim) => (
                  <li key={claim.id} className="claim-item">
                    <div className="claim-header">
                      <span className="claim-number">Claim {claim.id}</span>
                      <span className={`claim-status ${claim.status === 'Verified' ? 'verified' : 'unverified'}`}>
                        {claim.status}
                      </span>
                      <span className="claim-confidence">
                        Confidence: {claim.confidence}%
                      </span>
                    </div>
                    <div className="claim-content">"{claim.claim}"</div>
                    
                    <div className="claim-actions">
                      <button className="verify-claim">Verify</button>
                      <button className="edit-claim">Edit</button>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="export-actions">
                <button className="export-claims">Export Claims</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ClaimAnalyzer;