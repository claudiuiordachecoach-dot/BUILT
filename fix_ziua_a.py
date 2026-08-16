import re

file_path = '/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center/public/quickref/ciprian-antrenament-v2.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the button HTML with actual links
# 1. Floor Press
content = content.replace(
    '''<div class="ex-name">1. Floor Press alternativ cu gantere (10 kg)</div>
              <div class="ex-cue">Tempo 3-1-1. Pe spate pe podea. Împingi ganterele, cobori lent în 3 secunde până când coatele ating ferm podeaua. Protejează umerii la maxim.</div>
              <a href="#" class="btn-vid"><span>🎬</span> VIDEO EXECUȚIE</a>''',
    '''<div class="ex-name">1. Floor Press alternativ cu gantere (10 kg)</div>
              <div class="ex-cue">Tempo 3-1-1. Pe spate pe podea. Împingi ganterele, cobori lent în 3 secunde până când coatele ating ferm podeaua. Protejează umerii la maxim.</div>
              <a href="https://www.youtube.com/shorts/O1x7AoUf5Vs" target="_blank" class="btn-vid"><span>▶</span> Video Execuție</a>'''
)

# 2. Biceps Curls
content = content.replace(
    '''<div class="ex-name">2. Biceps Curls din șezut (2x10 kg)</div>
              <div class="ex-cue">Tempo 3-1-1. Pe scaun, brațele atârnând. Flexie controlată, coborâre lentă 3 secunde. Fără balans de trunchi!</div>
              <a href="#" class="btn-vid"><span>🎬</span> VIDEO EXECUȚIE</a>''',
    '''<div class="ex-name">2. Biceps Curls din șezut (2x10 kg)</div>
              <div class="ex-cue">Tempo 3-1-1. Pe scaun, brațele atârnând. Flexie controlată, coborâre lentă 3 secunde. Fără balans de trunchi!</div>
              <a href="https://www.youtube.com/shorts/oLyP6sORFOc" target="_blank" class="btn-vid"><span>▶</span> Video Execuție</a>'''
)

# 3. Skullcrushers
content = content.replace(
    '''<div class="ex-name">3. Skullcrushers pe podea (2x10 kg)</div>
              <div class="ex-cue">Tempo 3-1-1. Din culcat pe spate, ganterele sus, îndoi doar cotul coborând ganterele spre frunte, extinzi. Izolează perfect tricepsul, zero stres pe claviculă.</div>
              <a href="#" class="btn-vid"><span>🎬</span> VIDEO EXECUȚIE</a>''',
    '''<div class="ex-name">3. Skullcrushers pe podea (2x10 kg)</div>
              <div class="ex-cue">Tempo 3-1-1. Din culcat pe spate, ganterele sus, îndoi doar cotul coborând ganterele spre frunte, extinzi. Izolează perfect tricepsul, zero stres pe claviculă.</div>
              <a href="https://www.youtube.com/shorts/iuYB_fLp26Q" target="_blank" class="btn-vid"><span>▶</span> Video Execuție</a>'''
)

# 4. Chest-Supported Row
content = content.replace(
    '''<div class="ex-name">4. Chest-Supported Dumbbell Row (2x10 kg)</div>
              <div class="ex-cue">Tempo 3-1-1. Aplecat, sprijină pieptul sau fruntea pe spătarul unui scaun ca să nu tragi din lombar. Tragi coatele spre șolduri, cobori în 3 secunde.</div>
              <a href="#" class="btn-vid"><span>🎬</span> VIDEO EXECUȚIE</a>''',
    '''<div class="ex-name">4. Chest-Supported Dumbbell Row (2x10 kg)</div>
              <div class="ex-cue">Tempo 3-1-1. Aplecat, sprijină pieptul sau fruntea pe spătarul unui scaun ca să nu tragi din lombar. Tragi coatele spre șolduri, cobori în 3 secunde.</div>
              <a href="https://www.youtube.com/shorts/uTKJk5KVgZo" target="_blank" class="btn-vid"><span>▶</span> Video Execuție</a>'''
)

# 5. Dumbbell Shrugs
content = content.replace(
    '''<div class="ex-name">5. Dumbbell Shrugs (Trapez - 2x10 kg)</div>
              <div class="ex-cue">Tempo 3-1-1. Din picioare, ridici umerii spre urechi, ții 1 secundă sus, cobori lent în 3 secunde. Execuție curată, fără impuls.</div>
              <a href="#" class="btn-vid"><span>🎬</span> VIDEO EXECUȚIE</a>''',
    '''<div class="ex-name">5. Dumbbell Shrugs (Trapez - 2x10 kg)</div>
              <div class="ex-cue">Tempo 3-1-1. Din picioare, ridici umerii spre urechi, ții 1 secundă sus, cobori lent în 3 secunde. Execuție curată, fără impuls.</div>
              <a href="https://www.youtube.com/shorts/rFsSeClGnNA" target="_blank" class="btn-vid"><span>▶</span> Video Execuție</a>'''
)

# Circuit 1
content = content.replace(
    '''<div class="ex-name">1. Hollow Body Hold</div>
              <div class="ex-cue">Din podea. Lombarul lipit ferm, picioarele ridicate.</div>
              <a href="#" class="btn-vid"><span>🎬</span> VIDEO EXECUȚIE</a>''',
    '''<div class="ex-name">1. Hollow Body Hold</div>
              <div class="ex-cue">Din podea. Lombarul lipit ferm, picioarele ridicate.</div>
              <a href="https://www.youtube.com/shorts/pN_YFk4Lx8Q" target="_blank" class="btn-vid"><span>▶</span> Video Execuție</a>'''
)

# Circuit 2
content = content.replace(
    '''<div class="ex-name">2. Biceps Curls rapide (10 kg)</div>
              <div class="ex-cue">Pompare, viteză, fără tempo, până la arsură.</div>
              <a href="#" class="btn-vid"><span>🎬</span> VIDEO EXECUȚIE</a>''',
    '''<div class="ex-name">2. Biceps Curls rapide (10 kg)</div>
              <div class="ex-cue">Pompare, viteză, fără tempo, până la arsură.</div>
              <a href="https://www.youtube.com/shorts/Z7gLnOCO89c" target="_blank" class="btn-vid"><span>▶</span> Video Execuție</a>'''
)

# Circuit 3
content = content.replace(
    '''<div class="ex-name">3. Heel Touches (Atingeri călcâie)</div>
              <div class="ex-cue">Pentru oblici.</div>
              <a href="#" class="btn-vid"><span>🎬</span> VIDEO EXECUȚIE</a>''',
    '''<div class="ex-name">3. Heel Touches (Atingeri călcâie)</div>
              <div class="ex-cue">Pentru oblici.</div>
              <a href="https://www.youtube.com/shorts/i-BBrCVNT9A" target="_blank" class="btn-vid"><span>▶</span> Video Execuție</a>'''
)

# Circuit 4
content = content.replace(
    '''<div class="ex-name">4. Triceps Floor Press (priză îngustă)</div>
              <div class="ex-cue">Ganterele lipite, coatele pe lângă corp, viteză.</div>
              <a href="#" class="btn-vid"><span>🎬</span> VIDEO EXECUȚIE</a>''',
    '''<div class="ex-name">4. Triceps Floor Press (priză îngustă)</div>
              <div class="ex-cue">Ganterele lipite, coatele pe lângă corp, viteză.</div>
              <a href="https://www.youtube.com/shorts/uGs1CACL4mw" target="_blank" class="btn-vid"><span>▶</span> Video Execuție</a>'''
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Ziua A updated with actual YouTube links")
