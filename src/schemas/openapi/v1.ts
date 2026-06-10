/** Descriptions OpenAPI v1 — alignées sur la spec publique f95-france. */

export const openApiQuery = {
  website: {
    type: 'string',
    maxLength: 32,
    description:
      'Code du site d’origine du jeu, comme dans le champ `website` de chaque jeu (ex. `f95z`, `lc`, `other`). Si absent, tous les jeux sont renvoyés.',
  },
  include: {
    type: 'string',
    description: `Ressources liées à inclure. Liste séparée par des virgules (insensible à la casse). Ex. \`translations,game\`.
- \`translations\` — sur **\`/api/v1/games\`** et **\`/api/v1/games/{id}\`** : ajoute \`translations\` sur le jeu. Sur **\`/api/v1/updates\`** et **\`/api/v1/updates/{id}\`** : ajoute \`translations\` **dans** l’objet \`game\` (jeu minimal \`id\` + \`translations\` si \`game\` n’est pas demandé ; sinon jeu enrichi + \`translations\`).
- \`game\` — sur **\`/api/v1/updates\`** et **\`/api/v1/updates/{id}\`** : enrichit l’objet \`game\` (moteurs, étiquettes, etc.). Peut se combiner avec : \`include=game,translations\`.`,
  },
  gameId: {
    type: 'string',
    format: 'uuid',
    description: 'Ne garde que les traductions liées à ce jeu (UUID).',
  },
  status: {
    type: 'string',
    maxLength: 32,
    description:
      'Égalité stricte sur le champ `status` (valeur telle qu’en base, p.ex. `in_progress`).',
  },
  gameType: {
    type: 'string',
    maxLength: 32,
    description: 'Égalité stricte sur le champ `gameType` (ex. `renpy`, `unity`, `other`).',
  },
  versionMatchesTversion: {
    type: 'string',
    enum: ['true', 'false', '1', '0', 'yes', 'no'],
    description: `\`true\` : \`version\` non nul et égal à \`tversion\`.
\`false\` : \`version\` nul ou différent de \`tversion\`.
Si absent, pas de filtre sur cette condition.`,
  },
  activeOnly: {
    type: 'string',
    description: `\`true\` (défaut si omis) : exclut les traducteurs/relecteurs sans traduction ni relecture de la réponse (\`tradCount\` ou \`readCount\` ≥ 1).
\`false\` : tous les profils en base.`,
  },
  tradCountMin: {
    type: 'string',
    description: 'Borne inférieure inclusive sur `tradCount` (entier ≥ 0).',
  },
  tradCountMax: {
    type: 'string',
    description: 'Borne supérieure inclusive sur `tradCount` (entier ≥ 0).',
  },
  readCountMin: {
    type: 'string',
    description: 'Borne inférieure inclusive sur `readCount` (entier ≥ 0).',
  },
  readCountMax: {
    type: 'string',
    description: 'Borne supérieure inclusive sur `readCount` (entier ≥ 0).',
  },
  hasDiscord: {
    type: 'string',
    description: `\`true\` : seulement les traducteurs avec un identifiant Discord (\`discordId\` non nul).
\`false\` : seulement ceux sans \`discordId\`.
Si omis, la réponse inclut les deux cas.`,
  },
  limit: {
    type: 'integer',
    minimum: 1,
    maximum: 200,
    description: 'Nombre max d’entrées (1–200, défaut 50).',
  },
  scope: {
    type: 'string',
    enum: ['featured', 'all'],
    description: `Portée des résultats. Par défaut (\`featured\`) : uniquement les ajouts de jeu/traduction (statut \`adding\`) ou les mises à jour avec changement de version (\`version\` ou \`tversion\` dans l’historique). \`all\` : toutes les entrées de la table \`update\`.`,
  },
  startDate: {
    type: 'string',
    description: `Borne inférieure **inclusive** sur la date de création de l’entrée (\`updateCreatedAt\`).
ISO 8601 complet ou date seule \`AAAA-MM-JJ\` (interprétée en **minuit UTC**). Ex. \`2024-01-15\`.`,
  },
  endDate: {
    type: 'string',
    description: `Borne supérieure **inclusive** sur \`updateCreatedAt\`.
ISO 8601 complet ou date seule \`AAAA-MM-JJ\` (journée entière jusqu’à **23:59:59.999 UTC**). Ex. \`2024-01-31\`.`,
  },
} as const;

