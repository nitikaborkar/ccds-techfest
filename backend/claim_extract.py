import openai
import json

# OpenAI API Key
OPENAI_API_KEY = "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"

# Read the text file
file_path = r"C:\Users\mokj0\OneDrive - Nanyang Technological University\Desktop\ccds-techfest\outputs\Video by ayuswellnessuk.txt"
with open(file_path, "r", encoding="utf-8") as file:
    file_content = file.read()

# Define your prompt
prompt = "Extract all the medical claims made in this video.\n\n" + file_content

# Call OpenAI API
client = openai.OpenAI(api_key=OPENAI_API_KEY)
response = client.chat.completions.create(
model="gpt-4o-mini",
messages=[{"role": "user", "content": prompt}]
)

output_text= response.choices[0].message.content




# Save response to a text file
output_txt_path = "output.txt"
with open(output_txt_path, "w", encoding="utf-8") as txt_file:
    txt_file.write(output_text)

print(f"Response saved to {output_txt_path}")
