import os
import yt_dlp

def download_instagram_reel(reel_url):
    # Output directory
    output_dir = "downloads"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # yt-dlp options
    ydl_opts = {
        'format': 'best',  # Download the best quality available
        'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s'),  # Output file template
        'merge_output_format': 'mp4',  # Merge audio and video into mp4
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([reel_url])

    print("Download complete!")

if __name__ == "__main__":
    # Get the Instagram Reels link from the user
    reel_url = input("Enter the Instagram Reels link: ")

    # Download the reel
    download_instagram_reel(reel_url)