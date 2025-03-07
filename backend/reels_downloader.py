import os
import yt_dlp
from pathlib import Path

class ReelsDownloader:
    def __init__(self, download_dir="downloads"):
        """
        Initialize the ReelsDownloader
        
        Args:
            download_dir (str): Directory to save downloaded videos
        """
        self.download_dir = download_dir
        # Create download directory if it doesn't exist
        Path(download_dir).mkdir(parents=True, exist_ok=True)
    
    def download_video(self, url):
        """
        Download a video from the given URL using yt-dlp
        
        Args:
            url (str): URL of the video to download
            
        Returns:
            str: Path to the downloaded video file
        """
        try:
            # Make sure the output directory exists
            if not os.path.exists(self.download_dir):
                os.makedirs(self.download_dir)
            
            # Create a unique filename based on timestamp to avoid conflicts
            import time
            timestamp = int(time.time())
            output_template = os.path.join(self.download_dir, f'video_{timestamp}.%(ext)s')
            
            # yt-dlp options
            ydl_opts = {
                'format': 'best',  # Download the best quality available
                'outtmpl': output_template,  # Output file template
                'merge_output_format': 'mp4',  # Merge audio and video into mp4
                'quiet': False,  # Show progress
                'no_warnings': False,  # Show warnings
            }
            
            # Keep track of downloaded file
            downloaded_file = None
            
            # Define a callback to get the filename
            def ydl_hook(d):
                nonlocal downloaded_file
                if d['status'] == 'finished':
                    downloaded_file = d['filename']
            
            ydl_opts['progress_hooks'] = [ydl_hook]
            
            # Download the video
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            
            # If the hook didn't catch the filename, make a best guess
            if downloaded_file is None:
                # Look for the most recently modified file in the download directory
                files = [os.path.join(self.download_dir, f) for f in os.listdir(self.download_dir)]
                if files:
                    downloaded_file = max(files, key=os.path.getmtime)
                else:
                    downloaded_file = os.path.join(self.download_dir, f'video_{timestamp}.mp4')
            
            print(f"Video downloaded and saved as {downloaded_file}")
            return downloaded_file
            
        except Exception as e:
            print(f"Error downloading video: {e}")
            return None
    
    def download_with_user_input(self):
        """
        Download a video by getting the URL from user input
        
        Returns:
            str: Path to the downloaded video file
        """
        try:
            # Get the URL from the user
            url = input("Enter the video URL: ")
            
            # Download the video
            return self.download_video(url)
            
        except Exception as e:
            print(f"Error with user input: {e}")
            return None

