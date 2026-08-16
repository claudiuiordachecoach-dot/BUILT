import requests
import json

URL = "https://kedfvtqbdlwhqmzggbls.supabase.co/rest/v1/clients?select=*"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlZGZ2dHFiZGx3aHFtemdnYmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODAwNzgyOCwiZXhwIjoyMDkzNTgzODI4fQ.X2XU7JmfGXLKN_c30G-NGcMT7vkKuh5J1yAx3mNeg2E"
headers = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}"
}

res = requests.get(URL, headers=headers)
clients = res.json()
for c in clients:
    name = c.get('name', '').lower()
    email = c.get('email', '').lower()
    if 'alexandru' in name or 'petrila' in name or 'petrila' in email:
        print(c.get('id'), c.get('name'), c.get('email'), c.get('status'))

