// Contenu du portfolio : tout le texte est ici pour pouvoir le modifier sans toucher au code.

export const PROFILE = {
  name: 'Arda Nigiz',
  title: 'Support IT, Réseaux & Cybersécurité',
  tagline: "En recherche d'alternance dès janvier 2027",
  email: 'bryanigizarda@gmail.com',
  github: 'https://github.com/tjrardaa',
  linkedin: 'https://www.linkedin.com/in/arda-nigiz-5984052a9/',
  cv: './CV_Arda_Nigiz.pdf',
  location: 'Créteil, Île-de-France',
  about: [
    "J'ai pour projet de devenir pentester, c'est pourquoi j'intègre le Bachelor Cybersécurité de l'ESGI Paris en janvier 2027, en alternance.",
    "Après deux années de BUT MMI en développement web, je me suis tourné vers la cybersécurité. Je développe mes compétences en systèmes, réseaux et sécurité à travers des projets et de l'autoformation.",
    "Je cherche une alternance en support informatique, réseaux ou systèmes : le meilleur endroit pour apprendre les bases solides dont un pentester a besoin.",
  ],
  facts: [
    ['Je cherche', 'Alternance support IT, systèmes, réseaux'],
    ['Rythme', '3 semaines en entreprise, 1 semaine à l’école'],
    ['Début', 'Janvier 2027'],
    ['Lieu', 'Île-de-France'],
  ],
}

export const PROJECTS = [
  {
    id: 'bandit',
    title: 'OverTheWire Bandit',
    meta: 'Linux · SSH · Bash · oct. 2026',
    summary: 'Wargame Linux en ligne : niveaux 0 à 10 résolus en ligne de commande.',
    points: [
      'Connexion SSH à un serveur distant, un niveau après l’autre.',
      'Fichiers cachés, recherche multicritère avec find, filtrage avec grep, sort, uniq et strings.',
      'Décodage de données (Base64).',
    ],
  },
  {
    id: 'linux',
    title: 'Administration de serveurs Linux',
    meta: 'Ubuntu Server · MariaDB · SSH · projet personnel',
    summary: 'Installation et gestion de serveurs Ubuntu pour héberger des serveurs de jeux en ligne.',
    points: [
      'Installation et configuration de serveurs Ubuntu.',
      'Déploiement de serveurs de jeux et de bases de données MariaDB.',
      'Gestion des services et accès à distance.',
    ],
  },
  {
    id: 'reseau',
    title: 'Réseaux sous Cisco Packet Tracer',
    meta: 'Cisco · TCP/IP · BUT MMI et OpenClassrooms',
    summary: 'Conception et configuration de réseaux simulés avec switchs et routeurs Cisco.',
    points: ['Adressage IP et routage entre réseaux.', 'Services DHCP et DNS.', 'Modèle OSI et pile TCP/IP.'],
  },
  {
    id: 'unity',
    title: 'Jeu de plateforme 2D',
    meta: 'C# · Unity 6 · projet à deux',
    summary: 'Un jeu de plateforme réalisé en cours, à deux, avec Unity et C#.',
    points: [
      'Déplacements du joueur (double saut, coyote time), ennemis et pièges.',
      'Gestion des scènes et du son, communication par ScriptableObjects.',
      'Travail à deux sur le même code avec Git.',
    ],
    link: 'https://github.com/tjrardaa/SAE402',
  },
  {
    id: 'php',
    title: 'Site dynamique avec back-office',
    meta: 'PHP · MySQL · groupe de 4',
    summary: 'Un site public avec un back-office d’administration (articles, auteurs, messages).',
    points: [
      'Création, modification et suppression des articles et des auteurs.',
      'Page de connexion et gestion des messages du formulaire de contact.',
      'Gestion des clés étrangères à la suppression.',
    ],
  },
  {
    id: 'portfolio',
    title: 'Ce portfolio',
    meta: 'React · Three.js · GitHub Pages',
    summary: 'Un bureau en 3D au milieu d’un musée, avec un ordinateur qui démarre pour de vrai.',
    points: ['Scène 3D construite en code (react-three-fiber).', 'Un système de fenêtres et un terminal qui pilote la scène.', 'Mode jour et mode nuit.'],
    link: 'https://github.com/tjrardaa/tjrardaa.github.io',
  },
]

export const SKILLS = [
  ['Systèmes', 'Linux (Ubuntu Server) · MariaDB · VirtualBox · Docker'],
  ['Réseaux', 'Modèle OSI · TCP/IP · Routage · DHCP · DNS · Cisco (Packet Tracer) · SSH'],
  ['Cybersécurité', 'OverTheWire Bandit (niveaux 0 à 10) · TryHackMe · Root-Me'],
  ['Développement', 'HTML · CSS · JavaScript · PHP · Python · C# · SQL'],
  ['Outils', 'Git / GitHub · VS Code · PuTTY · Packet Tracer'],
]

// Ajouter got: true et date pour débloquer un trophée
export const TROPHIES = [
  { name: 'Bandit niveau 10', desc: 'OverTheWire Bandit, niveaux 0 à 10.', got: true, date: '29/10/2026' },
  { name: 'Pre Security', desc: 'Parcours TryHackMe Pre Security.' },
  { name: '5 challenges Root-Me', desc: 'Cinq challenges validés sur Root-Me.' },
  { name: 'Badge Cisco', desc: 'Un cours Cisco Networking Academy.' },
  { name: 'Home lab', desc: 'Un labo virtuel monté et documenté.' },
  { name: 'Premier write-up', desc: 'Un compte rendu publié sur GitHub.' },
  { name: 'Lab PortSwigger', desc: 'Un premier lab Web Security Academy.' },
  { name: 'Alternance signée', desc: 'Le plus important.' },
]
