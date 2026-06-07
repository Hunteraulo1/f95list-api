import { env } from '../config/env.js';

const publicApiUrl = process.env.API_PUBLIC_URL ?? 'https://api.f95france.site';
const dashboardApiKeysUrl =
  process.env.DASHBOARD_API_KEYS_URL ?? 'https://f95france.site/dashboard/api-keys';

const isProduction = process.env.NODE_ENV === 'production';

export const openApiDescription = `
Routes HTTP en **lecture seule** (méthode **GET**) sous \`/v1/*\`, avec en-tête CORS ouvert (\`*\`), destinées aux intégrations publiques. La sonde \`GET /health\` est accessible **sans authentification**.

**Télécharger la spécification OpenAPI :** [JSON](/json) · [YAML](/yaml)

### Authentification

Pour chaque opération décrite dans cette spécification (hors \`/health\`), la requête doit inclure une **clé API** valide, via **l'une** des options suivantes :

1. En-tête **\`Authorization\`** avec le schéma **\`Bearer\`** et la **clé complète** comme jeton (ex. préfixe \`f95ext_…\`).
2. En-tête **\`X-Api-Key\`** avec la même valeur.

Les clés sont créées dans le compte utilisateur ([Mes clés API](${dashboardApiKeysUrl})) ; elles portent le nom du compte propriétaire et un **quota de requêtes par minute** (compteur côté serveur). Pour relever ce plafond, **contactez un administrateur du site**. Réponse **\`429\`** si la limite par minute est dépassée.

Les appels avec clé se comportent comme si le **propriétaire** de la clé effectuait la requête (droits et données visibles alignés sur ce compte).

**Sans authentification valide :** réponse **\`401\`** (\`application/json\`, champ \`error\`).

### Usage

Utilisez l'API avec modération : un volume de requêtes trop élevé ou un comportement abusif peut entraîner l'application de **restrictions** (limitation de débit, blocage temporaire ou définitif, etc.) sans préavis.

**Documentation interactive (Swagger UI) :** [\`${publicApiUrl}/\`](${publicApiUrl}/)
`.trim();

export const openApiServers = [
  ...(isProduction
    ? []
    : [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Développement local',
        },
      ]),
  {
    url: publicApiUrl,
    description: 'Production',
  },
];
