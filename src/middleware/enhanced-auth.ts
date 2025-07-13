import { FastifyRequest, FastifyReply } from "fastify";
import { AppError, ErrorCode, JwtPayload } from "../types/common";
import { loggerService } from "../services/logger.service";
import { cacheService } from "../services/cache.service";

export async function enhancedAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const requestId = request.headers['x-request-id'] as string;
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        ErrorCode.AUTHENTICATION_ERROR,
        "Missing or invalid authorization header",
        401
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      throw new AppError(
        ErrorCode.AUTHENTICATION_ERROR,
        "Missing authentication token",
        401
      );
    }

    // Check if token is blacklisted (cached)
    const isBlacklisted = await cacheService.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new AppError(
        ErrorCode.AUTHENTICATION_ERROR,
        "Token has been revoked",
        401
      );
    }

    // Verify JWT token
    try {
      await request.jwtVerify();
    } catch (jwtError) {
      loggerService.warn("JWT verification failed", {
        requestId,
        action: 'jwt_verification_failed',
        metadata: { error: (jwtError as Error).message },
      });

      throw new AppError(
        ErrorCode.AUTHENTICATION_ERROR,
        "Invalid or expired token",
        401
      );
    }

    // Get user from Supabase
    const { data: userData, error: userError } = await request.server.supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new AppError(
        ErrorCode.AUTHENTICATION_ERROR,
        "Invalid user session",
        401
      );
    }

    // Cache user data for performance
    const cacheKey = `user:${userData.user.id}`;
    let cachedUser = await cacheService.get(cacheKey);
    
    if (!cachedUser) {
      const { data: userProfile, error: profileError } = await request.server.supabase
        .from('users')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (profileError) {
        loggerService.warn("User profile not found", {
          requestId,
          action: 'user_profile_missing',
          metadata: { userId: userData.user.id },
        });
      }

      cachedUser = {
        id: userData.user.id,
        email: userData.user.email,
        roles: userData.user.app_metadata?.roles || ['user'],
        profile: userProfile,
      };

      await cacheService.set(cacheKey, cachedUser, 300); // Cache for 5 minutes
    }

    // Enhance request with user data
    request.user = {
      sub: cachedUser.id,
      email: cachedUser.email,
      roles: cachedUser.roles,
      profile: cachedUser.profile,
    } as JwtPayload;

    loggerService.debug("Authentication successful", {
      requestId,
      userId: cachedUser.id,
      action: 'authentication_success',
      metadata: { roles: cachedUser.roles },
    });

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    loggerService.error("Authentication middleware error", error as Error, {
      requestId: request.headers['x-request-id'] as string,
      action: 'authentication_error',
    });

    throw new AppError(
      ErrorCode.AUTHENTICATION_ERROR,
      "Authentication failed",
      401
    );
  }
}

export function enhancedRestrictTo(allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const requestId = request.headers['x-request-id'] as string;
    
    if (!request.user) {
      throw new AppError(
        ErrorCode.AUTHENTICATION_ERROR,
        "User not authenticated",
        401
      );
    }

    const userRoles = request.user.roles || [];
    const hasPermission = allowedRoles.some(role => userRoles.includes(role));

    if (!hasPermission) {
      loggerService.warn("Authorization failed", {
        requestId,
        userId: request.user.sub,
        action: 'authorization_failed',
        metadata: {
          userRoles,
          requiredRoles: allowedRoles,
          resource: request.url,
        },
      });

      throw new AppError(
        ErrorCode.AUTHORIZATION_ERROR,
        "Insufficient permissions",
        403,
        {
          requiredRoles: allowedRoles,
          userRoles,
        }
      );
    }

    loggerService.debug("Authorization successful", {
      requestId,
      userId: request.user.sub,
      action: 'authorization_success',
      metadata: { roles: userRoles },
    });
  };
}

// Token blacklist functionality
export async function blacklistToken(token: string): Promise<void> {
  try {
    // Extract expiry from token to set appropriate TTL
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const ttl = payload.exp ? payload.exp - Math.floor(Date.now() / 1000) : 3600;
    
    await cacheService.set(`blacklist:${token}`, true, ttl);
  } catch (error) {
    loggerService.error("Failed to blacklist token", error as Error);
  }
}