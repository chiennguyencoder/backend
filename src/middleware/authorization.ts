import { NextFunction, Request, Response } from 'express';
import { User } from '@/entities/user.entity';
import AppDataSource from '@/config/typeorm.config';
import { AuthRequest } from '@/types/auth-request';

// Interface for authenticated request with user data
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    userId: string;
    email: string;
    roles: string[];
    permissions: string[];
    [key: string]: any;
  };
}

// Helper: Lấy User ID từ BẤT KỲ phương thức auth nào (JWT hoặc Passport)
function getAuthUserId(req: Request): string | undefined {
  const authReq = req as AuthRequest;
  // 1. Lấy từ JWT (Email/Password)
  if (authReq.payload?.user_id) {
    return authReq.payload.user_id;
  }
  // 2. Lấy từ Passport (Google Login)
  if (authReq.user?.id) {
    return authReq.user.id;
  }
  return undefined;
}

// Helper function to check if user has specific role
function hasRole(userRoles: string[], role: string): boolean {
  return userRoles.includes(role);
}

// Helper function to check if user has any of the specified roles
function hasAnyRole(userRoles: string[], roles: string[]): boolean {
  return roles.some((role) => userRoles.includes(role));
}

// Helper function to check if user has all specified permissions
function hasAllPermissions(userPermissions: string[], permissions: string[]): boolean {
  return permissions.every((permission) => userPermissions.includes(permission));
}

// Helper function to load user with roles and permissions from database
async function loadUserPermissions(userId: string): Promise<{ roles: string[]; permissions: string[] } | null> {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'],
    });

    if (!user || !user.role) {
      return null;
    }

    const roles = user.role.map((role) => role.name);
    const permissions = user.role.flatMap((role) =>
      role.permissions ? role.permissions.map((permission) => permission.name) : []
    );

    const uniquePermissions = [...new Set(permissions)];

    return {
      roles,
      permissions: uniquePermissions,
    };
  } catch (error) {
    console.error('Error loading user permissions:', error);
    return null;
  }
}

// Middleware to load user roles and permissions into request
export const loadUserRoles = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const passportUserId = req.user?.id;

  if (!passportUserId) {
    return next();
  }

  try {
    const userPermissions = await loadUserPermissions(passportUserId);

    if (userPermissions && req.user) {
      req.user.roles = userPermissions.roles;
      req.user.permissions = userPermissions.permissions;
    } else if (req.user) {
      req.user.roles = [];
      req.user.permissions = [];
    }
  } catch (error) {
    console.error('Error in loadUserRoles middleware:', error);
    if (req.user) {
      req.user.roles = [];
      req.user.permissions = [];
    }
  }

  next();
};

// Role-based authorization middleware
export const requireRole = (allowedRoles: string | string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = getAuthUserId(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userPermissions = await loadUserPermissions(userId);

    if (!userPermissions) {
      return res.status(403).json({
        success: false,
        message: 'User roles not found',
      });
    }

    const { roles } = userPermissions;
    const allowedRolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const hasRequiredRole = hasAnyRole(roles, allowedRolesArray);

    if (!hasRequiredRole) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient role privileges',
        required: allowedRolesArray,
        current: roles,
      });
    }

    next();
  };
};

// Permission-based authorization middleware
export const requirePermission = (requiredPermissions: string | string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userPermissions = await loadUserPermissions(userId);

    if (!userPermissions) {
      return res.status(403).json({
        success: false,
        message: 'User permissions not found',
      });
    }

    const { permissions } = userPermissions;
    const permissionsArray = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    const hasRequiredPermissions = hasAllPermissions(permissions, permissionsArray);

    if (!hasRequiredPermissions) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: permissionsArray,
        current: permissions,
      });
    }

    next();
  };
};

// Combined role and permission authorization
export const requireRoleAndPermission = (allowedRoles: string | string[], requiredPermissions: string | string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userPermissions = await loadUserPermissions(userId);

    if (!userPermissions) {
      return res.status(403).json({
        success: false,
        message: 'User authorization data not found',
      });
    }

    const { roles, permissions } = userPermissions;

    // Check roles
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const hasRequiredRole = hasAnyRole(roles, rolesArray);

    if (!hasRequiredRole) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient role privileges',
        required: { roles: rolesArray, permissions: requiredPermissions },
        current: { roles, permissions },
      });
    }

    // Check permissions
    const permissionsArray = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    const hasRequiredPermissions = hasAllPermissions(permissions, permissionsArray);

    if (!hasRequiredPermissions) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: { roles: rolesArray, permissions: permissionsArray },
        current: { roles, permissions },
      });
    }

    next();
  };
};

// Resource owner authorization (user can only access their own resources)
export const requireOwnership = (resourceUserIdField: string = 'userId') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authUserId = getAuthUserId(req);

    if (!authUserId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userPermissions = await loadUserPermissions(authUserId);

    // Check if user is admin (admins can access any resource)
    if (userPermissions && hasRole(userPermissions.roles, 'admin')) {
      return next();
    }

    // Get resource user ID from params, body, or query
    const resourceUserId =
      req.params[resourceUserIdField] || req.body[resourceUserIdField] || req.query[resourceUserIdField];

    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: `Missing ${resourceUserIdField} in request`,
      });
    }

    if (authUserId !== resourceUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own resources',
      });
    }

    next();
  };
};

// Flexible authorization that accepts multiple conditions
export const authorize = (options: {
  roles?: string | string[];
  permissions?: string | string[];
  allowOwnership?: boolean;
  ownershipField?: string;
}) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authUserId = getAuthUserId(req);

    if (!authUserId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { roles, permissions, allowOwnership = false, ownershipField = 'userId' } = options;

    const userPermissions = await loadUserPermissions(authUserId);

    if (!userPermissions) {
      return res.status(403).json({
        success: false,
        message: 'User authorization data not found',
      });
    }

    const { roles: userRoles, permissions: userPerms } = userPermissions;

    // Check if user is admin (admins bypass most checks)
    if (hasRole(userRoles, 'admin')) {
      return next();
    }

    // Check ownership if allowed
    if (allowOwnership) {
      const resourceUserId = req.params[ownershipField] || req.body[ownershipField] || req.query[ownershipField];

      if (resourceUserId && authUserId === resourceUserId) {
        return next();
      }
    }

    // Check roles
    if (roles) {
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      const hasRequiredRole = hasAnyRole(userRoles, allowedRoles);

      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient role privileges',
          required: allowedRoles,
          current: userRoles,
        });
      }
    }

    // Check permissions
    if (permissions) {
      const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
      const hasRequiredPermissions = hasAllPermissions(userPerms, requiredPermissions);

      if (!hasRequiredPermissions) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: requiredPermissions,
          current: userPerms,
        });
      }
    }

    next();
  };
};

export default {
  loadUserRoles,
  requireRole,
  requirePermission,
  requireRoleAndPermission,
  requireOwnership,
  authorize,
};