import jwt, { JwtPayload } from 'jsonwebtoken';

import { AuthError } from '../../domain/errors/DomainError';

/**
 * Verifies access tokens issued by auth-service.
 *
 * This service does NOT issue tokens; it only validates them using the
 * same secret. The token's `sub` claim is the authenticated userId, used
 * downstream as the `ownerId` and the `actorId` in use cases.
 */
export class JwtVerifier {
  public constructor(private readonly accessSecret: string) {}

  public verifyAccessToken(token: string): { userId: string } {
    let decoded: string | JwtPayload;
    try {
      decoded = jwt.verify(token, this.accessSecret);
    } catch {
      throw new AuthError('Invalid or expired token');
    }
    if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
      throw new AuthError('Malformed token payload');
    }
    return { userId: decoded.sub };
  }
}
