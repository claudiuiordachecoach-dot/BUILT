import re

with open('/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center/public/quickref/andrei-antrenament.html', 'r', encoding='utf-8') as f:
    text = f.read()

replacements = {
    r"\bfaci\b": "fă",
    r"\bFaci\b": "Fă",
    r"\bcobori\b": "coboară",
    r"\bCobori\b": "Coboară",
    r"\bridici\b": "ridică",
    r"\bRidici\b": "Ridică",
    r"\btragi\b": "trage",
    r"\bTragi\b": "Trage",
    r"\bîmpingi\b": "împinge",
    r"\bÎmpingi\b": "Împinge",
    r"\brotești\b": "rotește",
    r"\bRotești\b": "Rotește",
    r"\bstrângi\b": "strânge",
    r"\bStrângi\b": "Strânge",
    r"nu mai poți ține coatele sus": "ceea ce înseamnă că nu mai poți ține coatele sus", # exception handled already
    r"astfel nu mai lucrează": "astfel nu mai lucrează", # exception handled
    # fix grammar issues that might arise: "dacă nu fă o pauză" -> "dacă nu faci o pauză"
    r"dacă nu fă\b": "dacă nu faci",
    r"Dacă nu fă\b": "Dacă nu faci",
    # "să fă" -> "să faci"
    r"să fă\b": "să faci",
    # "te ridică" -> "te ridici"
    r"să te ridică": "să te ridici",
    r"să te trage": "să te tragi",
    r"să te coboară": "să te cobori",
    r"te va ajuta să dezactivezi bicepsul și antebrațul și să trage strict din dorsal": "te va ajuta să dezactivezi bicepsul și antebrațul și să tragi strict din dorsal",
    r"Nu te arcui": "Nu te arcui", # exception: "te arcui"
    r"Nu te forța": "Nu te forța", # exception: "te forța"
    r"nu te legăni": "nu te legăni", # exception: "te legăni"
}

for k, v in replacements.items():
    text = re.sub(k, v, text)

# Restore specific subjunctives that get corrupted:
text = text.replace("fără să te trage", "fără să te tragi")
text = text.replace("să trage strict", "să tragi strict")
text = text.replace("care te va ajuta să trage", "care te va ajuta să tragi")
text = text.replace("să ridică temperatura", "să ridici temperatura")
text = text.replace("dacă te legăni", "dacă te legeni") # wait, "legeni" -> "legeni"
text = text.replace("ce faci", "ce faci")
text = text.replace("Ce Fă", "Ce Faci") # "Ce Faci"
text = text.replace("ce Fă", "ce faci")

with open('/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center/public/quickref/andrei-antrenament.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed verbs in site file!")
