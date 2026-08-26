import re

with open("public/quickref/nelu-acasa.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update pause times in info and tags
content = content.replace("Pauză 90s între serii", "Pauză 1 minut între serii")
content = content.replace("pauze de 90 de secunde", "pauze de 1 minut")

# 2. Update sets to 3-4
content = re.sub(r'3 × (\d+|Max)', r'3-4 × \1', content)

# 3. Replace Cossack Squats with Bulgarian Split Squats
content = content.replace("4. Cossack Squats", "4. Bulgarian Split Squats")
content = content.replace("Fandare laterală adâncă, excelentă pentru deschiderea șoldului și aductori.", "Un picior sprijinit pe scaun/pat în spate. Cel mai eficient exercițiu unilateral pentru coapse.")

with open("public/quickref/nelu-acasa.html", "w", encoding="utf-8") as f:
    f.write(content)
