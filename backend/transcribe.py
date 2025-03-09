import os
from moviepy import VideoFileClip
import openai
from dotenv import load_dotenv

class TranscriptExtractor:
    def __init__(self, api_key=None):
        """
        Initialize the AudioExtractor
        
        Args:
            api_key (str, optional): OpenAI API key. If None, tries to load from environment
        """
        # Load environment variables
        load_dotenv(override=True)
        
        # Set API key (prioritize passed key, then env variable)
        self.api_key = os.getenv("OPENAI_API_KEY")
        print("APIIIIIII", os.getenv("OPENAI_API_KEY"))
        print(f"API Key: {self.api_key}")
        if not self.api_key:
            raise ValueError("OpenAI API key not found. Please provide it or set OPENAI_API_KEY environment variable.")
        
        # Initialize OpenAI client
        self.client = openai.OpenAI(api_key=self.api_key)
    
    def extract_audio(self, video_path, output_dir="audio"):
        """
        Extract audio from a video file
        
        Args:
            video_path (str): Path to the video file
            output_dir (str): Directory to save the extracted audio
            
        Returns:
            str: Path to the extracted audio file
        """
        try:
            # Create output directory if it doesn't exist
            os.makedirs(output_dir, exist_ok=True)
            
            # Generate output filename based on input video
            video_filename = os.path.basename(video_path)
            audio_filename = os.path.splitext(video_filename)[0] + ".mp3"
            output_audio_path = os.path.join(output_dir, audio_filename)
            
            # Load the video file and extract audio
            video = VideoFileClip(video_path)
            audio = video.audio
            
            # Save as MP3
            audio.write_audiofile(output_audio_path, codec='mp3')
            
            print(f"Audio extracted and saved as {output_audio_path}")
            return output_audio_path
            
        except Exception as e:
            print(f"Error extracting audio: {e}")
            return None
    
    def transcribe_audio(self, audio_path):
        """
        Transcribe an audio file using OpenAI's Whisper
        
        Args:
            audio_path (str): Path to the audio file
            
        Returns:
            str: Transcription of the audio
        """
        try:
            with open(audio_path, "rb") as audio_file:
                transcription = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )
            
            print(f"Transcription complete for {audio_path}")
            return transcription.text
            
        except Exception as e:
            print(f"Error transcribing audio: {e}")
            return None
    
    def process_video(self, video_path, output_dir="outputs"):
        """
        Process a video: extract audio and transcribe
        
        Args:
            video_path (str): Path to the video file
            output_dir (str): Directory to save the transcription
            
        Returns:
            tuple: (audio_path, transcription_path, transcription_text)
        """
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Extract audio
        audio_path = self.extract_audio(video_path)
        if not audio_path:
            return None, None, None
        
        # Transcribe audio
        transcription = self.transcribe_audio(audio_path)
        if not transcription:
            return audio_path, None, None
        
        # Save transcription to file
        video_filename = os.path.basename(video_path)
        transcription_filename = os.path.splitext(video_filename)[0] + "_transcription.txt"
        transcription_path = os.path.join(output_dir, transcription_filename)
        
        with open(transcription_path, "w", encoding="utf-8") as f:
            f.write(transcription)
        
        print(f"Transcription saved to {transcription_path}")
        return audio_path, transcription_path, transcription
    



