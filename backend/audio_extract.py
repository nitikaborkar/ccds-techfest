import openai
import os
from moviepy import VideoFileClip
from dotenv import load_dotenv

# Load API key from .env file
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

def extract_audio(video_path, output_audio_path):
    # Load the video file
    video = VideoFileClip(video_path)
    
    # Extract the audio
    audio = video.audio
    
    # Save as MP3
    audio.write_audiofile(output_audio_path, codec='mp3')

    print(f"Audio extracted and saved as {output_audio_path}")
    return output_audio_path

def transcribe_audio(audio_path):
    client = openai.OpenAI(api_key=api_key)

    audio_file= open(r"C:\Users\mokj0\Downloads\Telegram Desktop\Video by ayuswellnessuk.mp4", "rb")
    transcription = client.audio.transcriptions.create(
    model="whisper-1", 
    file=audio_file
)

    print("\nTranscription:\n", transcription)
    return transcription

# Example usage
video_path = r"C:\Users\mokj0\Downloads\1734173062677263.mp4"  # Change this to your video file
output_audio_path = "output_audio.mp3"  # Desired output audio file

audio_file = extract_audio(video_path, output_audio_path)
transcription = transcribe_audio(audio_file)

# Save transcription to a text file
with open("transcription.txt", "w", encoding="utf-8") as f:
    f.write(str(transcription))

print("\nTranscription saved to 'transcription.txt'")
