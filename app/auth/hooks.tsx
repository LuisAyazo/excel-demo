import { useSession } from 'next-auth/react';
import { useCallback, useMemo } from 'react';
import { PermissionLevel, UserRole, getSessionWithRole, hasPermission } from './permissions';

/**
 * Hook to check if the current user has permission for a resource
 * @param resource The resource to check permission for
 * @param level The required permission level
 * @returns An object with the permission status and session data
 */
export function usePermission(resource: string, level: PermissionLevel) {
  const { data: session, status } = useSession();
  
  const sessionWithRole = useMemo(() => {
    return getSessionWithRole(session);
  }, [session]);
  
  const checkPermission = useCallback(() => {
    if (!sessionWithRole || !sessionWithRole.user) {
      return false;
    }
    return hasPermission(sessionWithRole.user, resource, level);
  }, [sessionWithRole, resource, level]);

  return {
    hasPermission: checkPermission(),
    isLoading: status === 'loading',
    session: sessionWithRole,
    isAuthenticated: !!sessionWithRole,
    userRole: sessionWithRole?.user?.role as UserRole | undefined
  };
}

/**
 * Hook to get the current user's role
 * @returns The current user's role or undefined
 */
export function useUserRole() {
  const { data: session, status } = useSession();
  
  const sessionWithRole = useMemo(() => {
    return getSessionWithRole(session);
  }, [session]);

  return {
    role: sessionWithRole?.user?.role,
    isLoading: status === 'loading',
    isAuthenticated: !!sessionWithRole
  };
}