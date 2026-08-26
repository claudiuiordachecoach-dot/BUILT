with open("public/quickref/nelu-antrenament.html", "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    'https://www.youtube.com/search?btnI=1&q=site:youtube.com+pec+deck+fly+form+shorts': 'https://www.youtube.com/shorts/a9vQ_hwIksU',
    'https://www.youtube.com/shorts/1V3vpcaxRYQ': 'https://www.youtube.com/shorts/8fXfwG4ftaQ',
    'https://www.youtube.com/search?btnI=1&q=site:youtube.com+assisted+dips+machine+chest+form+shorts': 'https://www.youtube.com/shorts/LH9iZNaO7oU',
    'https://www.youtube.com/search?btnI=1&q=site:youtube.com+shoulder+press+machine+form+shorts': 'https://www.youtube.com/shorts/6v4nrRVySj0',
    'https://www.youtube.com/search?btnI=1&q=site:youtube.com+lateral+raises+form+shorts': 'https://www.youtube.com/shorts/Kl3LEzQ5Zqs',
    'https://www.youtube.com/search?btnI=1&q=site:youtube.com+overhead+triceps+extension+rope+shorts': 'https://www.youtube.com/shorts/9Ark9S11uXw'
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open("public/quickref/nelu-antrenament.html", "w", encoding="utf-8") as f:
    f.write(content)
