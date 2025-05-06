'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePermission } from '@/app/auth/hooks';
import { PermissionLevel, RESOURCES } from '@/app/auth/permissions';
import PermissionGuard from '@/components/PermissionGuard';

// Datos ficticios para los roles
const rolesMock = [
  {
    id: '1',
    name: 'admin',
    description: 'Acceso completo a todas las funciones del sistema',
    permissions: ['users.create', 'users.read', 'users.update', 'users.delete', 'roles.create', 'roles.read', 'roles.update', 'roles.delete', 'forms.create', 'forms.read', 'forms.update', 'forms.delete'],
    created_at: '2025-04-01T10:00:00Z'
  },
  {
    id: '2',
    name: 'operacion',
    description: 'Acceso a funciones de operación, sin administración de usuarios',
    permissions: ['forms.create', 'forms.read', 'forms.update', 'forms.delete', 'users.read'],
    created_at: '2025-04-01T10:00:00Z'
  },
  {
    id: '3',
    name: 'consulta',
    description: 'Acceso básico solo para consulta de información',
    permissions: ['forms.read'],
    created_at: '2025-04-01T10:00:00Z'
  },
  {
    id: '4',
    name: 'superadmin',
    description: 'Acceso ilimitado con capacidad de modificar parámetros críticos del sistema',
    permissions: ['*'],
    created_at: '2025-04-01T10:00:00Z'
  }
];

// Agrupaciones de permisos para mostrar de forma organizada
const permissionGroups = {
  'Usuarios': ['users.create', 'users.read', 'users.update', 'users.delete'],
  'Roles': ['roles.create', 'roles.read', 'roles.update', 'roles.delete'],
  'Fichas': ['forms.create', 'forms.read', 'forms.update', 'forms.delete'],
  'Documentos': ['documents.create', 'documents.read', 'documents.update', 'documents.delete'],
  'Finanzas': ['budget.read', 'budget.create', 'financial_tracking.read', 'financial_tracking.write'],
  'Informes': ['reports.basic', 'reports.advanced', 'reports.export']
};

// Descripciones de cada permiso
const permissionDescriptions: {[key: string]: string} = {
  'users.create': 'Crear usuarios',
  'users.read': 'Ver usuarios',
  'users.update': 'Editar usuarios',
  'users.delete': 'Eliminar usuarios',
  'roles.create': 'Crear roles',
  'roles.read': 'Ver roles',
  'roles.update': 'Editar roles',
  'roles.delete': 'Eliminar roles',
  'forms.create': 'Crear fichas',
  'forms.read': 'Ver fichas',
  'forms.update': 'Editar fichas',
  'forms.delete': 'Eliminar fichas',
  'documents.create': 'Crear documentos',
  'documents.read': 'Ver documentos',
  'documents.update': 'Editar documentos',
  'documents.delete': 'Eliminar documentos',
  'budget.read': 'Ver presupuestos',
  'budget.create': 'Crear presupuestos',
  'financial_tracking.read': 'Ver seguimiento financiero',
  'financial_tracking.write': 'Actualizar datos financieros',
  'reports.basic': 'Ver informes básicos',
  'reports.advanced': 'Ver informes avanzados',
  'reports.export': 'Exportar informes'
};

