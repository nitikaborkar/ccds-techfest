# #models/huggingface/pipeline.py
# from transformers import ViTForImageClassification, ViTImageProcessor
# from PIL import Image
# import torch

# # Load the model and processor
# model = ViTForImageClassification.from_pretrained("prithivMLmods/AI-vs-Deepfake-vs-Real")
# processor = ViTImageProcessor.from_pretrained("prithivMLmods/AI-vs-Deepfake-vs-Real")

# # Load and preprocess the image
# image = Image.open("/Users/anantkabra/Documents/GitHub/ccds-techfest/models/huggingface/image_copy.png").convert("RGB")
# inputs = processor(images=image, return_tensors="pt")

# # Perform inference
# with torch.no_grad():
#     outputs = model(**inputs)
#     logits = outputs.logits
#     predicted_class = torch.argmax(logits, dim=1).item()

# # Map class index to label
# label = model.config.id2label[predicted_class]
# print(f"Predicted Label: {label}")

import gradio as gr
from transformers import AutoImageProcessor
from transformers import SiglipForImageClassification
from transformers.image_utils import load_image
from PIL import Image
import torch

# Load model and processor
model_name = "prithivMLmods/AI-vs-Deepfake-vs-Real-Siglip2"
model = SiglipForImageClassification.from_pretrained(model_name)
processor = AutoImageProcessor.from_pretrained(model_name)

def image_classification(image):
    """Classifies an image as AI-generated, deepfake, or real."""
    image = Image.open("/Users/anantkabra/Documents/GitHub/ccds-techfest/models/huggingface/i2.png").convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probs = torch.nn.functional.softmax(logits, dim=1).squeeze().tolist()
    
    labels = model.config.id2label
    predictions = {labels[i]: round(probs[i], 3) for i in range(len(probs))}
    
    return predictions

# Create Gradio interface
iface = gr.Interface(
    fn=image_classification,
    inputs=gr.Image(type="numpy"),
    outputs=gr.Label(label="Classification Result"),
    title="AI vs Deepfake vs Real Image Classification",
    description="Upload an image to determine whether it is AI-generated, a deepfake, or a real image."
)

# Launch the app
if __name__ == "__main__":
    iface.launch()
