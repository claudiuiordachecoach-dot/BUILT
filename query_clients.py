import os
import requests

url = "https://kedfvtqbdlwhqmzggbls.supabase.co/rest/v1/clients?select=id,name,email"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlZGZ2dHFiZGx3aHFtemdnYmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODAwNzgyOCwiZXhwIjoyMDkzNTgzODI4fQ.X2XU7JmfGXLKN_c30G-NGcMT7vkKuh5J1yAx3mNeg2E",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlZGZ2dHFiZGx3aHFtemdnYmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODAwNzgyOCwiZXhwIjoyMDkzNTgzODI4fQ.X2XU7JmfGXLKN_c30G-NGcMT7vkKuh5J1yAx3mNeg2E"
}

response = requests.get(url, headers=headers)
print(response.json())
