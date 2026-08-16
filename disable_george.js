const url = "https://kedfvtqbdlwhqmzggbls.supabase.co/rest/v1/clients";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlZGZ2dHFiZGx3aHFtemdnYmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODAwNzgyOCwiZXhwIjoyMDkzNTgzODI4fQ.X2XU7JmfGXLKN_c30G-NGcMT7vkKuh5J1yAx3mNeg2E";

async function disableGeorge() {
  // First find him
  const getRes = await fetch(`${url}?select=*`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  });
  const clients = await getRes.json();
  
  const george = clients.find(c => {
    const name = (c.name || '').toLowerCase();
    return name.includes('george') && name.includes('miclea');
  });

  if (!george) {
    console.log("Nu l-am găsit pe George Miclea în baza de date.");
    return;
  }

  console.log(`Găsit: ${george.name} (${george.email}). Status curent: ${george.status}`);

  // Update status to disabled
  const patchRes = await fetch(`${url}?id=eq.${george.id}`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ status: 'disabled' })
  });
  
  if (patchRes.ok) {
    const updated = await patchRes.json();
    console.log(`Actualizat cu succes. Noul status: ${updated[0].status}`);
  } else {
    console.error("Eroare la actualizare:", await patchRes.text());
  }
}

disableGeorge();
