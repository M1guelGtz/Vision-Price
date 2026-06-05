import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthError } from '../../../domain/errors/DomainError';
import { JwtVerifier } from '../../../infrastructure/auth/JwtVerifier';

declare module 'fastify' {
  interface FastifyRequest {
    auth?: { userId: string };
  }
}

export function buildAuthGuard(verifier: JwtVerifier) {
  return async function authGuard(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    const header = request.headers.authorization;
    if (typeof header !== 'string' || !header.toLowerCase().startsWith('bearer ')) {
      throw new AuthError('Missing or malformed Authorization header');
    }
    const token = header.slice(7).trim();
    if (token.length === 0) throw new AuthError('Missing access token');
    request.auth = verifier.verifyAccessToken(token);
  };
}
