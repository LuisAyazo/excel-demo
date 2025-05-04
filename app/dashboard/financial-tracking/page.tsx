'use client';

import React, { useState } from 'react';
import PermissionGuard from '@/components/PermissionGuard';
import { PermissionLevel, RESOURCES } from '@/app/auth/permissions';

// Mock project financial data
const projectsData = [
  {
    id: '1',
    name: 'Proyecto de Innovación en Energías Renovables',
    budget: 125000000,
    spent: 78500000,
    committed: 15000000,
    available: 31500000,
    progress: 62.8,
    status: 'active'
  },
  {
    id: '2',
    name: 'Programa de Formación en Tecnologías Emergentes',
    budget: 85000000,
    spent: 76500000,
    committed: 5000000,
    available: 3500000,
    progress: 90,
    status: 'active'
  },
  {
    id: '3',
    name: 'Iniciativa de Desarrollo Social Comunitario',
    budget: 65000000,
    spent: 65000000,
    committed: 0,
    available: 0,
    progress: 100,
    status: 'completed'
  },
  {
    id: '4',
    name: 'Investigación en Biotecnología Aplicada',
    budget: 180000000,
    spent: 45000000,
    committed: 35000000,
    available: 100000000,
    progress: 25,
    status: 'active'
  },
  {
    id: '5',
    name: 'Sistema de Monitoreo Ambiental',
    budget: 95000000,
    spent: 5000000,
    committed: 25000000,
    available: 65000000,
    progress: 5.3,
    status: 'active'
  }
];

// Mock transactions data
const transactionsData = [
  {
    id: '1',
    projectId: '1',
    type: 'expense',
    amount: 12500000,
    date: '2025-03-15',
    description: 'Compra de equipos solares',
    category: 'Equipos',
    approvedBy: 'María Rodríguez'
  },
  {
    id: '2',
    projectId: '1',
    type: 'expense',
    amount: 8500000,
    date: '2025-03-22',
    description: 'Servicio de instalación',
    category: 'Servicios',
    approvedBy: 'Luis Gómez'
  },
  {
    id: '3',
    projectId: '2',
    type: 'expense',
    amount: 15000000,
    date: '2025-03-10',
    description: 'Honorarios instructores',
    category: 'Personal',
    approvedBy: 'Ana Martínez'
  },
  {
    id: '4',
    projectId: '4',
    type: 'expense',
    amount: 45000000,
    date: '2025-02-28',
    description: 'Adquisición de equipos laboratorio',
    category: 'Equipos',
    approvedBy: 'Carlos Ruiz'
  },
  {
    id: '5',
    projectId: '5',
    type: 'expense',
    amount: 5000000,
    date: '2025-04-01',
    description: 'Desarrollo de software',
    category: 'Desarrollo',
    approvedBy: 'Patricia López'
  }
];

