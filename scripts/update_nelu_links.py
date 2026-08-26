import re

links = [
    "https://www.youtube.com/shorts/cSJP4moytoo",
    "https://www.youtube.com/shorts/1mHlkUC5rGY",
    "https://www.youtube.com/shorts/RrU4zx4ysnI",
    "https://www.youtube.com/shorts/mDdLC-yKudY",
    "https://www.youtube.com/shorts/wdOkFomQNp8",
    "https://www.youtube.com/shorts/7vbNMc3-CV8",
    "https://www.youtube.com/shorts/4Bc1tPaYkOo",
    "https://www.youtube.com/shorts/4ua3MzaU0QU",
    "https://www.youtube.com/shorts/fFOH_RjxnHY",
    "https://www.youtube.com/shorts/xe2MXatLTUw",
    "https://www.youtube.com/shorts/eG20L9cl81w",
    "https://www.youtube.com/shorts/WwcM49jUqy0",
    "https://www.youtube.com/shorts/TEGkpxBvU_Y",
    "https://www.youtube.com/shorts/or1frhkjBDc",
    "https://www.youtube.com/shorts/KgkU7yAEW90"
]

file_path = "/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center/public/quickref/nelu-acasa-v4.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

pattern = r'<a href="[^"]*" target="_blank" class="btn-vid"><span>▶</span> Video</a>'

link_idx = 0
def repl(match):
    global link_idx
    if link_idx < len(links):
        new_link = f'<a href="{links[link_idx]}" target="_blank" class="btn-vid"><span>▶</span> Video</a>'
        link_idx += 1
        return new_link
    return match.group(0)

new_content = re.sub(pattern, repl, content, count=15)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print(f"Replaced {link_idx} links successfully.")