export const openApiParams = {
  uuidId: {
    type: 'string',
    format: 'uuid',
    description: 'Identifiant UUID.',
  },
} as const;

export const openApiOperations = {
  listGames: {
    summary: 'Liste des jeux',
    description:
      'Tableau de jeux. Filtre optionnel : `website` restreint aux jeux dont le code site correspond (ex. `f95z`, `lc`). Avec `include=translations`, chaque jeu inclut ses traductions triées par `updatedAt` décroissant.',
  },
  getGame: {
    summary: 'Détail d’un jeu',
    description:
      'Jeu trouvé. Avec `include=translations`, les traductions associées sont triées par `updatedAt` décroissant.',
  },
  listTranslations: {
    summary: 'Liste des traductions',
    description: `Sans filtre, retourne toutes les lignes triées par \`updatedAt\` décroissant.

Filtres optionnels (combinés en **ET**) : \`gameId\`, \`status\`, \`gameType\`, \`versionMatchesTversion\`.
\`versionMatchesTversion=true\` : uniquement les lignes où \`version\` est renseigné et égal à \`tversion\` (traduction alignée sur la version du jeu au sens stocké en base).
\`versionMatchesTversion=false\` : le contraire (\`version\` nul ou différent de \`tversion\`).`,
  },
  getTranslation: {
    summary: 'Détail d’une traduction',
    description: 'Traduction trouvée.',
  },
  listTranslators: {
    summary: 'Liste des traducteurs (projection publique)',
    description: `Champs exposés : identifiant, nom, Discord, pages, compteurs, dates. La liaison interne \`userId\` n’est pas renvoyée.

Filtres optionnels sur les compteurs : \`tradCountMin\` / \`tradCountMax\` / \`readCountMin\` / \`readCountMax\` (entiers ≥ 0, bornes inclusives). Les compteurs sont calculés à la volée depuis \`game_translation\`.
\`hasDiscord=true\` : uniquement les traducteurs avec \`discordId\` ; \`hasDiscord=false\` : sans \`discordId\`.

Par défaut, \`activeOnly=true\` : uniquement les profils avec au moins une traduction ou relecture (\`tradCount\` ou \`readCount\` ≥ 1). Passez \`activeOnly=false\` pour lister tous les profils.`,
  },
  getTranslator: {
    summary: 'Détail d’un traducteur (projection publique)',
    description: 'Traducteur trouvé (même projection publique que la liste).',
  },
  listUpdates: {
    summary: 'Dernières mises à jour',
    description: `Par défaut (\`scope=featured\`) : ajouts ou changements de version uniquement. \`scope=all\` : toutes les mises à jour enregistrées.

Par défaut : champs de la mise à jour et \`gameId\`.
\`include=game\` : ajoute un objet \`game\` enrichi (sans tableau \`translations\` dans \`game\`).
\`include=translations\` : ajoute un objet \`game\` minimal (clés \`id\` et \`translations\` dans \`game\`, sans les autres champs enrichis).
\`include=game,translations\` : \`game\` enrichi avec \`translations\` à l’intérieur de \`game\`.

Filtre optionnel : \`startDate\` / \`endDate\` restreignent les entrées selon \`updateCreatedAt\` (bornes inclusives).`,
  },
  getUpdate: {
    summary: 'Détail d’une mise à jour',
    description:
      'Même logique que la liste : les traductions sont toujours dans l’objet `game` ; avec seul `include=translations`, `game` ne contient que les clés `id` et `translations`.',
  },
} as const;
