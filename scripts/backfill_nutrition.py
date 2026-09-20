import os
import sys
import json
import requests
from datetime import datetime
import re
from io import BytesIO
import pytesseract
from PIL import Image

env = {}
with open('.env.local', 'r') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            key, val = line.split('=', 1)
            env[key] = val

SUPABASE_URL = env.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = env.get('SUPABASE_SERVICE_ROLE_KEY')

if not all([SUPABASE_URL, SUPABASE_KEY]):
    print('Missing API keys')
    sys.exit(1)

def get_journal_entries():
    url = f'{SUPABASE_URL}/rest/v1/client_journal?client_id=eq.11&type=eq.meal&label=ilike.*Mese*&select=id,label,photo_url,created_at'
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}'
    }
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    return resp.json()

def analyze_image(photo_url):
    try:
        img_resp = requests.get(photo_url)
        img_resp.raise_for_status()
        img = Image.open(BytesIO(img_resp.content))
        text = pytesseract.image_to_string(img)
        
        macro_matches = re.findall(r'(\d+)\s*g\s*/\s*(\d+)\s*g', text, re.IGNORECASE)
        cal_goal_match = re.search(r'(?:©|O)\s*(\d+)\s*kcal', text, re.IGNORECASE)
        if not cal_goal_match:
            cal_goal_match = re.search(r'^(\d+)\s*kcal', text, re.IGNORECASE | re.MULTILINE)
            
        consumat_match = re.search(r'Consumat\s*(\d+)', text, re.IGNORECASE)
        
        flat_text = text.replace(chr(10), ' ')
        activity_match = re.search(r'Activitati fizice.*?(\d+)\s*kcal', flat_text, re.IGNORECASE)
        
        macros = {
            "calories_goal": int(cal_goal_match.group(1)) if cal_goal_match else 1845,
            "calories_consumed": int(consumat_match.group(1)) if consumat_match else None,
            "protein_g": None,
            "protein_target": None,
            "carbs_g": None,
            "carbs_target": None,
            "fat_g": None,
            "fat_target": None,
            "activity_kcal": int(activity_match.group(1)) if activity_match else None
        }
        
        if len(macro_matches) >= 3:
            macros["protein_g"] = int(macro_matches[0][0])
            macros["protein_target"] = int(macro_matches[0][1])
            macros["carbs_g"] = int(macro_matches[1][0])
            macros["carbs_target"] = int(macro_matches[1][1])
            macros["fat_g"] = int(macro_matches[2][0])
            macros["fat_target"] = int(macro_matches[2][1])
            
        return macros
    except Exception as e:
        print(f'Eroare: {e}')
        return None

def save_nutrition_log(entry, macros):
    try:
        date_str = entry['created_at'][:10]
        log_data = {
            'client_id': 11,
            'log_date': date_str,
            'journal_entry_id': entry['id'],
            'calories_goal': macros.get('calories_goal'),
            'calories_consumed': macros.get('calories_consumed'),
            'protein_g': macros.get('protein_g'),
            'protein_target': macros.get('protein_target'),
            'carbs_g': macros.get('carbs_g'),
            'carbs_target': macros.get('carbs_target'),
            'fat_g': macros.get('fat_g'),
            'fat_target': macros.get('fat_target'),
            'activity_kcal': macros.get('activity_kcal'),
            'source': 'vision'
        }
        url = f'{SUPABASE_URL}/rest/v1/nutrition_logs'
        headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        }
        resp = requests.post(url, headers=headers, json=log_data)
        resp.raise_for_status()
        print(f'Salvat cu succes pentru {date_str}')
    except Exception as e:
        print(f'Eroare la salvare in baza de date pt {date_str}: {e}')

def main():
    print('Preluare intrari jurnal...')
    entries = get_journal_entries()
    print(f'S-au gasit {len(entries)} intrari de tip Mese.')
    for entry in entries:
        print(f'Procesare {entry["label"]} ({entry["created_at"]})...')
        macros = analyze_image(entry['photo_url'])
        if macros:
            print(f'Macros gasite: {macros}')
            save_nutrition_log(entry, macros)

if __name__ == "__main__":
    main()
