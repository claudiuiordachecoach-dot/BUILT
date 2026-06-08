import { getClientByToken } from "./actions";
import IntakeForm from "./IntakeForm";

export const dynamic = "force-dynamic";

export default async function FisaStartPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const client = await getClientByToken(token);

  if (!client) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-8">
        <p className="text-zinc-500 text-center">
          Link invalid sau expirat. Scrie-i lui Claudiu pe WhatsApp pentru unul nou.
        </p>
      </main>
    );
  }

  const firstName = client.name.trim().split(/\s+/)[0];
  return <IntakeForm token={token} firstName={firstName} />;
}
