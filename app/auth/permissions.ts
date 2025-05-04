import { Session } from 'next-auth';

// Define user roles
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

// Define permission levels
export enum PermissionLevel {
  READ = 'read',
  WRITE = 'write',
  MANAGE = 'manage',
  ADMIN = 'admin'
}

// Define actions (alias de PermissionLevel para mantener compatibilidad con código existente)
export const ACTIONS = PermissionLevel;

// Define resources
export const RESOURCES = {
  EXCEL: 'excel',
  USERS: 'users',
  ROLES: 'roles',
  PROJECTS: 'projects',
  DASHBOARD: 'dashboard',
  BUDGET: 'budget',
  FORMS: 'forms',
  // Nuevos recursos
  DOCUMENTS: 'documents',
  HISTORY: 'history',
  FINANCIAL_TRACKING: 'financial_tracking',
  REPORTS: 'reports'
};

// Permission matrix defining what roles have access to which resources
const PERMISSIONS: Record<UserRole, Record<string, PermissionLevel[]>> = {
  [UserRole.ADMIN]: {
    [RESOURCES.EXCEL]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.MANAGE, PermissionLevel.ADMIN],
    [RESOURCES.USERS]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.MANAGE, PermissionLevel.ADMIN],
    [RESOURCES.ROLES]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.MANAGE, PermissionLevel.ADMIN],
    [RESOURCES.PROJECTS]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.MANAGE, PermissionLevel.ADMIN],
    [RESOURCES.DASHBOARD]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.MANAGE, PermissionLevel.ADMIN],
    [RESOURCES.BUDGET]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.MANAGE, PermissionLevel.ADMIN],
    [RESOURCES.FORMS]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.MANAGE, PermissionLevel.ADMIN],
    // Nuevos recursos
    [RESOURCES.DOCUMENTS]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.MANAGE, PermissionLevel.ADMIN],
    [RESOURCES.HISTORY]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.MANAGE, PermissionLevel.ADMIN],
    [RESOURCES.FINANCIAL_TRACKING]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.MANAGE, PermissionLevel.ADMIN],
    [RESOURCES.REPORTS]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.MANAGE, PermissionLevel.ADMIN],
  },
  [UserRole.MANAGER]: {
    [RESOURCES.EXCEL]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.MANAGE],
    [RESOURCES.USERS]: [PermissionLevel.READ, PermissionLevel.WRITE],
    [RESOURCES.ROLES]: [PermissionLevel.READ],
    [RESOURCES.PROJECTS]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.MANAGE],
    [RESOURCES.DASHBOARD]: [PermissionLevel.READ, PermissionLevel.WRITE],
    [RESOURCES.BUDGET]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.MANAGE],
    [RESOURCES.FORMS]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.MANAGE],
    // Nuevos recursos
    [RESOURCES.DOCUMENTS]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.MANAGE],
    [RESOURCES.HISTORY]: [PermissionLevel.READ, PermissionLevel.WRITE],
    [RESOURCES.FINANCIAL_TRACKING]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.MANAGE],
    [RESOURCES.REPORTS]: [PermissionLevel.READ, PermissionLevel.WRITE],
  },
  [UserRole.EDITOR]: {
    [RESOURCES.EXCEL]: [PermissionLevel.READ, PermissionLevel.WRITE],
    [RESOURCES.USERS]: [PermissionLevel.READ],
    [RESOURCES.ROLES]: [PermissionLevel.READ],
    [RESOURCES.PROJECTS]: [PermissionLevel.READ, PermissionLevel.WRITE],
    [RESOURCES.DASHBOARD]: [PermissionLevel.READ],
    [RESOURCES.BUDGET]: [PermissionLevel.READ, PermissionLevel.WRITE],
    [RESOURCES.FORMS]: [PermissionLevel.READ, PermissionLevel.WRITE],
    // Nuevos recursos
    [RESOURCES.DOCUMENTS]: [PermissionLevel.READ, PermissionLevel.WRITE],
    [RESOURCES.HISTORY]: [PermissionLevel.READ],
    [RESOURCES.FINANCIAL_TRACKING]: [PermissionLevel.READ],
    [RESOURCES.REPORTS]: [PermissionLevel.READ],
  },
  [UserRole.VIEWER]: {
    [RESOURCES.EXCEL]: [PermissionLevel.READ],
    [RESOURCES.USERS]: [],
    [RESOURCES.ROLES]: [],
    [RESOURCES.PROJECTS]: [PermissionLevel.READ],
    [RESOURCES.DASHBOARD]: [PermissionLevel.READ],
    [RESOURCES.BUDGET]: [PermissionLevel.READ],
    [RESOURCES.FORMS]: [PermissionLevel.READ],
    // Nuevos recursos: por defecto no tiene acceso
    [RESOURCES.DOCUMENTS]: [],
    [RESOURCES.HISTORY]: [],
    [RESOURCES.FINANCIAL_TRACKING]: [],
    [RESOURCES.REPORTS]: [],
  },
};

// Type for user with role
interface UserWithRole {
  role?: UserRole;
  [key: string]: any;
}

// Function to check if a user has permission for a resource
export function hasPermission(
  user: UserWithRole,
  resource: string,
  requiredPermission: PermissionLevel
): boolean {
  // Default to viewer if no role is specified
  const role = user.role || UserRole.VIEWER;

  // Get permissions for this role and resource
  const rolePermissions = PERMISSIONS[role as UserRole]?.[resource] || [];
  
  return rolePermissions.includes(requiredPermission);
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
    [key: string]: any; // Include index signature if other dynamic properties are expected
  }
}

// Function to get session with role, including basic validation
export function getSessionWithRole(session?: Session | null): SessionWithRole | null {
  // Check if session and required user properties exist
  if (!session?.user?.id || !session?.user?.role) {
    return null;
  }

  // Mapear role "usuario" a "viewer" automáticamente
  let role = session.user.role;
  if (role === "usuario") {
    role = UserRole.VIEWER;
  }

  // Validate if the role string from the session es válido
  const roleIsValid = Object.values(UserRole).includes(role as UserRole);
  if (!roleIsValid) {
      console.warn(`Session user role "${session.user.role}" is not a valid UserRole.`);
      return null;
  }

  // Retornar la sesión con el role corregido
  return {
    ...session,
    user: {
      ...session.user,
      role: role as UserRole
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