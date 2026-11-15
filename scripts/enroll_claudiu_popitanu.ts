import { createClient } from "@supabase/supabase-js";
import path from "path";
import process from "process";

try {
  process.loadEnvFile(path.resolve(process.cwd(), ".env.local"));
} catch (err) {
  console.log("Nu s-a putut încărca automat .env.local cu loadEnvFile");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Lipsesc variabilele de mediu pentru Supabase.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function enrollClaudiu() {
  const email = "claudiupopitanu123@gmail.com";
  const fullName = "Claudiu Popițanu";
  const password = "ClaudiuBuilt2026!";
  const clientId = 15;

  console.log(`=== ÎNROLARE CLIENT NOU: ${fullName} (${email}) ===`);

  // 1. Verificare / Creare Auth User
  let authUserId: string | null = null;
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Eroare la listUsers:", listError.message);
  }

  const existingUser = usersData?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (existingUser) {
    console.log(`Userul Auth există deja: ${existingUser.id}. Îi actualizăm parola și metadata...`);
    authUserId = existingUser.id;
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      {
        password: password,
        email_confirm: true,
        user_metadata: { name: fullName, client_id: clientId },
      }
    );
    if (updateError) {
      console.error("Eroare la update user:", updateError.message);
    } else {
      console.log("Parolă și metadata actualizate cu succes.");
    }
  } else {
    console.log(`Creăm contul Auth pentru ${email}...`);
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { name: fullName, client_id: clientId },
    });

    if (createError) {
      console.error("Eroare la createUser:", createError.message);
      return;
    }
    authUserId = newUser.user.id;
    console.log(`Cont Auth creat cu succes! ID: ${authUserId}`);
  }

  if (!authUserId) {
    console.error("Nu avem authUserId. Oprim procesul.");
    return;
  }

  // 2. Asigurare profil în tabela `profiles`
  console.log("Verificăm / actualizăm tabela `profiles`...");
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: authUserId,
      role: "client",
      full_name: fullName,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    console.error("Eroare la salvare profil:", profileError.message);
  } else {
    console.log("Profil confirmat: role = 'client'.");
  }

  // 3. Actualizare înregistrare în tabela `clients`
  console.log(`Actualizăm clientul ID ${clientId} în tabela clients...`);
  const { data: clientUpdate, error: clientError } = await supabase
    .from("clients")
    .update({
      name: fullName,
      email: email,
      auth_user_id: authUserId,
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", clientId)
    .select()
    .single();

  if (clientError) {
    console.error("Eroare la actualizare client:", clientError.message);
  } else {
    console.log("Client actualizat cu succes:", clientUpdate.name, clientUpdate.email, clientUpdate.status);
  }

  // 4. Verificare dacă trimitem un mesaj de bun venit în chat
  console.log("Verificăm mesajul de bun venit...");
  const { data: existingMessages } = await supabase
    .from("client_messages")
    .select("id")
    .eq("client_id", clientId)
    .limit(1);

  if (!existingMessages || existingMessages.length === 0) {
    const welcomeMsg = `Salut Claudiu! Bine ai venit în BUILT.

Contul tău este configurat și activ. Am analizat răspunsurile tale din Fișa de Start (105 kg, 187 cm, obiectiv recompoziție și forță, antrenament sală 3 zile/săptămână).

Primii pași:
1. Parcurge ghidul Onboarding din Dashboard.
2. Începe să-ți loghezi zilnic mesele și pașii în secțiunea Jurnal.
3. Eu îți pregătesc planul personalizat de nutriție și antrenament.

Dacă ai orice întrebare, îmi poți scrie direct aici. Let's build!`;

    const { error: msgError } = await supabase.from("client_messages").insert({
      client_id: clientId,
      sender: "admin",
      content: welcomeMsg,
    });

    if (msgError) {
      console.error("Eroare la salvare mesaj bun venit:", msgError.message);
    } else {
      console.log("Mesaj de bun venit trimis cu succes în chat-ul clientului.");
    }
  } else {
    console.log("Clientul are deja mesaje în chat.");
  }

  console.log("\n==========================================");
  console.log("✅ ÎNROLARE FINALIZATĂ CU SUCCES!");
  console.log(`URL Login: https://built-ai-command-center.vercel.app/login`);
  console.log(`Email: ${email}`);
  console.log(`Parolă setată: ${password}`);
  console.log(`Client ID: ${clientId}`);
  console.log("==========================================");
}

enrollClaudiu().catch((err) => {
  console.error("Eroare neașteptată:", err);
});

