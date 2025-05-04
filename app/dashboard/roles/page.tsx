'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
    name: 'usuario',
    description: 'Acceso básico solo para consulta de información',
    permissions: ['forms.read'],
    created_at: '2025-04-01T10:00:00Z'
  }
];

export default function RolesPage() {
  const [roles, setRoles] = useState(rolesMock);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="bg-white rounded-lg shadow-sm p-6">
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
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Nuevo Rol
          </Link>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Tarjetas de Roles */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-500">Cargando roles...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div key={role.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 flex flex-col">
              {/* Cabecera del rol con el color adecuado */}
              <div className={`px-6 py-4 ${
                role.name === 'admin'
                  ? 'bg-purple-100'
                  : role.name === 'operacion'
                  ? 'bg-blue-100'
                  : 'bg-green-100'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${
                    role.name === 'admin'
                      ? 'text-purple-800'
                      : role.name === 'operacion'
                      ? 'text-blue-800'
                      : 'text-green-800'
                  }`}>
                    {role.name}
                  </h3>
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/roles/edit/${role.id}`} className="text-gray-500 hover:text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </Link>
                    <button 
                      onClick={() => handleDeleteRole(role.id)}
                      className="text-gray-500 hover:text-red-600"
                      // Deshabilitamos eliminar los roles principales del sistema
                      disabled={['admin', 'operacion', 'usuario'].includes(role.name)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${['admin', 'operacion', 'usuario'].includes(role.name) ? 'opacity-30 cursor-not-allowed' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Cuerpo del rol */}
              <div className="px-6 py-4 flex-1">
                <p className="text-gray-700 mb-4">{role.description}</p>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Permisos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((permission, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Footer del rol */}
              <div className="px-6 py-3 bg-gray-50 text-xs text-gray-500">
                Creado el {new Date(role.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}

          {/* Tarjeta para crear un nuevo rol */}
          <Link href="/dashboard/roles/create" className="flex flex-col items-center justify-center h-full min-h-[250px] bg-gray-50 border border-dashed border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="p-3 bg-primary/10 rounded-full mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-gray-700 font-medium">Crear nuevo rol</span>
            <span className="text-gray-500 text-sm mt-1">Añadir permisos personalizados</span>
          </Link>
        </div>
      )}

      {/* Panel explicativo */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-secondary mb-4">¿Qué son los roles?</h3>
        <p className="text-gray-700 mb-4">
          Los roles definen los permisos que tienen los usuarios en el sistema. Cada rol tiene un conjunto específico de permisos
          que determinan qué acciones pueden realizar los usuarios que tienen ese rol asignado.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> Los roles principales del sistema (admin, operacion, usuario) no pueden ser eliminados ya que son esenciales para el funcionamiento de la aplicación.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}