import type { FastifyReply } from 'fastify';

export function apiError(reply: FastifyReply, status: number, message: string) {
  return reply.status(status).send({ error: message });
}

export const methodNotAllowed = {
  post: (reply: FastifyReply) => apiError(reply, 405, 'Méthode non autorisée.'),
  put: (reply: FastifyReply) => apiError(reply, 405, 'Méthode non autorisée.'),
};
