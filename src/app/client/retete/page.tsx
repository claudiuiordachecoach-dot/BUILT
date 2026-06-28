import { redirect } from "next/navigation";
import { getClientId } from "@/app/client/actions";
import { PERSONAL_COOKBOOKS } from "@/data/cookbooks";

// Buton dedicat din meniu → deschide direct cartea de rețete a clientului logat.
// Dacă nu are carte, îl ducem la bonusuri (graceful).
export default async function ReteteRedirect({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const sp = await searchParams;
  let clientId: number | null = sp?.clientId ? Number(sp.clientId) : null;
  if (clientId == null) clientId = await getClientId().catch(() => null);
  const cb = clientId != null ? PERSONAL_COOKBOOKS[clientId] : null;
  redirect(cb ? cb.file : "/client/bonusuri");
}
