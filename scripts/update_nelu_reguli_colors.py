import re

with open("public/quickref/nelu-antrenament.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the MVE text
content = content.replace("menține reflexul activ", "menține momentum-ul activ")

# 2. Update the alert classes and remove inline styles
# Hidratarea (green)
content = content.replace('<div class="alert" style="border-left:4px solid #10b981;">', '<div class="alert green">')

# Protocol Incalzire (blue)
content = content.replace('<div class="alert" style="border-left:4px solid #3b82f6;">', '<div class="alert blue">')

# Pasii Zilnici NEAT (orange)
content = content.replace('<div class="alert" style="border-left:4px solid #8b5cf6;">', '<div class="alert orange">')

# Cum Progresezi (green)
content = content.replace('<div class="alert" style="border-left:4px solid #ef4444;">', '<div class="alert green">')

# MVE (orange)
content = content.replace('<div class="alert" style="border-left:4px solid #f97316;">', '<div class="alert orange">')

# Durerile Musculare vs Articulare (blue)
content = content.replace('<div class="alert" style="border-left:4px solid #64748b;">', '<div class="alert blue">')

# Constanta Bate Perfectiunea (green)
content = content.replace('<div class="alert" style="border-left:4px solid #eab308;">', '<div class="alert green">')

# Wait, the app-skin CSS at the top forces `border-color: rgba(255,255,255,.10) !important;` on `.alert`.
# I will modify that CSS rule slightly to NOT override border-left for .alert if they have a colored class.
# Actually, the inline style `border-left` would have overridden the `border-color` if it had `!important`. But the easiest fix is just using the background color classes. The `border-color` override makes them have gray borders but colored backgrounds, which looks nice anyway in the dark theme. Let's let the classes handle the colors.

with open("public/quickref/nelu-antrenament.html", "w", encoding="utf-8") as f:
    f.write(content)
