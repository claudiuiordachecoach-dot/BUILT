import re

with open('public/quickref/ciprian-antrenament-v2.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add video link after every ex-cue if not already there
pattern = re.compile(r'(<div class="ex-cue">.*?</div>)(?![\s\n]*<a href=".*?" class="btn-vid">)', re.DOTALL)
replacement = r'\1\n              <a href="#" class="btn-vid"><span>🎬</span> VIDEO EXECUȚIE</a>'

new_content = pattern.sub(replacement, content)

with open('public/quickref/ciprian-antrenament-v2.html', 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Added videos to HTML")
