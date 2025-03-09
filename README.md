# MedBuster Documentation

This documentation will guide you through setting up and running the MedBuster application, which consists of a React frontend and a FastAPI backend.

## Overview

VerifyAI is a claim verification platform designed to combat misinformation by providing AI-powered verification for claims from videos, text, and images. The application features:

- Video URL verification
- Text claim verification
- Image deepfake detection
- Dark/light theme support
- Progressive verification status feedback

## System Requirements

- Python 3.10.6
- Node.js 14+
- npm 6+

## Project Structure

The project is divided into two main components:

1. **Backend**: A FastAPI application that handles the verification logic, including video downloading, transcription, claim extraction, and verification.
2. **Frontend**: A React application that provides a user interface for submitting claims and displaying verification results.

## Backend Setup

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/verifyai.git
cd verifyai/backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the Backend

The backend is run using Uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

This will start the backend server at http://localhost:8000.

### API Endpoints

- `GET /`: Check if the API is running
- `POST /verify-video`: Submit a video URL for verification
- `POST /verify-claim`: Submit a text claim for verification
- `GET /verification-status`: Check the status of an ongoing verification
- `POST /api/detect-deepfake/`: Upload an image to detect if it's a deepfake

## Frontend Setup

### Installation

1. Navigate to the frontend directory:
```bash
cd verifyai/frontend
```

2. Install dependencies:
```bash
npm install
```

### Running the Frontend

Start the development server:

```bash
npm start
```

#### Change the API_BASE_URL at frontend/src/utils/api.js

This will start the frontend application at http://localhost:3000.

## Component Architecture

The frontend consists of the following main components:

### Core Components
- `LandingPage.js`: The main entry point of the application
- `VerificationForm.js`: Handles user input for different verification methods
- `GradientBackground.js`: Creates a dynamic background effect

### Verification Components
- `ResultCard.js`: Displays verification results
- `LoadingIndicator.js`: Shows loading state during verification
- `ProgressIndicator.js`: Shows detailed verification progress
- `ImageUploader.js`: Component for uploading images for deepfake detection
- `StampAnimation.js`/`SvgStampAnimation.js`: Animations for verification results

## Features

### Theme Support

The application supports both light and dark themes. Theme can be toggled using the button in the top-right corner of the UI.

```javascript
// Example from LandingPage.js
const toggleTheme = () => {
  const newTheme = theme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  document.documentElement.className = newTheme;
};
```

### Verification Process

1. **Submit Claim**: Users can submit claims via video URLs, direct text, or images.
2. **Processing**: The backend processes the claim through several steps:
   - For videos: Download video → Extract audio → Transcribe audio → Extract claims → Verify claims
   - For text claims: Direct verification
   - For images: Deepfake detection using Vision Transformer (ViT) model
3. **Results**: Results are displayed with visual indicators and detailed information.

## Development Guidelines


### API Integration
- Use the fetch API or axios for making requests to the backend
- Example API call:

```javascript
const checkVerificationStatus = async () => {
  try {
    const response = await fetch('/verification-status');
    if (!response.ok) throw new Error('Error checking status');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

## Resources

- FastAPI Documentation: https://fastapi.tiangolo.com/
- React Documentation: https://reactjs.org/docs/
- Framer Motion: https://www.framer.com/motion/
