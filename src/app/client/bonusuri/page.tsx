import { getClientId } from "@/app/client/actions";
import BonusuriClient, { type PersonalCookbook } from "./BonusuriClient";

// Cartea de rețete personalizată e legată de clientul logat — nu o vede nimeni altcineva.
const PERSONAL_COOKBOOKS: Record<number, PersonalCookbook> = {
  1: { file: "/Cartea_Retete_Alex.html", name: "Alex", emoji: "👨‍🍳" },
  6: { file: "/Cartea_Retete_Claudia.html", name: "Claudia", emoji: "👩‍🍳" },
};

export default async function BonusuriPage() {
  const clientId = await getClientId().catch(() => null);
  const personalCookbook = clientId != null ? PERSONAL_COOKBOOKS[clientId] ?? null : null;
  return <BonusuriClient personalCookbook={personalCookbook} />;
}
