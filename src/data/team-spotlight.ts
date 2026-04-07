export type TeamSpotlightMember = {
  id: string;
  name: string;
  title: string;
  bio: string;
  img: string;
};

export const TEAM_MEMBERS: readonly TeamSpotlightMember[] = [
  {
    id: "dogac",
    name: "Uygar Doğaç Özdemİr",
    title: "",
    bio: "",
    img: "/assets/team/dogac.webp",
  },
  {
    id: "hurrem",
    name: "Hürrem Can KoÇYİĞİT",
    title: "Growth Machine - CEO",
    bio: "Alumnus of Istanbul Erkek Lisesi and Boğaziçi University, business administrator, former treasurer, start-up aficionado, idea generator, athlete, humanist",
    img: "/assets/team/hurrem.webp",
  },
  {
    id: "samet",
    name: "Mustafa Samet Köksal",
    title: "",
    bio: "",
    img: "/assets/team/samet.webp",
  },
  {
    id: "ensar",
    name: "Ensar Koçak",
    title: "",
    bio: "",
    img: "/assets/team/ensar.webp",
  },
] as const;
