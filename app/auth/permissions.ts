import { Session } from 'next-auth';

// Define user roles
export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

// Define permission levels
export enum PermissionLevel {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin'
}

// Define actions (alias de PermissionLevel para mantener compatibilidad con código existente)
export const ACTIONS = PermissionLevel;

// Define resources
export const RESOURCES = {
  CENTERS: 'centers', // New resource for Centers
  USERS: 'users',
  ROLES: 'roles',
  DOCUMENTS: 'documents',
  SETTINGS: 'settings',
  FICHAS: 'fichas',
  HISTORY: 'history',
  FINANCES: 'finances',
  REPORTS: 'reports'
};

export type Permission = {
  resource: string;
  level: PermissionLevel;
};

// Permission matrix defining what roles have access to which resources
const PERMISSIONS: Record<UserRole, Record<string, PermissionLevel[]>> = {
  [UserRole.SUPERADMIN]: {
    // El superadmin tiene todos los permisos en todos los recursos
    '*': [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.DELETE, PermissionLevel.ADMIN]
  },
  [UserRole.ADMIN]: {
    [RESOURCES.CENTERS]: [], // Los admin normales no tienen permisos en centros
    [RESOURCES.USERS]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.DELETE, PermissionLevel.ADMIN],
    [RESOURCES.ROLES]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.DELETE, PermissionLevel.ADMIN],
    [RESOURCES.DOCUMENTS]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.DELETE, PermissionLevel.ADMIN],
    [RESOURCES.SETTINGS]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.DELETE, PermissionLevel.ADMIN],
    [RESOURCES.FICHAS]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.DELETE, PermissionLevel.ADMIN],
    [RESOURCES.HISTORY]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.DELETE, PermissionLevel.ADMIN],
    [RESOURCES.FINANCES]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.DELETE, PermissionLevel.ADMIN],
    [RESOURCES.REPORTS]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.DELETE, PermissionLevel.ADMIN],
  },
  [UserRole.MANAGER]: {
    [RESOURCES.CENTERS]: [], 
    [RESOURCES.USERS]: [PermissionLevel.READ, PermissionLevel.WRITE],
    [RESOURCES.ROLES]: [PermissionLevel.READ],
    [RESOURCES.DOCUMENTS]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.DELETE, PermissionLevel.ADMIN],
    [RESOURCES.SETTINGS]: [PermissionLevel.READ, PermissionLevel.WRITE],
    [RESOURCES.FICHAS]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.DELETE, PermissionLevel.ADMIN],
    [RESOURCES.HISTORY]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.DELETE],
    [RESOURCES.FINANCES]: [PermissionLevel.READ, PermissionLevel.WRITE],
    [RESOURCES.REPORTS]: [PermissionLevel.READ, PermissionLevel.WRITE],
  },
  [UserRole.EDITOR]: {
    [RESOURCES.CENTERS]: [],
    [RESOURCES.USERS]: [PermissionLevel.READ],
    [RESOURCES.ROLES]: [PermissionLevel.READ],
    [RESOURCES.DOCUMENTS]: [PermissionLevel.READ, PermissionLevel.WRITE],
    [RESOURCES.SETTINGS]: [PermissionLevel.READ, PermissionLevel.WRITE],
    [RESOURCES.FICHAS]: [PermissionLevel.READ, PermissionLevel.WRITE],
    [RESOURCES.HISTORY]: [PermissionLevel.READ],
    [RESOURCES.FINANCES]: [PermissionLevel.READ],
    [RESOURCES.REPORTS]: [PermissionLevel.READ],
  },
  [UserRole.VIEWER]: {
    [RESOURCES.CENTERS]: [],
    [RESOURCES.USERS]: [],
    [RESOURCES.ROLES]: [],
    [RESOURCES.DOCUMENTS]: [],
    [RESOURCES.SETTINGS]: [],
    [RESOURCES.FICHAS]: [],
    [RESOURCES.HISTORY]: [],
    [RESOURCES.FINANCES]: [],
    [RESOURCES.REPORTS]: [],
  },
};

// Type for user with role
interface UserWithRole {
  role?: UserRole;
  [key: string]: any;
}

/**
 * Check if a user has permission for a specific resource and permission level
 * This function supports two overloads:
 * 1. Check against array of permissions
 * 2. Check against user role using the PERMISSIONS matrix
 */
