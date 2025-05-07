'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIsSuperAdmin } from '@/app/auth/hooks';
import { useCenterContext, Center } from '@/components/providers/CenterContext';

export default function GlobalCentersSettings() {
  const router = useRouter();
  const isSuperAdmin = useIsSuperAdmin();
  const { availableCenters, currentCenter, setCenter } = useCenterContext();
  const [localCenters, setLocalCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not a superadmin
    if (!isSuperAdmin) {
      router.push('/dashboard');
      return;
    }

    // Fetch centers data
    const fetchCenters = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/centers', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch centers');
        }

        const data = await response.json();
        // Asegurarse de que cada centro tenga la propiedad active
        const centersWithActive = data.map((center: Center) => ({
          ...center,
          active: center.active !== undefined ? center.active : true
        }));
        setLocalCenters(centersWithActive);
      } catch (err: any) {
        console.error('Error fetching centers:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, [isSuperAdmin, router]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Gestión Global de Centros</h1>
      
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Listado de Centros</h2>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              onClick={() => {/* Aquí iría la lógica para crear un nuevo centro */}}
            >
              Crear Nuevo Centro
            </button>
          </div>
          
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {localCenters.length > 0 ? (
                  localCenters.map((center) => (
                    <tr key={center.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{center.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{center.slug}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          center.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {center.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          onClick={() => {
                            if (currentCenter?.id !== center.id) {
                              setCenter(center);
                              // Navegar al centro seleccionado
                              router.push(`/center/${center.slug}/dashboard`);
                            }
                          }}
                        >
                          Seleccionar
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                        <button className="text-red-600 hover:text-red-900">
                          {center.active ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay centros disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}