export type Service = {
  name: string;
  price: string;
  duration: string;
  description: string;
  includes: string[];
};

export const services: Service[] = [
  {
    name: "Knippen",
    price: "€ 00",
    duration: "30 min",
    description:
      "Een strak, persoonlijk kapsel. Advies vooraf, precisie tijdens, styling na afloop.",
    includes: ["Intake & advies", "Knippen op maat", "Nekafwerking", "Styling"],
  },
  {
    name: "Knippen + Baard",
    price: "€ 00",
    duration: "45 min",
    description:
      "De volledige behandeling. Kapsel en baardlijn perfect op elkaar afgestemd.",
    includes: ["Intake & advies", "Knippen op maat", "Baard modelleren", "Warme doek"],
  },
  {
    name: "Baard",
    price: "€ 00",
    duration: "20 min",
    description:
      "Trimmen, modelleren en scheren met warme doek. Scherpe lijnen, verzorgde finish.",
    includes: ["Baard trimmen", "Contouren scheren", "Warme doek", "Verzorging"],
  },
];

export const openingHours = [
  { day: "Maandag", time: "Gesloten" },
  { day: "Dinsdag – Vrijdag", time: "09:00 – 18:00" },
  { day: "Zaterdag", time: "09:00 – 17:00" },
  { day: "Zondag", time: "Gesloten" },
];
