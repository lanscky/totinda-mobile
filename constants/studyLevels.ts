export const STUDY_LEVEL_GROUPS = [
  {
    title: "Enseignement Secondaire",
    options: ["Humanités (Diplôme d'État / Baccalauréat RDC)"],
  },
  {
    title: "Enseignement Supérieur – Système LMD (actuel)",
    options: [
      "Licence LMD (Bac +3)",
      "Master LMD (Bac +5)",
      "Doctorat LMD (Bac +8)",
    ],
  },
  {
    title: "Enseignement Supérieur – Système classique (ancien)",
    options: [
      "Graduat (Ancien système - Bac +3)",
      "Licence (Ancien système - Bac +5)",
    ],
  },
  {
    title: "Enseignement Technique et Professionnel",
    options: [
      "Brevet d'Aptitude Professionnelle (BAP)",
      "Brevet de Technicien (BT)",
    ],
  },
] as const;
