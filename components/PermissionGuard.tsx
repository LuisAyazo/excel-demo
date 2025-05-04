import React, { ReactNode } from 'react';
import { usePermission } from '../app/auth/hooks';
import { PermissionLevel } from '../app/auth/permissions';
import { redirect } from 'next/navigation';

interface PermissionGuardProps {
  children: ReactNode;
  resource: string;
  requiredPermission?: PermissionLevel;
  action?: PermissionLevel;  // Añadido para compatibilidad con código existente
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Component that restricts access to children based on user permissions
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  resource,
  requiredPermission,
  action,
  fallback,
  redirectTo = '/dashboard',
}) => {
  // Usar action si requiredPermission no está definido
  const permissionLevel = requiredPermission || action;
  
  // Verificar que se haya proporcionado al menos una de las dos propiedades
  if (!permissionLevel) {
    console.error('PermissionGuard: Debe proporcionar requiredPermission o action');
    return null;
  }

  const { hasPermission, isLoading, isAuthenticated } = usePermission(resource, permissionLevel);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle unauthenticated users
  if (!isAuthenticated) {
    redirect('/login');
  }

  // Return children if user has permission
  if (hasPermission) {
    return <>{children}</>;
  }

  // Redirect if redirectTo is provided
  if (redirectTo) {
    redirect(redirectTo);
  }

  // Return fallback or default unauthorized message
  return fallback ? (
    <>{fallback}</>
  ) : (
    <div className="p-6 text-center">
      <h3 className="text-lg font-medium text-red-600 mb-2">Acceso Restringido</h3>
      <p className="text-gray-600">
        No tienes permisos suficientes para acceder a este recurso.
      </p>
    </div>
  );
};

export default PermissionGuard;