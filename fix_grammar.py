import re

with open('/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center/public/quickref/andrei-antrenament.html', 'r', encoding='utf-8') as f:
    text = f.read()

replacements = {
    r"în timp ce ridică greutăți": "în timp ce ridici greutăți",
    r"când împinge/trage greutatea": "când împingi/tragi greutatea",
    r"când coboară ganterele": "când cobori ganterele",
    r"Nu coboară sub nivelul umerilor": "Nu coborî sub nivelul umerilor",
    r"Ridică mai sus de umeri": "Ridicarea brațelor mai sus de umeri",
    r"când aduci brațele": "când aduci brațele",
    r"când extinzi brațele": "când extinzi brațele"
}

for k, v in replacements.items():
    text = re.sub(k, v, text)

with open('/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center/public/quickref/andrei-antrenament.html', 'w', encoding='utf-8') as f:
    f.write(text)

