import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // State variables
  const [activeTab, setActiveTab] = useState('download');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [resultMessage, setResultMessage] = useState('');
  const [resultData, setResultData] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [transcriptions, setTranscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Base URL for API
  const API_BASE_URL = 'http://localhost:5000';

  // Fetch downloads and transcriptions on component mount
  useEffect(() => {
    fetchDownloads();
    fetchTranscriptions();
  }, []);

  // Function to fetch downloads
  const fetchDownloads = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/list-downloads`);
      setDownloads(response.data.files);
    } catch (error) {
      console.error('Error fetching downloads:', error);
    }
  };

  // Function to fetch transcriptions
  const fetchTranscriptions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/list-transcriptions`);
      setTranscriptions(response.data.files);
    } catch (error) {
      console.error('Error fetching transcriptions:', error);
    }
  };

  // Function to handle Instagram URL download
  const handleDownloadReel = async () => {
    if (!instagramUrl) {
      setResultMessage('Please enter an Instagram URL');
      return;
    }

    setIsLoading(true);
    setProcessingStatus('downloading');
    setResultMessage('Downloading Instagram reel...');

    try {
      const response = await axios.post(`${API_BASE_URL}/download-reel`, {
        url: instagramUrl
      });

      setResultMessage('Reel downloaded successfully!');
      setResultData(response.data);
      fetchDownloads();
    } catch (error) {
      setResultMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
      setProcessingStatus('idle');
    }
  };

  // Function to handle file upload
  const handleFileUpload = async () => {
    if (!videoFile) {
      setResultMessage('Please select a file');
      return;
    }

    setIsLoading(true);
    setProcessingStatus('uploading');
    setResultMessage('Uploading video...');

    const formData = new FormData();
    formData.append('file', videoFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResultMessage('Video uploaded successfully!');
      setResultData(response.data);
      fetchDownloads();
    } catch (error) {
      setResultMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
      setProcessingStatus('idle');
    }
  };

  // Function to process a reel with download + transcription
  const handleProcessReel = async () => {
    if (!instagramUrl) {
      setResultMessage('Please enter an Instagram URL');
      return;
    }

    setIsLoading(true);
    setProcessingStatus('processing');
    setResultMessage('Processing Instagram reel...');

    try {
      const response = await axios.post(`${API_BASE_URL}/process-reel`, {
        url: instagramUrl
      });

      setResultMessage('Reel processed and transcribed successfully!');
      setResultData(response.data);
      fetchDownloads();
      fetchTranscriptions();
    } catch (error) {
      setResultMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
      setProcessingStatus('idle');
    }
  };

  // Function to batch transcribe all videos
  const handleBatchTranscribe = async () => {
    setIsLoading(true);
    setProcessingStatus('transcribing');
    setResultMessage('Batch transcribing all videos in downloads folder...');

    try {
      const response = await axios.post(`${API_BASE_URL}/batch-transcribe`);

      setResultMessage('Batch transcription completed!');
      setResultData(response.data);
      fetchTranscriptions();
    } catch (error) {
      setResultMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
      setProcessingStatus('idle');
    }
  };

  // Function to download a transcription
  const handleDownloadTranscription = (filename) => {
    window.open(`${API_BASE_URL}/download-transcription/${filename}`, '_blank');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Video Processing & Transcription App</h1>
      </header>

      <div className="tabs">
        <button 
          className={activeTab === 'download' ? 'active' : ''} 
          onClick={() => setActiveTab('download')}
        >
          Download Reels
        </button>
        <button 
          className={activeTab === 'upload' ? 'active' : ''} 
          onClick={() => setActiveTab('upload')}
        >
          Upload Video
        </button>
        <button 
          className={activeTab === 'process' ? 'active' : ''} 
          onClick={() => setActiveTab('process')}
        >
          Process & Transcribe
        </button>
        <button 
          className={activeTab === 'batch' ? 'active' : ''} 
          onClick={() => setActiveTab('batch')}
        >
          Batch Transcribe
        </button>
        <button 
          className={activeTab === 'files' ? 'active' : ''} 
          onClick={() => setActiveTab('files')}
        >
          Files
        </button>
      </div>

      <div className="content-container">
        {activeTab === 'download' && (
          <div className="tab-content">
            <h2>Download Instagram Reel</h2>
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter Instagram Reel URL"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
              />
              <button 
                onClick={handleDownloadReel}
                disabled={isLoading}
              >
                Download
              </button>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="tab-content">
            <h2>Upload Video</h2>
            <div className="input-group">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
              />
              <button 
                onClick={handleFileUpload}
                disabled={isLoading}
              >
                Upload
              </button>
            </div>
          </div>
        )}

        {activeTab === 'process' && (
          <div className="tab-content">
            <h2>Process & Transcribe Instagram Reel</h2>
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter Instagram Reel URL"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
              />
              <button 
                onClick={handleProcessReel}
                disabled={isLoading}
              >
                Process & Transcribe
              </button>
            </div>
          </div>
        )}

        {activeTab === 'batch' && (
          <div className="tab-content">
            <h2>Batch Transcribe Videos</h2>
            <p>This will transcribe all videos in the downloads folder.</p>
            <button 
              onClick={handleBatchTranscribe}
              disabled={isLoading}
              className="batch-button"
            >
              Start Batch Transcription
            </button>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="tab-content files-tab">
            <div className="files-section">
              <h2>Downloaded Videos</h2>
              {downloads.length === 0 ? (
                <p>No downloads available</p>
              ) : (
                <ul className="file-list">
                  {downloads.map((file, index) => (
                    <li key={`download-${index}`}>
                      <span>{file.name}</span>
                      <div className="file-size">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="files-section">
              <h2>Transcriptions</h2>
              {transcriptions.length === 0 ? (
                <p>No transcriptions available</p>
              ) : (
                <ul className="file-list">
                  {transcriptions.map((file, index) => (
                    <li key={`transcription-${index}`}>
                      <span>{file.name}</span>
                      <button 
                        onClick={() => handleDownloadTranscription(file.name)}
                        className="download-button"
                      >
                        Download
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="status-container">
            <div className="loading-spinner"></div>
            <p className="status-message">{processingStatus === 'downloading' ? 'Downloading reel...' :
              processingStatus === 'uploading' ? 'Uploading video...' :
              processingStatus === 'processing' ? 'Processing and transcribing...' :
              processingStatus === 'transcribing' ? 'Transcribing videos...' : 'Processing...'}</p>
          </div>
        )}

        {resultMessage && !isLoading && (
          <div className="result-container">
            <h3>Status</h3>
            <p className="result-message">{resultMessage}</p>
            
            {resultData && (
              <div className="result-details">
                {resultData.video_path && (
                  <p><strong>Video:</strong> {resultData.video_path}</p>
                )}
                {resultData.audio_path && (
                  <p><strong>Audio:</strong> {resultData.audio_path}</p>
                )}
                {resultData.transcription_file && (
                  <div className="transcription-result">
                    <p><strong>Transcription file:</strong> {resultData.transcription_file}</p>
                    <button 
                      onClick={() => handleDownloadTranscription(resultData.transcription_file.split('/').pop())}
                      className="download-button"
                    >
                      Download Transcription
                    </button>
                  </div>
                )}
                {resultData.results && (
                  <div className="batch-results">
                    <h4>Batch Processing Results</h4>
                    <p>{resultData.message}</p>
                    <ul>
                      {resultData.results.map((result, index) => (
                        <li key={index} className={`result-item ${result.status}`}>
                          {result.video.split('/').pop()}: <span className="status">{result.status}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;