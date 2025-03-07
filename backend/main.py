from flask import Flask, request, jsonify, send_file
import os
from pathlib import Path
import openai
import yt_dlp
from moviepy import VideoFileClip
from dotenv import load_dotenv
import uuid
import json

# Load environment variables
load_dotenv()
api_key = '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'

# Initialize Flask app
app = Flask(__name__)

# Set up directories
UPLOAD_FOLDER = Path("uploads")
DOWNLOAD_FOLDER = Path("downloads")
OUTPUT_FOLDER = Path("outputs")

for folder in [UPLOAD_FOLDER, DOWNLOAD_FOLDER, OUTPUT_FOLDER]:
    folder.mkdir(exist_ok=True)

# Function to extract audio from video
def extract_audio(video_path, output_audio_path):
    try:
        # Load the video file
        video = VideoFileClip(str(video_path))
        
        # Extract the audio
        audio = video.audio
        
        # Save as MP3
        audio.write_audiofile(str(output_audio_path), codec='mp3')
        
        # Close the video file
        video.close()
        
        return str(output_audio_path)
    except Exception as e:
        raise Exception(f"Error extracting audio: {str(e)}")

# Function to transcribe audio
def transcribe_audio(audio_path):
    try:
        client = openai.OpenAI(api_key=api_key)
        
        with open(audio_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file
            )
        
        return transcription.text
    except Exception as e:
        raise Exception(f"Error transcribing audio: {str(e)}")

