import { getClientId } from "@/app/client/actions";
import BonusuriClient, { type PersonalCookbook, type PersonalBonus } from "./BonusuriClient";

// Cartea de rețete personalizată e legată de clientul logat — nu o vede nimeni altcineva.
const PERSONAL_COOKBOOKS: Record<number, PersonalCookbook> = {
  1: { file: "/Cartea_Retete_Alex.html", name: "Alex", emoji: "👨‍🍳" },
  2: { file: "/Cartea_Retete_Letitia.html", name: "Letitia", emoji: "👩‍🍳" },
  4: { file: "/Cartea_Retete_Ciprian.html", name: "Ciprian", emoji: "👨‍🍳" },
  6: { file: "/Cartea_Retete_Claudia.html", name: "Claudia", emoji: "👩‍🍳" },
};

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
