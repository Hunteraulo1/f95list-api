/** Réponses HTTP documentées pour les routes v1. */

export const openApiErrorResponses = {
  badRequest: {
    description: 'Paramètres ou requête invalides.',
    $ref: 'ApiError#',
  },
  unauthorized: {
    description: 'Clé API absente, invalide ou expirée.',
    $ref: 'ApiError#',
  },
  notFound: {
    description: 'Ressource introuvable.',
    $ref: 'ApiError#',
  },
  tooManyRequests: {
    description: 'Quota de requêtes par minute dépassé.',
    $ref: 'ApiError#',
  },
  internalError: {
    description: 'Erreur serveur.',
    $ref: 'ApiError#',
  },
} as const;

const authenticatedErrors = {
  400: openApiErrorResponses.badRequest,
  401: openApiErrorResponses.unauthorized,
  429: openApiErrorResponses.tooManyRequests,
  500: openApiErrorResponses.internalError,
} as const;

const authenticatedDetailErrors = {
  ...authenticatedErrors,
  404: openApiErrorResponses.notFound,
} as const;

export const openApiRouteResponses = {
  listGames: {
    200: {
      description:
        'Tableau de jeux. Avec `include=translations`, chaque élément inclut un tableau `translations` trié par `updatedAt` décroissant.',
      oneOf: [
        { type: 'array', items: { $ref: 'Game#' } },
        { type: 'array', items: { $ref: 'GameWithTranslations#' } },
      ],
    },
    ...authenticatedErrors,
  },
  getGame: {
    200: {
      description: 'Jeu trouvé. Avec `include=translations`, un tableau `translations` est ajouté.',
      oneOf: [{ $ref: 'Game#' }, { $ref: 'GameWithTranslations#' }],
    },
    ...authenticatedDetailErrors,
  },
  listTranslations: {
    200: {
      description: 'Tableau de traductions trié par `updatedAt` décroissant.',
      type: 'array',
      items: { $ref: 'Translation#' },
    },
    ...authenticatedErrors,
  },
  getTranslation: {
    200: {
      description: 'Traduction trouvée.',
      $ref: 'Translation#',
    },
    ...authenticatedDetailErrors,
  },
  listTranslators: {
    200: {
      description: 'Tableau de traducteurs (projection publique).',
      type: 'array',
      items: { $ref: 'TranslatorPublic#' },
    },
    ...authenticatedErrors,
  },
  getTranslator: {
    200: {
      description: 'Traducteur trouvé (projection publique).',
      $ref: 'TranslatorPublic#',
    },
    ...authenticatedDetailErrors,
  },
  listUpdates: {
    200: {
      description:
        'Tableau de mises à jour. La forme dépend de `include` : par défaut entrée « slim » ; avec `game`, `translations` ou les deux, l’objet `game` est ajouté selon la variante documentée.',
      oneOf: [
        { type: 'array', items: { $ref: 'UpdateSlim#' } },
        { type: 'array', items: { $ref: 'UpdateWithEmbeddedGame#' } },
        { type: 'array', items: { $ref: 'UpdateWithGameTranslations#' } },
        { type: 'array', items: { $ref: 'UpdateWithFullGame#' } },
      ],
    },
    ...authenticatedErrors,
  },
  getUpdate: {
    200: {
      description: 'Mise à jour trouvée. Même logique de forme que la liste selon `include`.',
      oneOf: [
        { $ref: 'UpdateSlim#' },
        { $ref: 'UpdateWithEmbeddedGame#' },
        { $ref: 'UpdateWithGameTranslations#' },
        { $ref: 'UpdateWithFullGame#' },
      ],
    },
    ...authenticatedDetailErrors,
  },
  health: {
    200: {
      description: 'Application et base de données opérationnelles.',
      $ref: 'HealthOk#',
    },
    503: {
      description: 'Base de données inaccessible.',
      $ref: 'HealthUnavailable#',
    },
  },
} as const;