export default function FinancialTrackingPage() {
  const [selectedProject, setSelectedProject] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [view, setView] = useState('overview');

  // Filter transactions based on selected project
  const filteredTransactions = selectedProject === 'all'
    ? transactionsData
    : transactionsData.filter(transaction => transaction.projectId === selectedProject);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate summary statistics
  const calculateTotals = () => {
    const filteredProjects = selectedProject === 'all'
      ? projectsData
      : projectsData.filter(project => project.id === selectedProject);
    
    return filteredProjects.reduce((acc, project) => {
      acc.totalBudget += project.budget;
      acc.totalSpent += project.spent;
      acc.totalCommitted += project.committed;
      acc.totalAvailable += project.available;
      return acc;
    }, { totalBudget: 0, totalSpent: 0, totalCommitted: 0, totalAvailable: 0 });
  };

  const totals = calculateTotals();

  return (
    <PermissionGuard 
      resource={RESOURCES.FINANCIAL_TRACKING} 
      requiredPermission={PermissionLevel.READ}
      redirectTo="/dashboard"
    >
      <div className="container mx-auto bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Seguimiento Financiero</h1>
          <p className="text-gray-600 mt-1">
            Controle y supervise el estado financiero de los proyectos
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="projectFilter" className="block mb-1 text-sm font-medium text-gray-700">Proyecto</label>
            <select
              id="projectFilter"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-sm"
            >
              <option value="all">Todos los proyectos</option>
              {projectsData.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="dateRangeFilter" className="block mb-1 text-sm font-medium text-gray-700">Período</label>
            <select
              id="dateRangeFilter"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-sm"
            >
              <option value="all">Todo el período</option>
              <option value="current-month">Mes actual</option>
              <option value="current-quarter">Trimestre actual</option>
              <option value="current-year">Año actual</option>
              <option value="custom">Período personalizado</option>
            </select>
          </div>
        </div>

        {/* View tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setView('overview')}
            className={`px-4 py-2 text-sm font-medium ${
              view === 'overview'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setView('transactions')}
            className={`px-4 py-2 text-sm font-medium ${
              view === 'transactions'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Transacciones
          </button>
          <button
            onClick={() => setView('reports')}
            className={`px-4 py-2 text-sm font-medium ${
              view === 'reports'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Informes
          </button>
        </div>

        {view === 'overview' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                <p className="text-sm font-medium text-gray-500 mb-1">Presupuesto Total</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(totals.totalBudget)}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                <p className="text-sm font-medium text-gray-500 mb-1">Ejecutado</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(totals.totalSpent)}</p>
                <p className="text-xs text-gray-500">{Math.round((totals.totalSpent / totals.totalBudget) * 100)}% del presupuesto</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-amber-500">
                <p className="text-sm font-medium text-gray-500 mb-1">Comprometido</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(totals.totalCommitted)}</p>
                <p className="text-xs text-gray-500">{Math.round((totals.totalCommitted / totals.totalBudget) * 100)}% del presupuesto</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
                <p className="text-sm font-medium text-gray-500 mb-1">Disponible</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(totals.totalAvailable)}</p>
                <p className="text-xs text-gray-500">{Math.round((totals.totalAvailable / totals.totalBudget) * 100)}% del presupuesto</p>
              </div>
            </div>

            {/* Projects Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="py-3 px-4">Proyecto</th>
                    <th scope="col" className="py-3 px-4">Presupuesto</th>
                    <th scope="col" className="py-3 px-4">Ejecutado</th>
                    <th scope="col" className="py-3 px-4">Comprometido</th>
                    <th scope="col" className="py-3 px-4">Disponible</th>
                    <th scope="col" className="py-3 px-4">Progreso</th>
                    <th scope="col" className="py-3 px-4">Estado</th>
                    <th scope="col" className="py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedProject === 'all' ? projectsData : projectsData.filter(project => project.id === selectedProject)).map((project) => (
                    <tr key={project.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-amber-700">
                        {project.name}
                      </td>
                      <td className="py-4 px-4">
                        {formatCurrency(project.budget)}
                      </td>
                      <td className="py-4 px-4">
                        {formatCurrency(project.spent)}
                      </td>
                      <td className="py-4 px-4">
                        {formatCurrency(project.committed)}
                      </td>
                      <td className="py-4 px-4">
                        {formatCurrency(project.available)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className={`h-2.5 rounded-full ${
                                project.progress >= 90 ? 'bg-green-600' : 
                                project.progress >= 60 ? 'bg-amber-500' : 
                                'bg-blue-600'
                              }`} 
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {project.status === 'completed' ? 'Completado' : 'Activo'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button className="text-amber-600 hover:text-amber-900 font-medium text-xs">
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === 'transactions' && (
          <div className="overflow-x-auto">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Transacciones</h3>
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Registrar nueva transacción
              </button>
            </div>
            
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="py-3 px-4">Fecha</th>
                  <th scope="col" className="py-3 px-4">Descripción</th>
                  <th scope="col" className="py-3 px-4">Proyecto</th>
                  <th scope="col" className="py-3 px-4">Categoría</th>
                  <th scope="col" className="py-3 px-4">Tipo</th>
                  <th scope="col" className="py-3 px-4">Monto</th>
                  <th scope="col" className="py-3 px-4">Aprobado por</th>
                  <th scope="col" className="py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => {
                  const project = projectsData.find(p => p.id === transaction.projectId);
                  
                  return (
                    <tr key={transaction.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        {new Date(transaction.date).toLocaleDateString('es-CO')}
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-800">
                        {transaction.description}
                      </td>
                      <td className="py-4 px-4">
                        {project?.name}
                      </td>
                      <td className="py-4 px-4">
                        {transaction.category}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'expense' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {transaction.type === 'expense' ? 'Gasto' : 'Ingreso'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="py-4 px-4">
                        {transaction.approvedBy}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button title="Ver detalle" className="text-blue-600 hover:text-blue-900">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button title="Editar" className="text-amber-600 hover:text-amber-900">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button title="Descargar comprobante" className="text-green-600 hover:text-green-900">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No se encontraron transacciones para los criterios seleccionados
              </div>
            )}
          </div>
        )}

        {view === 'reports' && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Informes financieros</h3>
              <p className="mt-1 text-gray-500 max-w-lg mx-auto">
                Genere informes detallados sobre la ejecución presupuestaria, flujo de caja, proyecciones y más.
              </p>
              <div className="mt-6 flex justify-center space-x-4">
                <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium">
                  Generar nuevo informe
                </button>
                <button className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium">
                  Ver informes anteriores
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}