export default function RolesPage() {
  const [roles, setRoles] = useState(rolesMock);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  // En una implementación real, esta función se conectaría al API
  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      // Aquí iría la llamada a la API
      // const response = await fetch('/api/roles');
      // const data = await response.json();
      // setRoles(data);
      
      // Por ahora usamos datos ficticios
      setRoles(rolesMock);
      setError('');
    } catch (err) {
      setError('Error al cargar los roles');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // En una implementación real, esta función eliminaría el rol a través del API
  const handleDeleteRole = async (roleId: string) => {
    const roleToDelete = roles.find(role => role.id === roleId);
    
    // No permitir eliminar roles principales del sistema
    if (roleToDelete && ['admin', 'operacion', 'consulta'].includes(roleToDelete.name)) {
      alert('Este rol es esencial para el sistema y no puede ser eliminado.');
      return;
    }
    
    if (window.confirm('¿Estás seguro de que deseas eliminar este rol?')) {
      setIsLoading(true);
      try {
        // Aquí iría la llamada a la API
        // await fetch(`/api/roles/${roleId}`, { method: 'DELETE' });
        
        // Por ahora simulamos la eliminación
        setRoles(roles.filter(role => role.id !== roleId));
        setError('');
      } catch (err) {
        setError('Error al eliminar el rol');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Cargar roles al montar el componente
  useEffect(() => {
    fetchRoles();
  }, []);
  
  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <PermissionGuard
      resource={RESOURCES.ROLES}
      requiredPermission={PermissionLevel.READ}
      redirectTo="/dashboard"
    >
      <motion.div 
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Encabezado */}
        <motion.div className="bg-white rounded-lg shadow-sm p-6" variants={itemVariants}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-semibold text-secondary">Gestión de Roles</h2>
              <p className="text-gray-500 mt-1">Administra los roles y permisos del sistema</p>
            </div>
            <Link
              href="/dashboard/roles/create"
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Crear Rol
            </Link>
          </div>
        </motion.div>

        {/* Panel de Información */}
        <motion.div variants={itemVariants}>
          <motion.div 
            className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${showInfoPanel ? 'max-h-[1000px]' : 'max-h-20'}`}
          >
            <div 
              className="p-4 bg-amber-50 cursor-pointer flex justify-between items-center"
              onClick={() => setShowInfoPanel(!showInfoPanel)}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <h3 className="font-medium">Información sobre Roles y Permisos</h3>
              </div>
              <motion.div 
                animate={{ rotate: showInfoPanel ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </motion.div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-lg mb-2">¿Qué son los roles?</h4>
                  <p className="text-gray-600">
                    Los roles definen los permisos que tienen los usuarios en el sistema. Cada rol tiene un conjunto específico de permisos que determinan qué acciones pueden realizar los usuarios que tienen ese rol asignado.
                  </p>
                  <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded-md">
                    <p className="text-sm text-red-600">
                      <strong>Nota:</strong> Los roles principales del sistema (admin, operacion, consulta) no pueden ser eliminados ya que son esenciales para el funcionamiento de la aplicación.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-lg mb-2">¿Qué son los permisos?</h4>
                  <p className="text-gray-600">
                    Los permisos son acciones específicas que un usuario puede realizar en el sistema. Se agrupan en categorías como Usuarios, Roles, Fichas, etc. Cada permiso controla una acción específica, como crear, leer, actualizar o eliminar recursos.
                  </p>
                  <div className="mt-4">
                    <h5 className="text-sm font-medium mb-1">Ejemplo de permisos:</h5>
                    <div className="flex flex-wrap gap-1">
                      {['users.read', 'forms.create', 'roles.update'].map(perm => (
                        <span key={perm} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Lista de Roles */}
        <motion.div variants={itemVariants}>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-12 w-12 border-b-2 border-amber-600 rounded-full"
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permisos
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roles.map((role, index) => (
                    <motion.tr 
                      key={role.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ backgroundColor: "#f9fafb" }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-amber-100 text-amber-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {role.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Creado: {new Date(role.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-sm">{role.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {Array.isArray(role.permissions) && role.permissions.includes('*') ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                              Todos los permisos
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {role.permissions.slice(0, 3).map((perm, i) => (
                                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                  {perm}
                                </span>
                              ))}
                              {role.permissions.length > 3 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  +{role.permissions.length - 3} más
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/dashboard/roles/edit/${role.id}`}>
                            <button className="text-amber-600 hover:text-amber-900">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                          </Link>
                          <button 
                            className={`${['admin', 'operacion', 'consulta'].includes(role.name) 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-red-600 hover:text-red-900'}`}
                            onClick={() => handleDeleteRole(role.id)}
                            disabled={['admin', 'operacion', 'consulta'].includes(role.name)}
                            title={['admin', 'operacion', 'consulta'].includes(role.name) 
                              ? 'Este rol no puede ser eliminado' 
                              : 'Eliminar rol'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}

                  {roles.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        No hay roles disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
        
        {/* Sección de Explicación de Permisos */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm p-6"
          variants={itemVariants}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center mb-6">
            <motion.div 
              className="p-2 bg-amber-100 rounded-full mr-4"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Lista de Permisos Disponibles</h3>
              <p className="text-gray-600 text-sm">Los siguientes permisos pueden ser asignados a roles para controlar el acceso a las diferentes funcionalidades del sistema.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(permissionGroups).map(([group, permissions]) => (
              <motion.div 
                key={group}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
                whileHover={{ 
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  y: -5
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-gradient-to-r from-amber-50 to-white px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    {group === 'Usuarios' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    )}
                    {group === 'Roles' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {group === 'Fichas' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    )}
                    {group === 'Documentos' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {group === 'Finanzas' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                    )}
                    {group === 'Informes' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                      </svg>
                    )}
                    <h4 className="font-medium text-gray-800">{group}</h4>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <ul className="space-y-3">
                    {permissions.map(permission => (
                      <motion.li 
                        key={permission} 
                        className="flex items-start p-2 rounded-md hover:bg-gray-50"
                        whileHover={{ x: 4, backgroundColor: "#f9fafb" }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-700">{permissionDescriptions[permission] || permission}</div>
                          <div className="text-xs mt-0.5 text-gray-500 bg-gray-100 px-2 py-0.5 rounded-sm inline-block">{permission}</div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                  <span className="text-xs text-gray-500">Total: {permissions.length} permisos</span>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-amber-800">
              <span className="font-medium">Importante:</span> Los permisos deben ser asignados correctamente para garantizar la seguridad y el correcto funcionamiento del sistema. Un usuario con roles incompatibles o excesivos puede comprometer la integridad de los datos.
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </PermissionGuard>
  );
}