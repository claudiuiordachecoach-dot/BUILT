from PIL import Image
import os

img_path = "/Users/iordacheclaudiu/Desktop/mituri/1.JPG"
if os.path.exists(img_path):
    with Image.open(img_path) as img:
        print(f"Size: {img.size}")
else:
    print("Image not found")