export function hasPermission(userPermissions: Permission[], requiredPermission: Permission): boolean;
export function hasPermission(user: UserWithRole, resource: string, requiredPermission: PermissionLevel): boolean;
export function hasPermission(...args: any[]): boolean {
  // Handle the first overload: (userPermissions, requiredPermission)
  if (args.length === 2 && Array.isArray(args[0])) {
    const [userPermissions, requiredPermission] = args as [Permission[], Permission];
    
    // Admin users have all permissions
    if (userPermissions.some(p => p.resource === '*' && p.level === PermissionLevel.ADMIN)) {
      return true;
    }
    
    return userPermissions.some(permission => {
      // Exact match for resource and level
      if (permission.resource === requiredPermission.resource && 
          permission.level === requiredPermission.level) {
        return true;
      }
      
      // ADMIN level for this resource grants all permissions for the resource
      if (permission.resource === requiredPermission.resource && 
          permission.level === PermissionLevel.ADMIN) {
        return true;
      }
      
      // Wildcard resource with matching level
      if (permission.resource === '*' && 
          permission.level === requiredPermission.level) {
        return true;
      }
      
      return false;
    });
  }
  // Handle the second overload: (user, resource, requiredPermission)
  else if (args.length === 3 && typeof args[1] === 'string') {
    const [user, resource, requiredPermission] = args as [UserWithRole, string, PermissionLevel];
    
    // Default to viewer if no role is specified
    const role = user.role || UserRole.VIEWER;
    
    // Superadmin tiene acceso total a todos los recursos
    if (role === UserRole.SUPERADMIN) {
      return true;
    }
    
    // Get permissions for this role and resource
    const rolePermissions = PERMISSIONS[role as UserRole]?.[resource] || [];
    
    return rolePermissions.includes(requiredPermission);
  }
  
  // Invalid arguments
  return false;
}

// Helper function to convert UserRole to Permission[]
export function getRolePermissions(role: UserRole): Permission[] {
  if (!role) return [];
  
  const permissions: Permission[] = [];
  
  // Handle superadmin special case
  if (role === UserRole.SUPERADMIN) {
    return [{ resource: '*', level: PermissionLevel.ADMIN }];
  }
  
  // For all other roles, extract permissions from the PERMISSIONS matrix
  const rolePermissionsMap = PERMISSIONS[role] || {};
  
  Object.entries(rolePermissionsMap).forEach(([resource, levels]) => {
    levels.forEach(level => {
      permissions.push({
        resource,
        level
      });
    });
  });
  
  return permissions;
}

// Type for session with user role
// Omit the original 'user' property from Session and redefine it
// to ensure compatibility and use the UserRole enum.
export interface SessionWithRole extends Omit<Session, 'user'> {
  user: { // User is non-optional and has a specific structure
    id: string; // Assume 'id' is required based on the error message for Session['user']
    role: UserRole; // Use the UserRole enum
    name?: string | null; // Include standard user properties
    email?: string | null;
    image?: string | null;
    centerId?: string | null; // ID del centro asignado
    [key: string]: any; // Include index signature if other dynamic properties are expected
  }
}

// Function to get session with role, including basic validation
export function getSessionWithRole(session?: Session | null): SessionWithRole | null {
  // Check if session and required user properties exist
  if (!session?.user?.id) {
    return null;
  }

  // Mapear role "usuario" a "viewer" automáticamente
  let role = session.user.role as string;
  if (role === "usuario") {
    role = UserRole.VIEWER;
  }

  // Validate if the role string from the session es válido
  const roleIsValid = Object.values(UserRole).includes(role as UserRole);
  if (!roleIsValid) {
      console.warn(`Session user role "${session.user.role}" is not a valid UserRole.`);
      return null;
  }

  // Retornar la sesión con el role corregido y centerId si existe
  return {
    ...session,
    user: {
      ...session.user,
      role: role as UserRole,
      centerId: session.user.centerId || null
    }
  } as SessionWithRole;
}

// React hook for permissions
export function usePermission(resource: string, requiredLevel: PermissionLevel) {
  // In a real implementation, this would use React hooks to get the session
  // For now it's just a placeholder function structure
  return {
    hasPermission: false,
    isLoading: true,
    error: null
  };
}