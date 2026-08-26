import re

# Fix Nelu Acasa (remove 40 min)
with open("public/quickref/nelu-acasa-v3.html", "r", encoding="utf-8") as f:
    content_acasa = f.read()

content_acasa = content_acasa.replace("<strong>40 MIN</strong>", "<strong>Ritm Propriu</strong>")
content_acasa = content_acasa.replace('<div class="phase-time">40 Min</div>', '')

with open("public/quickref/nelu-acasa-v3.html", "w", encoding="utf-8") as f:
    f.write(content_acasa)


# Fix Nelu Antrenament (remove ACASA tab)
with open("public/quickref/nelu-antrenament-v3.html", "r", encoding="utf-8") as f:
    content_gym = f.read()

# Remove the tab button
content_gym = re.sub(r'\s*<div class="tab" onclick="showTab\(this,\'acasa\'\)">ACASĂ \(HOME\)</div>', '', content_gym)

# Remove the panel
content_gym = re.sub(r'<!-- ═══════════════════════════════ ACASĂ \(HOME\) ═══════════════════════════════ -->.*?<!-- ═══════════════════════════════ REGULI ═══════════════════════════════ -->', '<!-- ═══════════════════════════════ REGULI ═══════════════════════════════ -->', content_gym, flags=re.DOTALL)

with open("public/quickref/nelu-antrenament-v3.html", "w", encoding="utf-8") as f:
    f.write(content_gym)
