export type TeamSpotlightMember = {
  id: string;
  name: string;
  title: string;
  bio: string;
  img: string;
};

export const TEAM_MEMBERS: readonly TeamSpotlightMember[] = [
  {
    id: "hurrem",
    name: "Hürrem Can Koçyiğit",
    title: "CEO",
    bio: "The visionary founder and heart of the agency, Hürrem is an alumnus of Istanbul Erkek Lisesi and Boğaziçi University. He expertly balances serious business growth with a big brother vibe. When he's not architecting end-to-end marketing strategies, you'll find him making moves on a chessboard, diving into history, or staying active as an athlete.",
    img: "/assets/team/hurrem.webp",
  },
  {
    id: "ensar",
    name: "Ensar Koçak",
    title: "Head of Product",
    bio: "A fellow alumnus of Istanbul Erkek Lisesi and Boğaziçi University, Ensar is the engine behind our frictionless operations. He is a legendary pal who keeps the team laughing while managing product impact. A true cinephile at heart, he also enjoys spending his downtime on the golf course.",
    img: "/assets/team/ensar.webp",
  },
  {
    id: "dogac",
    name: "Uygar Doğaç Özdemir",
    title: "Head of Engineering",
    bio: "A graduate of Near East University, Doğaç is the technical powerhouse responsible for our immense engineering capacity. He's the ultimate friend and a joker who handles everything from code to complex integrations. Outside the dev environment, he's all about music.",
    img: "/assets/team/dogac.webp",
  },
  {
    id: "sefa",
    name: "Sefa Özkan",
    title: "Creative Director & Videographer",
    bio: "Sefa is a Bahçeşehir University graduate and a true artist who brings our state-of-the-art creative visions to life. A former academic with a great sense of humor, he's as skilled with a camera as he is with a clarinet. He ensures every video and piece of content we deliver is nothing short of a masterpiece.",
    img: "/assets/team/sefa.webp",
  },
  {
    id: "samet",
    name: "Samet Köksal",
    title: "Performance Marketer & Product Analyst",
    bio: "A Galatasaray University graduate, Samet is the data-driven mind behind our high-performance campaigns. He's a great fella whose friendship is as high-quality as his ad optimizations. When he isn't scaling Meta or Google Ads, he's likely bouldering or mastering new languages.",
    img: "/assets/team/samet.webp",
  },
] as const;
