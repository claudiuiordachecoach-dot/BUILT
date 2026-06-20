import os
import re
import shutil

source_html = "/Users/iordacheclaudiu/Claude - BUILT Cowork/CLIENTS/Claudia David/Cartea_Retete_Claudia.html"
target_html = "/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center/public/Cartea_Retete_Claudia.html"
public_img_dir = "/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center/public/cookbook-images/claudia"

os.makedirs(public_img_dir, exist_ok=True)

with open(source_html, "r", encoding="utf-8") as f:
    html_content = f.read()

# Find all image src
img_paths = re.findall(r'<img[^>]*src="([^"]+)"', html_content)

for local_path in img_paths:
    if local_path.startswith("http") or local_path.startswith("data:"):
        continue
    
    filename = os.path.basename(local_path)
    new_local_path = os.path.join(public_img_dir, filename)
    new_src = f"/cookbook-images/claudia/{filename}"
    
    # Copy file if it exists
    if os.path.exists(local_path):
        shutil.copy2(local_path, new_local_path)
        print(f"Copied {filename}")
    else:
        print(f"Warning: {local_path} not found!")
        
    # Replace in HTML
    html_content = html_content.replace(local_path, new_src)

with open(target_html, "w", encoding="utf-8") as f:
    f.write(html_content)
    
print("Successfully processed and copied Claudia's cookbook!")
