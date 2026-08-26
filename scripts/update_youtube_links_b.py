import re

with open("public/quickref/nelu-antrenament.html", "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    'https://www.youtube.com/search?btnI=1&q=site:youtube.com+cable+pullover+form+shorts': 'https://www.youtube.com/shorts/hAMcfubonDc',
    'https://www.youtube.com/search?btnI=1&q=site:youtube.com+lat+pulldown+form+shorts': 'https://www.youtube.com/shorts/bNmvKpJSWKM',
    'https://www.youtube.com/search?btnI=1&q=site:youtube.com+chest+supported+high+row+form+shorts': 'https://www.youtube.com/shorts/kH4xUnfx4yg',
    'https://www.youtube.com/search?btnI=1&q=site:youtube.com+dumbbell+shrugs+form+shorts': 'https://www.youtube.com/shorts/rFsSeClGnNA',
    'https://www.youtube.com/search?btnI=1&q=site:youtube.com+bayesian+cable+curl+form+shorts': 'https://www.youtube.com/shorts/w3sXATQzGvc',
    'https://www.youtube.com/search?btnI=1&q=site:youtube.com+face+pull+form+shorts': 'https://www.youtube.com/shorts/7tgx6QHB0-A',
    '<div class="ex-ttl">Face Pulls la scripete</div>': '<div class="ex-ttl">Fluturări inverse (Rear Delt Fly)</div>',
    '<span class="caseta-val">Trage frânghia spre nivelul ochilor și rotește extern brațele spre final (arată bicepsul). Nu folosi inerția. E cheia pentru sănătatea umerilor tăi.</span>': '<span class="caseta-val">Împinge coatele în lateral și spre spate, încercând să lipești omoplații la finalul mișcării. E exercițiul minune pentru a compensa postura de birou.</span>'
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open("public/quickref/nelu-antrenament.html", "w", encoding="utf-8") as f:
    f.write(content)
