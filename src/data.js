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

// ─────────────────────────────────────────────────────────────────────────────
// MUSÉE : tout le texte du musée se modifie ici (survol, cartes, visite guidée).
// L'ordre du tableau est l'ordre de la visite guidée.
//   node    : nom du mesh dans public/models/musee.glb (ne pas changer)
//   hover   : petit message quand on survole l'objet
//   title / text / stat / links : contenu de la carte qui s'ouvre au clic
//   project : id d'un projet de PROJECTS (le bouton « Voir dans l'ordinateur » l'ouvre dans l'écran du PC)
//   photo   : image affichée en haut de la carte (fichier dans public/images/)
//   album   : photos affichées dans la carte, avec le lieu en légende (fichiers dans public/images/voyages/)
// ─────────────────────────────────────────────────────────────────────────────
export const MUSEUM = [
  {
    id: 'cinema', node: 'St_projecteur', group: 'Passion',
    title: 'Cinéma & montage',
    hover: 'Un projecteur et un clap. Moteur… action !',
    text: [
      'Petit, je voulais tout filmer. J’avais ma chaîne YouTube et j’y postais des sketchs en me prenant pour le prochain Gad Elmaleh.',
      'En grandissant, je suis tombé amoureux de la vidéo et de la photo. J’ai ensuite monté des vidéos pour des influenceurs à plusieurs millions d’abonnés. Ça marchait bien, mais le métier manquait de stabilité et me pesait mentalement, alors j’ai choisi d’arrêter.',
    ],
    links: [],
  },
  {
    id: 'musique', node: 'St_musique', group: 'Passion',
    title: 'Musique',
    hover: 'Une platine vinyle. Elle ne s’arrête jamais vraiment.',
    text: [
      'La musique m’accompagne du réveil jusqu’au coucher, c’est une de mes plus grandes passions.',
      'Quand je travaille, elle m’aide à me concentrer : je suis bien plus productif avec de la musique dans les oreilles que sans.',
    ],
    links: [],
  },
  {
    id: 'jeux', node: 'St_jeux', group: 'Passion',
    title: 'Jeux vidéo',
    hover: 'Une console et une manette. Encore une partie ?',
    text: [
      'Je suis de la génération Z, j’ai grandi avec les jeux vidéo. Je passais mes soirées avec les plus grands de ma famille, à jouer avec eux ou juste à les regarder.',
      'J’y ai fait mes plus belles rencontres. Je leur en suis reconnaissant, et ils gardent une petite place dans mon cœur.',
    ],
    links: [],
  },
  {
    id: 'voyages', node: 'St_voyages', group: 'Passion',
    title: 'Voyages',
    hover: 'Un avion miniature. Destination : ailleurs.',
    text: [
      'C’est là que je me sens le plus libre : arriver dans un endroit inconnu, loin de tout le monde, sans connaître personne, et explorer.',
      'J’en profite pour découvrir la culture, rencontrer des gens et décompresser. Ça me rappelle qu’on se met beaucoup trop de pression, moi le premier.',
    ],
    // Album : ajouter les photos dans public/images/voyages/ puis une ligne par photo, par exemple
    // (les 4 premières s'affichent aussi dans l'album posé sur le socle, format paysage conseillé)
    // { src: 'images/voyages/istanbul.jpg', place: 'Istanbul, Turquie' },
    album: [],
    links: [],
  },
  {
    id: 'weplay', node: 'St_weplay', group: 'Parcours',
    title: 'WePlayForCharity',
    hover: '72 heures de stream pour la bonne cause.',
    stat: '130 k€ récoltés en 3 éditions',
    photo: 'images/weplayforcharity.jpg',
    text: [
      'J’ai monté WePlayForCharity en 2023, à 17 ans, avec l’association Human Appeal. Le principe : réunir plusieurs créateurs de contenu pendant trois jours et streamer 72 heures sans interruption pour récolter un maximum de fonds, principalement pour la Palestine.',
      'J’en suis le fondateur principal et je dirigeais ma propre équipe. Sur un événement de cette taille, je n’avais pas le droit à l’erreur.',
      'Les dons de 2023 ont financé des puits, ceux de 2024 des habitations et des vêtements. En 2025, ils ont permis de distribuer 7 766 repas à Gaza.',
    ],
    links: [], // plus tard : { label: 'Le site de l’événement', href: 'https://…' }
  },
  {
    id: 'reseau', node: 'St_reseau', group: 'Parcours', project: 'reseau',
    title: 'Réseau',
    hover: 'Un switch, un routeur et des câbles bleus. Tout est branché, promis.',
    text: [
      'J’ai découvert le réseau en deuxième année de BUT MMI, parcours développement web, avec mes premières bases sur Cisco Packet Tracer.',
      'J’ai ensuite suivi un cours OpenClassrooms et continué seul avec des vidéos. Je n’ai pas fini d’apprendre.',
    ],
    links: [],
  },
  {
    id: 'linux', node: 'St_linux', group: 'Parcours', project: 'linux',
    title: 'Linux',
    hover: 'Une baie serveur. Les LED clignotent, donc tout va bien.',
    text: [
      'Au lycée, c’est moi qui ouvrais les serveurs de jeux multijoueur pour mes amis. Je faisais déjà du Linux et de l’Ubuntu sans vraiment m’en rendre compte.',
      'Cette année, avec Bandit d’OverTheWire, j’ai compris que j’avais plus que les bases. Je sais monter un environnement avec MariaDB, sécuriser la base de données et tout administrer à distance en SSH.',
    ],
    links: [],
  },
  {
    id: 'trophees', node: 'St_trophees', group: 'Parcours',
    title: 'Trophées',
    hover: 'Une vitrine. Les coupes dorées sont gagnées, les autres arrivent.',
    text: [
      'Chaque coupe correspond à une étape de mon apprentissage en cybersécurité. Les dorées sont validées, les autres sont celles que je vise ensuite.',
      'La dernière de la liste reste la plus importante : l’alternance signée.',
    ],
    links: [],
  },
  {
    id: 'alternance', node: 'Door', group: 'Prochaine étape',
    title: 'Et si la suite, c’était chez vous ?',
    hover: 'Une porte entrouverte. Derrière, mon alternance.',
    stat: 'Disponible en alternance dès janvier 2027',
    text: [
      'Je cherche une alternance en support informatique, systèmes ou réseaux, en Île-de-France, pendant mon Bachelor Cybersécurité à l’ESGI Paris.',
      'Le rythme : 3 semaines en entreprise, 1 semaine à l’école. Mon CV et mes contacts sont juste en dessous.',
    ],
    links: [
      { label: 'Mon CV', href: './CV_Arda_Nigiz.pdf' },
      { label: 'M’écrire', href: 'mailto:bryanigizarda@gmail.com' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/arda-nigiz-5984052a9/' },
    ],
  },
]
