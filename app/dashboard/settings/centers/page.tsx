'use client';

import React, { useState } from 'react';
import { useCenterContext, Center } from '@/components/providers/CenterContext';
import { usePermission } from '@/app/auth/hooks';
import { PermissionLevel } from '@/app/auth/permissions';

export default function CentersPage() {
  const { availableCenters, currentCenter, setCenter, addCenter } = useCenterContext();
  const [newCenterName, setNewCenterName] = useState('');
  const [newCenterSlug, setNewCenterSlug] = useState('');
  const [newCenterDescription, setNewCenterDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Verificar si el usuario tiene permisos de administrador
  const hasAdminPermission = usePermission('centers', PermissionLevel.ADMIN);

  const handleAddCenter = () => {
    if (!hasAdminPermission) {
      setError('No tienes permisos para agregar centros');
      return;
    }
    
    if (!newCenterName || !newCenterSlug) {
      setError('El nombre y el slug son obligatorios');
      return;
    }
    
    // Verificar que el slug no exista ya
    if (availableCenters.some(center => center.slug === newCenterSlug)) {
      setError(`Ya existe un centro con el slug "${newCenterSlug}"`);
      return;
    }
    
    const newCenter: Center = {
      id: `${Date.now()}`, // Generamos un ID único basado en timestamp
      name: newCenterName,
      slug: newCenterSlug,
      description: newCenterDescription,
      isDefault: false
    };
    
    try {
      addCenter(newCenter);
      setSuccess(`Centro "${newCenterName}" añadido correctamente`);
      
      // Limpiar el formulario
      setNewCenterName('');
      setNewCenterSlug('');
      setNewCenterDescription('');
      setError(null);
      
      // Auto-ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setError('Error al añadir el centro. Inténtalo de nuevo.');
    }
  };
  
  const handleSetDefault = (centerId: string) => {
    if (!hasAdminPermission) return;
    
    const updatedCenters = availableCenters.map(center => ({
      ...center,
      isDefault: center.id === centerId
    }));
    
    // Actualizar en localStorage
    localStorage.setItem('availableCenters', JSON.stringify(updatedCenters));
    
    // Recargar la página para aplicar los cambios
    window.location.reload();
  };
  
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[á]/g, 'a')
      .replace(/[é]/g, 'e')
      .replace(/[í]/g, 'i')
      .replace(/[ó]/g, 'o')
      .replace(/[ú]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNewCenterName(name);
    // Generar automáticamente el slug si el campo está vacío o si había sido generado automáticamente
    if (!newCenterSlug || newCenterSlug === generateSlug(newCenterName)) {
      setNewCenterSlug(generateSlug(name));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Administración de Centros</h1>
      </div>
      
      {/* Mensajes de error o éxito */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
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
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Centros Disponibles</h3>
          <p className="mt-1 text-sm text-gray-500">
            Lista de todos los centros registrados en el sistema
          </p>
        </div>
        <div className="bg-white shadow overflow-hidden border-b border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {availableCenters.map((center) => (
                <tr key={center.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {center.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {center.slug}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {center.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {center.isDefault ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Principal
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Secundario
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCenter(center)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {currentCenter?.id === center.id ? 'Actual' : 'Seleccionar'}
                      </button>
                      {hasAdminPermission && !center.isDefault && (
                        <button
                          onClick={() => handleSetDefault(center.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Establecer como principal
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Formulario para agregar nuevo centro */}
      {hasAdminPermission && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Agregar Nuevo Centro</h3>
            <p className="mt-1 text-sm text-gray-500">
              Complete el formulario para registrar un nuevo centro en el sistema
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={newCenterName}
                    onChange={handleNameChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  Slug *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="slug"
                    id="slug"
                    value={newCenterSlug}
                    onChange={(e) => setNewCenterSlug(e.target.value)}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Identificador único para la URL (sin espacios, solo minúsculas y guiones)
                  </p>
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={newCenterDescription}
                    onChange={(e) => setNewCenterDescription(e.target.value)}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleAddCenter}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Añadir Centro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}