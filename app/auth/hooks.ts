'use client';

import { useSession } from 'next-auth/react';
import { hasPermission, PermissionLevel, Permission, UserRole } from './permissions';

/**
 * Hook to check if the current user has the specified permission
 * @param resource The resource to check permission for
 * @param level The permission level required
 * @returns Boolean indicating if the user has the permission
 */
export function usePermission(resource: string, level: PermissionLevel): boolean {
  const { data: session } = useSession();
  
  if (!session?.user) {
    return false;
  }

  // that doesn't exist on the user object
  const userRole = session.user.role as string;
  
  // Map string role to UserRole enum if possible
  let role: UserRole;
  if (Object.values(UserRole).includes(userRole as UserRole)) {
    role = userRole as UserRole;
  } else if (userRole === "usuario") {
    role = UserRole.VIEWER;
  } else {
    // Default to VIEWER if role is invalid
    role = UserRole.VIEWER;
    console.warn(`Unknown user role "${userRole}", defaulting to VIEWER for permission checks`);
  }

  // Use the user-role based permission check with properly typed user object
  return hasPermission(
    { role }, 
    resource,
    level
  );
}

/**
 * Hook to get all permissions for the current user based on their role
 * @returns Array of derived permissions for the current user
 */
export function usePermissions(): Permission[] {
  const { data: session } = useSession();
  const userRoleStr = session?.user?.role as string;
  
  if (!userRoleStr) {
    return [];
  }
  
  // Convert string role to enum
  let userRole: UserRole;
  if (Object.values(UserRole).includes(userRoleStr as UserRole)) {
    userRole = userRoleStr as UserRole;
  } else if (userRoleStr === "usuario") {
    userRole = UserRole.VIEWER;
  } else {
    userRole = UserRole.VIEWER;
  }
  
  // Generate permissions array based on role
  const derivedPermissions: Permission[] = [];
  
  // SuperAdmin case - has all permissions on all resources
  if (userRole === UserRole.SUPERADMIN) {
    // Add wildcard permission for superadmin
    derivedPermissions.push({
      resource: '*',
      level: PermissionLevel.ADMIN
    });
    
    // Also add explicit permissions for all resources for UI representation
    Object.values(RESOURCES).forEach(resource => {
      [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.DELETE, PermissionLevel.ADMIN].forEach(level => {
        derivedPermissions.push({ resource, level });
      });
    });
    
    return derivedPermissions;
  }
  
  // For other roles, get permissions from the PERMISSIONS matrix
  const rolePermissions = PERMISSIONS[userRole];
  if (rolePermissions) {
    // For each resource the role has access to
    Object.entries(rolePermissions).forEach(([resource, levels]) => {
      // For each permission level granted for this resource
      levels.forEach(level => {
        derivedPermissions.push({
          resource,
          level
        });
      });
    });
  }
  
  return derivedPermissions;
}

/**
 * Hook to check if the current user is a super admin
 * @returns Boolean indicating if the user has super admin role
 */
export function useIsSuperAdmin(): boolean {
  const { data: session } = useSession();
  
  if (!session?.user) {
    return false;
  }
  
  const userRole = session.user.role as string;
  return userRole === UserRole.SUPERADMIN;
}
