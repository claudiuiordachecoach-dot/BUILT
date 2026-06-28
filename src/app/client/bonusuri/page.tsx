import { getClientId } from "@/app/client/actions";
import { PERSONAL_COOKBOOKS } from "@/data/cookbooks";
import BonusuriClient, { type PersonalBonus } from "./BonusuriClient";

// Ghiduri bonus personalizate pe contextul clientului logat.
const PERSONAL_BONUSES: Record<number, PersonalBonus[]> = {
  5: [
    { file: "/andrei-farfurie.html", title: "Ghidul Farfuriei", subtitle: "Cum îți construiești masa — cu gramaje exacte", emoji: "🍽" },
    { file: "/andrei-bucatarie.html", title: "Bucătăria de la Zero", subtitle: "5 tehnici + rețete pas cu pas", emoji: "👨‍🍳" },
    { file: "/andrei-etichete.html", title: "Cum Citești o Etichetă", subtitle: "4 lucruri, 10 secunde, oriunde", emoji: "🏷" },
  ],
};

export default async function BonusuriPage() {
  const clientId = await getClientId().catch(() => null);
  const personalCookbook = clientId != null ? PERSONAL_COOKBOOKS[clientId] ?? null : null;
  const personalBonuses = clientId != null ? PERSONAL_BONUSES[clientId] ?? [] : [];
  return <BonusuriClient personalCookbook={personalCookbook} personalBonuses={personalBonuses} />;
}
