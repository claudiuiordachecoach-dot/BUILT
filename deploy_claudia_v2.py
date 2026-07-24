import os
import re
import shutil

source_html = "/Users/iordacheclaudiu/Claude - BUILT Cowork/CLIENTS/Claudia David/Cartea_Retete_Claudia_v2.html"
target_html = "/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center/public/Cartea_Retete_Claudia_v2.html"
public_img_dir = "/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center/public/cookbook-images/claudia_v2"
source_img_dir = "/Users/iordacheclaudiu/Claude - BUILT Cowork/CLIENTS/Claudia David/cookbook-images/claudia_v2"

os.makedirs(public_img_dir, exist_ok=True)

with open(source_html, "r", encoding="utf-8") as f:
    html_content = f.read()

if os.path.exists(source_img_dir):
    for filename in os.listdir(source_img_dir):
        if filename.endswith(".png"):
            local_path = os.path.join(source_img_dir, filename)
            new_local_path = os.path.join(public_img_dir, filename)
            shutil.copy2(local_path, new_local_path)
            print(f"Copied {filename}")

html_content = html_content.replace("./cookbook-images/claudia_v2/", "/cookbook-images/claudia_v2/")

with open(target_html, "w", encoding="utf-8") as f:
    f.write(html_content)
    
print("Successfully processed and copied Claudia V2 cookbook to public!")
