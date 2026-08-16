const url = "https://kedfvtqbdlwhqmzggbls.supabase.co/rest/v1/clients?select=*";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlZGZ2dHFiZGx3aHFtemdnYmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODAwNzgyOCwiZXhwIjoyMDkzNTgzODI4fQ.X2XU7JmfGXLKN_c30G-NGcMT7vkKuh5J1yAx3mNeg2E";

fetch(url, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`
  }
}).then(res => res.json()).then(clients => {
  const matches = clients.filter(c => {
    const name = (c.name || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    return name.includes('alexandru') || name.includes('petrila') || email.includes('petrila');
  });
  console.log("Found:", matches.map(c => ({ id: c.id, name: c.name, email: c.email, status: c.status })));
});