# Function to download Instagram reel
def download_instagram_reel(reel_url, output_dir=DOWNLOAD_FOLDER):
    try:
        # Generate a unique filename
        unique_id = uuid.uuid4().hex[:8]
        output_template = str(output_dir / f"insta_reel_{unique_id}.%(ext)s")
        
        # yt-dlp options
        ydl_opts = {
            'format': 'best',
            'outtmpl': output_template,
            'merge_output_format': 'mp4',
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(reel_url, download=True)
            downloaded_file = ydl.prepare_filename(info)
        
        return downloaded_file
    except Exception as e:
        raise Exception(f"Error downloading Instagram reel: {str(e)}")

# Function to process a single video
def process_video(video_path):
    """Process a single video: extract audio and transcribe"""
    video_name = os.path.basename(video_path)
    file_name = os.path.splitext(video_name)[0]
    
    # Define output paths
    audio_path = OUTPUT_FOLDER / f"{file_name}.mp3"
    transcription_path = OUTPUT_FOLDER / f"{file_name}.txt"
    
    # Skip if transcription already exists
    if os.path.exists(transcription_path):
        return {
            "video": str(video_path),
            "transcription": str(transcription_path),
            "status": "skipped"
        }
    
    # Extract audio
    try:
        extracted_audio = extract_audio(video_path, audio_path)
    except Exception as e:
        return {
            "video": str(video_path),
            "status": "failed",
            "error": f"Audio extraction failed: {str(e)}"
        }
    
    # Transcribe audio
    try:
        transcription = transcribe_audio(extracted_audio)
    except Exception as e:
        return {
            "video": str(video_path),
            "audio": str(audio_path),
            "status": "failed",
            "error": f"Transcription failed: {str(e)}"
        }
    
    # Save transcription to file
    with open(transcription_path, "w", encoding="utf-8") as f:
        f.write(transcription)
    
    return {
        "video": str(video_path),
        "audio": str(audio_path),
        "transcription": str(transcription_path),
        "status": "completed"
    }

# Function to batch process videos
def batch_process_videos():
    """Process all video files in the downloads folder"""
    # Get all video files in downloads folder
    video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm']
    video_files = [
        str(DOWNLOAD_FOLDER / f) for f in os.listdir(DOWNLOAD_FOLDER) 
        if os.path.isfile(DOWNLOAD_FOLDER / f) and 
        os.path.splitext(f)[1].lower() in video_extensions
    ]
    
    if not video_files:
        return []
    
    # Process each video
    results = []
    for video_path in video_files:
        result = process_video(video_path)
        results.append(result)
    
    # Save processing results to a log file
    log_path = OUTPUT_FOLDER / "transcription_log.json"
    with open(log_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    
    return results
# Add these imports at the top of main.py
import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pathlib import Path

# Initialize Flask app
app = Flask(__name__)
# Enable CORS for React frontend
CORS(app)


@app.route('/list-downloads', methods=['GET'])
def list_downloads():
    files = []
    for file in os.listdir(DOWNLOAD_FOLDER):
        file_path = os.path.join(DOWNLOAD_FOLDER, file)
        if os.path.isfile(file_path):
            files.append({
                'name': file,
                'size': os.path.getsize(file_path),
                'path': str(file_path)
            })
    return jsonify({"files": files})

# Route to list transcription files
@app.route('/list-transcriptions', methods=['GET'])
def list_transcriptions():
    files = []
    for file in os.listdir(OUTPUT_FOLDER):
        if file.endswith('.txt'):
            file_path = os.path.join(OUTPUT_FOLDER, file)
            if os.path.isfile(file_path):
                files.append({
                    'name': file,
                    'size': os.path.getsize(file_path),
                    'path': str(file_path)
                })
    return jsonify({"files": files})
# Route for uploading a video file
@app.route('/upload', methods=['POST'])
def upload_video():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    unique_id = uuid.uuid4().hex[:8]
    file_extension = os.path.splitext(file.filename)[1]
    uploaded_filename = f"uploaded_video_{unique_id}{file_extension}"
    uploaded_path = UPLOAD_FOLDER / uploaded_filename
    
    file.save(str(uploaded_path))
    
    return jsonify({
        "message": "File uploaded successfully",
        "file_path": str(uploaded_path)
    })

# Route for extracting audio from a video
@app.route('/extract-audio', methods=['POST'])
def extract_audio_route():
    data = request.json
    
    if not data or 'video_path' not in data:
        return jsonify({"error": "No video path provided"}), 400
    
    video_path = data['video_path']
    
    if not os.path.exists(video_path):
        return jsonify({"error": "Video file not found"}), 404
    
    unique_id = uuid.uuid4().hex[:8]
    output_audio_path = str(OUTPUT_FOLDER / f"audio_{unique_id}.mp3")
    
    try:
        result_path = extract_audio(video_path, output_audio_path)
        return jsonify({
            "message": "Audio extracted successfully",
            "audio_path": result_path
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route for transcribing audio
@app.route('/transcribe', methods=['POST'])
def transcribe_route():
    data = request.json
    
    if not data or 'audio_path' not in data:
        return jsonify({"error": "No audio path provided"}), 400
    
    audio_path = data['audio_path']
    
    if not os.path.exists(audio_path):
        return jsonify({"error": "Audio file not found"}), 404
    
    try:
        transcription = transcribe_audio(audio_path)
        
        # Save transcription to file
        unique_id = uuid.uuid4().hex[:8]
        transcription_file = str(OUTPUT_FOLDER / f"transcription_{unique_id}.txt")
        
        with open(transcription_file, "w", encoding="utf-8") as f:
            f.write(transcription)
        
        return jsonify({
            "message": "Transcription completed",
            "transcription": transcription,
            "transcription_file": transcription_file
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route for downloading Instagram reels
@app.route('/download-reel', methods=['POST'])
def download_reel_route():
    data = request.json
    
    if not data or 'url' not in data:
        return jsonify({"error": "No Instagram reel URL provided"}), 400
    
    reel_url = data['url']
    
    try:
        downloaded_file = download_instagram_reel(reel_url)
        return jsonify({
            "message": "Instagram reel downloaded successfully",
            "video_path": downloaded_file
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Combined route to process an Instagram reel: download -> extract audio -> transcribe
@app.route('/process-reel', methods=['POST'])
def process_reel_route():
    data = request.json
    
    if not data or 'url' not in data:
        return jsonify({"error": "No Instagram reel URL provided"}), 400
    
    reel_url = data['url']
    
    try:
        # Step 1: Download the reel
        video_path = download_instagram_reel(reel_url)
        
        # Step 2: Extract audio
        unique_id = uuid.uuid4().hex[:8]
        audio_path = str(OUTPUT_FOLDER / f"audio_{unique_id}.mp3")
        audio_path = extract_audio(video_path, audio_path)
        
        # Step 3: Transcribe
        transcription = transcribe_audio(audio_path)
        
        # Save transcription to file
        transcription_file = str(OUTPUT_FOLDER / f"transcription_{unique_id}.txt")
        with open(transcription_file, "w", encoding="utf-8") as f:
            f.write(transcription)
        
        return jsonify({
            "message": "Reel processed successfully",
            "video_path": video_path,
            "audio_path": audio_path,
            "transcription": transcription,
            "transcription_file": transcription_file
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to batch process all videos in the downloads folder
@app.route('/batch-transcribe', methods=['POST'])
def batch_transcribe_route():
    try:
        results = batch_process_videos()
        
        if not results:
            return jsonify({
                "message": "No video files found in the downloads folder",
                "results": []
            })
        
        # Calculate summary
        total = len(results)
        completed = sum(1 for r in results if r.get("status") == "completed")
        skipped = sum(1 for r in results if r.get("status") == "skipped")
        failed = sum(1 for r in results if r.get("status") == "failed")
        
        return jsonify({
            "message": f"Processed {total} videos: {completed} completed, {skipped} skipped, {failed} failed",
            "results": results,
            "log_file": str(OUTPUT_FOLDER / "transcription_log.json")
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to download transcription file
@app.route('/download-transcription/<filename>', methods=['GET'])
def download_transcription(filename):
    file_path = OUTPUT_FOLDER / filename
    
    if not file_path.exists():
        return jsonify({"error": "File not found"}), 404
    
    return send_file(str(file_path), as_attachment=True)

# Basic status route
@app.route('/', methods=['GET'])
def status():
    return jsonify({
        "status": "running",
        "endpoints": {
            "POST /upload": "Upload a video file",
            "POST /extract-audio": "Extract audio from a video",
            "POST /transcribe": "Transcribe an audio file",
            "POST /download-reel": "Download an Instagram reel",
            "POST /process-reel": "Download reel, extract audio, and transcribe",
            "POST /batch-transcribe": "Process all videos in the downloads folder",
            "GET /download-transcription/filename": "Download a transcription file"
        }
    })

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)