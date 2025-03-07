# main.py
import os
import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware


# Import all the required modules
from reels_downloader import ReelsDownloader
from transcribe import TranscriptExtractor
from claim_extract import ClaimExtractor
from claim_verifier import process_claim
from final_result import analyze_ratings

app = FastAPI(title="Claim Verification API", 
              description="API for downloading videos, extracting claims, and verifying them")

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class VideoURL(BaseModel):
    url: str

class VerificationResult(BaseModel):
    video_path: Optional[str] = None
    audio_path: Optional[str] = None
    transcription: Optional[str] = None
    claim: Optional[str] = None
    consensus: Optional[str] = None
    scientific_evidence: Optional[str] = None
    counter_claim: Optional[str] = None
    supporting_count: Optional[int] = None
    opposing_count: Optional[int] = None
    total_valid_ratings: Optional[int] = None

# Global variables to store the current verification state
current_verification = None
is_processing = False

@app.get("/")
async def root():
    return {"message": "Claim Verification API is running"}

@app.post("/verify-video", response_model=VerificationResult)
async def verify_video(video_url: VideoURL, background_tasks: BackgroundTasks):
    global is_processing
    
    if is_processing:
        raise HTTPException(status_code=400, detail="Another verification is already in progress")
    
    # Start the verification process in the background
    background_tasks.add_task(process_verification, video_url.url)
    
    return JSONResponse(
        content={"message": "Verification process started. Check /verification-status for updates."},
        status_code=202
    )

@app.get("/verification-status")
async def verification_status():
    global current_verification
    
    if current_verification is None:
        return JSONResponse(
            content={"message": "No verification has been run yet"},
            status_code=404
        )
    
    # Prepare a simplified response with just two fields
    response = {
        "consensus": current_verification.consensus,
        "evidence": None
    }
    
    # Add the appropriate evidence field based on the consensus
    if current_verification.consensus == "True":
        response["evidence"] = current_verification.scientific_evidence
    elif current_verification.consensus == "False":
        response["evidence"] = current_verification.counter_claim
    elif current_verification.consensus == "Neutral":
        # For neutral results, combine both types of evidence
        combined_evidence = []
        if current_verification.scientific_evidence and current_verification.scientific_evidence != "N/A":
            combined_evidence.append("Supporting evidence: " + current_verification.scientific_evidence)
        if current_verification.counter_claim and current_verification.counter_claim != "N/A":
            combined_evidence.append("Counter evidence: " + current_verification.counter_claim)
        response["evidence"] = "\n\n".join(combined_evidence)
    else:
        # For insufficient data or other cases
        response["evidence"] = "Insufficient evidence available"
    
    return response

async def process_verification(url: str):
    global current_verification, is_processing
    
    is_processing = True
    current_verification = VerificationResult()
    
    try:
        # Step 1: Download the video
        downloader = ReelsDownloader()
        video_path = downloader.download_video(url)
        
        if not video_path:
            raise Exception("Failed to download video")
        
        current_verification.video_path = video_path
        
        # Step 2: Extract audio and transcribe
        transcript_extractor = TranscriptExtractor()
        audio_path, _, transcription = transcript_extractor.process_video(video_path)
        
        if not transcription:
            raise Exception("Failed to transcribe video")
        
        current_verification.audio_path = audio_path
        current_verification.transcription = transcription
        
        # Step 3: Extract claims
        claim_extractor = ClaimExtractor()
        _, claims_list, _ = claim_extractor.extract_claims(transcription)
        
        if not claims_list or len(claims_list) == 0:
            raise Exception("No claims extracted from the video")
        
        # Use the first claim for verification
        claim = claims_list[0]
        current_verification.claim = claim
        
        # Step 4: Verify the claim
        await process_claim(claim)
        
        # Step 5: Analyze the results
        result = analyze_ratings()
        
        # Update the current verification with the results
        current_verification.consensus = result.get("consensus")
        current_verification.scientific_evidence = result.get("scientific_evidence")
        current_verification.counter_claim = result.get("counter_claim")
        current_verification.supporting_count = result.get("supporting_count")
        current_verification.opposing_count = result.get("opposing_count")
        current_verification.total_valid_ratings = result.get("total_valid_ratings")
    except Exception as e:
        print(f"Error in verification process: {e}")
        current_verification.error = str(e)
    finally:
        is_processing = False

if __name__ == "__main__":
    # Ensure required directories exist
    os.makedirs("downloads", exist_ok=True)
    os.makedirs("audio", exist_ok=True)
    os.makedirs("outputs", exist_ok=True)
    os.makedirs("raw_content", exist_ok=True)
    
    # Run the FastAPI app with Uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
