'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Simulamos datos para las estadísticas y el historial
const estadisticas = [
  { id: 1, titulo: 'Fichas Totales', valor: 128, incremento: '12%', icono: DocumentIcon, color: 'bg-amber-500' },
  { id: 2, titulo: 'Fichas Activas', valor: 96, incremento: '8%', icono: UserIcon, color: 'bg-green-500' },
  { id: 3, titulo: 'Pendientes', valor: 24, incremento: '-4%', icono: ClockIcon, color: 'bg-yellow-500' },
  { id: 4, titulo: 'Inactivas', valor: 8, incremento: '-18%', icono: XCircleIcon, color: 'bg-red-500' },
];

const historial = [
  { id: 1, usuario: 'Ana López', accion: 'Creó una nueva ficha', fecha: '09/04/2025 - 15:23', tipo: 'creacion' },
  { id: 2, usuario: 'Juan Pérez', accion: 'Modificó ficha #FC-2103', fecha: '09/04/2025 - 14:12', tipo: 'modificacion' },
  { id: 3, usuario: 'María García', accion: 'Subió archivo Excel', fecha: '09/04/2025 - 13:05', tipo: 'subida' },
  { id: 4, usuario: 'Carlos Sánchez', accion: 'Desactivó ficha #FC-1897', fecha: '09/04/2025 - 11:43', tipo: 'desactivacion' },
  { id: 5, usuario: 'Elena Martín', accion: 'Creó una nueva ficha', fecha: '09/04/2025 - 10:27', tipo: 'creacion' },
  { id: 6, usuario: 'Pablo Jiménez', accion: 'Modificó ficha #FC-2087', fecha: '08/04/2025 - 17:56', tipo: 'modificacion' },
  { id: 7, usuario: 'Lucía Fernández', accion: 'Reactivó ficha #FC-1756', fecha: '08/04/2025 - 16:32', tipo: 'activacion' },
  { id: 8, usuario: 'Jorge Moreno', accion: 'Subió archivo Excel', fecha: '08/04/2025 - 15:14', tipo: 'subida' },
];

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<'todas' | 'hoy' | 'semana'>('todas');
  
  useEffect(() => {
    setIsClient(true);
    const name = localStorage.getItem("userName");
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");
    setUserName(name);
    setUserRole(role);
    setUserEmail(email);
  }, []);
  
  // Filtrar el historial según la pestaña activa
  const filteredHistorial = historial.filter(item => {
    if (activeTab === 'todas') return true;
    if (activeTab === 'hoy') return item.fecha.includes('09/04/2025');
    if (activeTab === 'semana') return true; // En este ejemplo simplificado mostramos todos para 'semana'
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Quick access shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="ml-3 text-lg font-semibold">Informes</h2>
          </div>
          <p className="text-gray-600 mb-4">Accede a informes y estadísticas de proyectos.</p>
          <Link href="/dashboard/reports" className="text-amber-600 hover:text-amber-800 font-medium text-sm flex items-center">
            Ver informes
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="ml-3 text-lg font-semibold">Excel</h2>
          </div>
          <p className="text-gray-600 mb-4">Carga y procesa archivos Excel para la gestión de proyectos.</p>
          <Link href="/dashboard/upload-excel" className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center">
            Cargar Excel
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="ml-3 text-lg font-semibold">Historial</h2>
          </div>
          <p className="text-gray-600 mb-4">Consulta el historial de cambios y actividades recientes.</p>
          <Link href="/dashboard/history" className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center">
            Ver historial
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Admin section - only shown to admins */}
      {isClient && (userRole === 'admin' || userRole === 'superadmin') && (
        <div className="bg-amber-50 p-6 rounded-lg shadow-inner border border-amber-100">
          <h2 className="text-xl font-semibold text-amber-800 mb-4">Administración del Sistema</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/dashboard/users">
              <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center border border-gray-100">
                <div className="p-2 bg-amber-100 rounded-lg mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Gestión de Usuarios</h3>
                  <p className="text-sm text-gray-600">Administra usuarios y permisos</p>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard/roles">
              <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center border border-gray-100">
                <div className="p-2 bg-amber-100 rounded-lg mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Gestión de Roles</h3>
                  <p className="text-sm text-gray-600">Configura los roles del sistema</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Tarjetas de acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/dashboard/upload-excel" className="flex items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group">
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <UploadIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Subir Excel</h3>
              <p className="text-sm text-gray-500">Importar datos desde Excel</p>
            </div>
            <div className="ml-auto">
              <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
          </Link>
          
          <Link href="/dashboard/create-form" className="flex items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group">
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <PlusIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Crear Ficha</h3>
              <p className="text-sm text-gray-500">Añadir nueva información</p>
            </div>
            <div className="ml-auto">
              <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
          </Link>
          
          <Link href="/dashboard/view-forms" className="flex items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group">
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <ViewIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Ver Fichas</h3>
              <p className="text-sm text-gray-500">Gestionar registros</p>
            </div>
            <div className="ml-auto">
              <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
          </Link>
          
          <Link href="/dashboard/special" className="flex items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group">
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <SparklesIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Especial</h3>
              <p className="text-sm text-gray-500">La loca de Luismi</p>
            </div>
            <div className="ml-auto">
              <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </div>
        
        {/* Estadísticas en tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {estadisticas.map((stat) => (
            <div key={stat.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icono className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{stat.titulo}</h3>
                  <p className="text-sm text-gray-500">Total acumulado</p>
                </div>
              </div>
              <div className="mt-4 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{stat.valor}</p>
                <p className={`ml-2 text-sm font-medium ${
                  stat.incremento.startsWith('-') ? 'text-red-600' : 'text-green-600'
                }`}>
                  {stat.incremento}
                </p>
                <p className="ml-2 text-sm text-gray-500">vs. último mes</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Distribución por categorías - Gráfico circular simplificado */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución por Categorías</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="relative w-48 h-48">
                {/* Círculo gráfico simplificado */}
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-primary" style={{ clipPath: 'polygon(50% 50%, 0% 0%, 50% 0%, 100% 0%, 100% 50%, 100% 75%)' }}></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-green-500" style={{ clipPath: 'polygon(50% 50%, 100% 75%, 100% 100%, 50% 100%, 25% 100%)' }}></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-blue-500" style={{ clipPath: 'polygon(50% 50%, 25% 100%, 0% 100%, 0% 50%, 0% 20%)' }}></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-yellow-500" style={{ clipPath: 'polygon(50% 50%, 0% 20%, 0% 0%)' }}></div>
                </div>
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-white" style={{ width: '50%', height: '50%', top: '25%', left: '25%' }}></div>
              </div>
              <div className="ml-6">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <span className="inline-block w-3 h-3 bg-primary rounded-full mr-2"></span>
                    <span>Categoría A (45%)</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <span>Categoría B (25%)</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    <span>Categoría C (20%)</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                    <span>Categoría D (10%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Actividad Reciente</h3>
            <p className="text-sm text-gray-500 mb-4">Últimos usuarios activos</p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-medium">AL</div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Ana López</p>
                  <p className="text-xs text-gray-500">Hace 2 horas</p>
                </div>
              </li>
              <li className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">JP</div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Juan Pérez</p>
                  <p className="text-xs text-gray-500">Hace 3 horas</p>
                </div>
              </li>
              <li className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-medium">MG</div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">María García</p>
                  <p className="text-xs text-gray-500">Hace 4 horas</p>
                </div>
              </li>
              <li className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-medium">CS</div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Carlos Sánchez</p>
                  <p className="text-xs text-gray-500">Hace 6 horas</p>
                </div>
              </li>
            </ul>
            <div className="mt-4">
              <Link href="/dashboard/view-forms" className="text-sm text-primary hover:text-primary-dark font-medium flex items-center">
                Ver todos los usuarios
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Historial de cambios */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h3 className="text-lg font-medium text-gray-900">Historial de Cambios</h3>
              <div className="mt-3 md:mt-0 flex bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setActiveTab('todas')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    activeTab === 'todas'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setActiveTab('hoy')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    activeTab === 'hoy'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Hoy
                </button>
                <button
                  onClick={() => setActiveTab('semana')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    activeTab === 'semana'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Esta Semana
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistorial.length > 0 ? (
                  filteredHistorial.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{item.usuario}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{item.accion}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.fecha}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.tipo === 'creacion'
                            ? 'bg-green-100 text-green-800'
                            : item.tipo === 'modificacion'
                            ? 'bg-blue-100 text-blue-800'
                            : item.tipo === 'desactivacion'
                            ? 'bg-red-100 text-red-800'
                            : item.tipo === 'activacion'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.tipo === 'creacion'
                            ? 'Creación'
                            : item.tipo === 'modificacion'
                            ? 'Modificación'
                            : item.tipo === 'desactivacion'
                            ? 'Desactivación'
                            : item.tipo === 'activacion'
                            ? 'Activación'
                            : 'Subida'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      No hay registros para mostrar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex justify-center">
              <button className="px-3 py-1.5 text-sm font-medium text-primary hover:text-primary-dark flex items-center">
                Ver todas las actividades
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componentes de iconos
function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  );
}

function ViewIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}