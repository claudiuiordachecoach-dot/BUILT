"use server";

export async function transcribeVideoUrl(videoUrl: string): Promise<string> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) throw new Error("ASSEMBLYAI_API_KEY lipsă din environment variables.");

  const submitRes = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: {
      authorization: apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      audio_url: videoUrl,
      language_detection: true,
    }),
  });

  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`AssemblyAI submit error ${submitRes.status}: ${err}`);
  }

  const { id } = await submitRes.json();
  if (!id) throw new Error("AssemblyAI nu a returnat un ID de transcriere.");

  // Poll max 3 minute (36 × 5s)
  for (let i = 0; i < 36; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const statusRes = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
      headers: { authorization: apiKey },
    });
    const result = await statusRes.json();

    if (result.status === "completed") return result.text ?? "";
    if (result.status === "error") throw new Error(`AssemblyAI error: ${result.error}`);
  }

  throw new Error("AssemblyAI timeout — transcrierea a durat mai mult de 3 minute.");
}
