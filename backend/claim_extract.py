import openai
import os
import json

class ClaimExtractor:
    def __init__(self, api_key=None, model="gpt-4o-mini"):
        """
        Initialize the ClaimExtractor
        
        Args:
            api_key (str, optional): OpenAI API key
            model (str): OpenAI model to use for extraction
        """
        # Set API key (prioritize passed key, then env variable)
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key not found. Please provide it or set OPENAI_API_KEY environment variable.")
        
        self.model = model
        # Initialize OpenAI client
        self.client = openai.OpenAI(api_key=self.api_key)
    
    def extract_claims(self, transcription, output_dir="outputs"):
        """
        Extract and summarise the health and fitness claims from the transcription into a simple query format for fact-checking.
        Args:
            transcription (str): Text transcription of the video
            output_dir (str): Directory to save the extracted claims
            
        Returns:
            tuple: (claims_text, claims_list, claims_path)
        """
        try:
            # Create output directory
            os.makedirs(output_dir, exist_ok=True)
            
            # Define prompt for extracting claims
            prompt = f""""Analyze the transcript of this video and extract the final, scientifically verifiable health or fitness claim.  Provide only one concise statement summarizing the main health claim."
            Transcript:
            {transcription}"""
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500
            )
            
            claims_text = response.choices[0].message.content
            
            # Try to parse the claims into a list (assuming bullet points)
            claims_list = [
                claim.strip().lstrip("•-*").strip() 
                for claim in claims_text.split("\n") 
                if claim.strip() and not claim.strip().startswith("#")
            ]
            claims_list = [claim for claim in claims_list if claim]
            
            # Save the claims to a file
            claims_path = os.path.join(output_dir, "extracted_claims.txt")
            with open(claims_path, "w", encoding="utf-8") as f:
                f.write(claims_text)
            
            # Also save as JSON for programmatic use
            json_path = os.path.join(output_dir, "extracted_claims.json")
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(claims_list, f, indent=2)
            
            print(f"Claims extracted and saved to {claims_path}")
            return claims_text, claims_list, claims_path
            
        except Exception as e:
            print(f"Error extracting claims: {e}")
            return None, None, None
    