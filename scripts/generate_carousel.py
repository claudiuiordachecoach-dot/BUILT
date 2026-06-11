import os
import urllib.request
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

# Configure fonts
bebas_url = "https://github.com/google/fonts/raw/main/ofl/bebasneue/BebasNeue-Regular.ttf"
barlow_url = "https://github.com/google/fonts/raw/main/ofl/barlow/Barlow-Bold.ttf"
barlow_reg_url = "https://github.com/google/fonts/raw/main/ofl/barlow/Barlow-Regular.ttf"

for url, filename in [(bebas_url, "BebasNeue.ttf"), (barlow_url, "Barlow-Bold.ttf"), (barlow_reg_url, "Barlow-Regular.ttf")]:
    if not os.path.exists(filename):
        print(f"Downloading {filename}...")
        urllib.request.urlretrieve(url, filename)

slides = [
    {
        "title": "5 MITURI",
        "subtitle": "DIN FITNESS",
        "body": "Care te țin pe loc, îți mănâncă\ntimpul și te frustrează.\n\nIndustria vrea să te complici\nca să-ți vândă soluții.",
        "img": "1.JPG"
    },
    {
        "title": "MITUL #1",
        "subtitle": "",
        "body": "„Cardio e singura metodă\nsă arzi grăsime și să slăbești.”",
        "img": "2.JPG"
    },
    {
        "title": "ADEVARUL",
        "subtitle": "",
        "body": "Cardio e excelent pentru inimă, dar\narde calorii DOAR cât ești pe bandă.\n\nAntrenamentul cu greutăți te face\nsă arzi calorii 24-48 de ore DUPĂ\nantrenament (efectul EPOC).\n\nGreutățile remodelează fizicul,\ncardio te menține sănătos.",
        "img": "3.JPG"
    },
    {
        "title": "MITUL #2",
        "subtitle": "",
        "body": "„Trebuie să ai 5-6 mese pe zi\npentru a-ți accelera metabolismul.”",
        "img": "4.JPG"
    },
    {
        "title": "ADEVARUL",
        "subtitle": "",
        "body": "Efortul metabolic depinde de\nTOTALUL caloriilor, nu de numărul meselor.\n\n2000 kcal în 2 mese sau în 6 mese =\nacelași consum energetic pentru digestie.\n\nFrecvența meselor ține doar de programul tău.",
        "img": "5.JPG"
    },
    {
        "title": "MITUL #3",
        "subtitle": "",
        "body": "„Carbohidrații mâncați seara\nse transformă direct în grăsime.”",
        "img": "6.JPG"
    },
    {
        "title": "ADEVARUL",
        "subtitle": "",
        "body": "Corpul nu are un program care se\nînchide la ora 18:00.\n\nDacă ești în deficit caloric,\norezul de la cină nu te îngrașă.\n\nConsumat la timp, te ajută să dormi\nprofund și îți dă energie mâine.",
        "img": "7.JPG"
    },
    {
        "title": "MITUL #4",
        "subtitle": "",
        "body": "„Făcând abdomene zilnic,\ntopești colăceii.”\n\n\nADEVĂRUL\nCorpul arde grăsimea sistemic\n(din tot corpul deodată), nu localizat\nsub mușchi. Nu poți alege de unde\nslăbești prima oară.",
        "img": "8.JPG"
    },
    {
        "title": "MITUL #5",
        "subtitle": "",
        "body": "„Dacă nu bei shake-ul în 30 min\ndupă sală, pierzi antrenamentul.”\n\n\nADEVĂRUL\nSinteza proteică rămâne ridicată 24-48 de ore.\n\nNu te panica la vestiar. Totalul de\nproteine dintr-o zi contează de 10 ori mai mult.",
        "img": "9.JPG"
    },
    {
        "title": "SISTEMUL BUILT",
        "subtitle": "",
        "body": "Rezultatele apar când aplici\nlucrurile de bază.\n\nEști gata să construiești un corp puternic,\nfuncțional, cu un sistem bazat pe viața\nta și doar 3 ore de efort pe săptămână?\n\nComentează \"BUILT\" și îți trimit detalii.",
        "img": "10.JPG"
    }
]

in_dir = "/Users/iordacheclaudiu/Desktop/mituri"
out_dir = "/Users/iordacheclaudiu/Desktop/mituri_final"
os.makedirs(out_dir, exist_ok=True)

TARGET_W = 1080
TARGET_H = 1350

try:
    font_title = ImageFont.truetype("BebasNeue.ttf", 140)
    font_subtitle = ImageFont.truetype("BebasNeue.ttf", 160)
    font_body = ImageFont.truetype("Barlow-Bold.ttf", 55)
except Exception as e:
    print(f"Error loading fonts: {e}")
    font_title = ImageFont.load_default()
    font_subtitle = ImageFont.load_default()
    font_body = ImageFont.load_default()

for i, slide in enumerate(slides):
    img_path = os.path.join(in_dir, slide["img"])
    if not os.path.exists(img_path):
        print(f"Missing {img_path}")
        continue
    
    with Image.open(img_path) as img:
        # Convert to RGB
        img = img.convert("RGB")
        
        # Center crop to 1080x1350 ratio
        img_ratio = img.width / img.height
        target_ratio = TARGET_W / TARGET_H
        
        if img_ratio > target_ratio:
            # Image is wider
            new_w = int(img.height * target_ratio)
            left = (img.width - new_w) // 2
            img = img.crop((left, 0, left + new_w, img.height))
        else:
            # Image is taller
            new_h = int(img.width / target_ratio)
            top = (img.height - new_h) // 2
            img = img.crop((0, top, img.width, top + new_h))
            
        img = img.resize((TARGET_W, TARGET_H), Image.Resampling.LANCZOS)
        
        # Add dark overlay for text readability
        overlay = Image.new("RGBA", (TARGET_W, TARGET_H), (0, 0, 0, 160)) # 60% opacity black
        img = img.convert("RGBA")
        img = Image.alpha_composite(img, overlay)
        
        # Draw text
        draw = ImageDraw.Draw(img)
        
        y_cursor = 250
        
        # Draw title
        if slide["title"]:
            color = (255, 255, 255, 255) if slide["title"] != "5 MITURI" else (192, 57, 43, 255)
            if slide["title"].startswith("MITUL"): color = (192, 57, 43, 255)
            draw.text((100, y_cursor), slide["title"], font=font_title, fill=color)
            y_cursor += 130
            
        if slide["subtitle"]:
            draw.text((100, y_cursor), slide["subtitle"], font=font_subtitle, fill=(255, 255, 255, 255))
            y_cursor += 160
            
        y_cursor += 50
        
        # Draw body
        lines = slide["body"].split("\n")
        for line in lines:
            if "ADEVĂRUL" in line:
                draw.text((100, y_cursor), line, font=font_title, fill=(39, 174, 96, 255))
                y_cursor += 130
            elif "\"BUILT\"" in line:
                draw.text((100, y_cursor), line, font=font_body, fill=(192, 57, 43, 255))
                y_cursor += 80
            else:
                draw.text((100, y_cursor), line, font=font_body, fill=(245, 245, 245, 255))
                y_cursor += 80
        
        # Save
        out_path = os.path.join(out_dir, f"slide_{i+1:02d}.jpg")
        img.convert("RGB").save(out_path, quality=95)
        print(f"Saved {out_path}")

print("Done!")
