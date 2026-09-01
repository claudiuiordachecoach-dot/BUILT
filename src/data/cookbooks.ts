// Cartea de rețete personalizată per client logat — sursă unică (folosită de
// /client/bonusuri și de butonul dedicat /client/retete din meniu).
export type CookbookEntry = { file: string; name: string; emoji: string };

export const PERSONAL_COOKBOOKS: Record<number, CookbookEntry> = {
  1: { file: "/Cartea_Retete_Alex.html", name: "Alex", emoji: "👨‍🍳" },
  2: { file: "/Cartea_Retete_Letitia.html", name: "Letitia", emoji: "👩‍🍳" },
  4: { file: "/Cartea_Retete_Ciprian.html", name: "Ciprian", emoji: "👨‍🍳" },
  5: { file: "/Cartea_Retete_Andrei.html", name: "Andrei", emoji: "👨‍🍳" },
  6: { file: "/Cartea_Retete_Claudia_v3.html", name: "Claudia 1460 kcal", emoji: "🥑" },
  9: { file: "/Cartea_Retete_Andy.html", name: "Andy", emoji: "👨‍🍳" },
  12: { file: "/Cartea_Retete_Nelu.html", name: "Nelu", emoji: "👨‍🍳" },
  13: { file: "/quickref/dana-nutritie.html", name: "Dana", emoji: "👩‍🍳" },
  14: { file: "/quickref/dana-nutritie.html", name: "Dana", emoji: "👩‍🍳" },
};
