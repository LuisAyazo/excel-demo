'use client';

import React, { useState } from 'react';
import PermissionGuard from '../../../components/PermissionGuard';
import { RESOURCES, ACTIONS } from '../../auth/permissions';

// Mock budget data
const budgetData = [
  {
    id: '1',
    projectName: 'Formación en Emprendimiento Social',
    totalAmount: 25000000,
    allocatedAmount: 15000000,
    spentAmount: 8500000,
    remainingAmount: 6500000,
    status: 'En ejecución',
    startDate: '2025-02-15',
    endDate: '2025-06-30'
  },
  {
    id: '2',
    projectName: 'Convenio Universidad-Empresa Sector Turismo',
    totalAmount: 45000000,
    allocatedAmount: 45000000,
    spentAmount: 22500000,
    remainingAmount: 22500000,
    status: 'En ejecución',
    startDate: '2025-01-10',
    endDate: '2025-08-15'
  },
  {
    id: '3',
    projectName: 'Programa de Extensión Comunitaria',
    totalAmount: 18000000,
    allocatedAmount: 18000000,
    spentAmount: 16200000,
    remainingAmount: 1800000,
    status: 'Por finalizar',
    startDate: '2025-01-05',
    endDate: '2025-05-10'
  },
  {
    id: '4',
    projectName: 'Investigación Aplicada en Sector Ambiental',
    totalAmount: 32000000,
    allocatedAmount: 0,
    spentAmount: 0,
    remainingAmount: 0,
    status: 'Por iniciar',
    startDate: '2025-06-01',
    endDate: '2025-12-15'
  },
  {
    id: '5',
    projectName: 'Capacitación en Desarrollo Tecnológico',
    totalAmount: 15000000,
    allocatedAmount: 15000000,
    spentAmount: 15000000,
    remainingAmount: 0,
    status: 'Finalizado',
    startDate: '2025-01-05',
    endDate: '2025-03-25'
  }
];

// Budget status options for filtering
const statusOptions = [
  'Todos',
  'Por iniciar',
  'En ejecución',
  'Por finalizar',
  'Finalizado'
];

export default function BudgetPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortField, setSortField] = useState<string>('totalAmount');

  // Format currency display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Calculate budget summary
  const calculateSummary = () => {
    return budgetData.reduce(
      (acc, item) => {
        acc.total += item.totalAmount;
        acc.allocated += item.allocatedAmount;
        acc.spent += item.spentAmount;
        acc.remaining += item.remainingAmount;
        return acc;
      },
      { total: 0, allocated: 0, spent: 0, remaining: 0 }
    );
  };

  // Sort budgets based on selected field and order
  const sortBudgets = (a: any, b: any) => {
    if (sortField === 'projectName') {
      const comparison = a.projectName.localeCompare(b.projectName);
      return sortOrder === 'asc' ? comparison : -comparison;
    } else {
      const comparison = a[sortField] - b[sortField];
      return sortOrder === 'asc' ? comparison : -comparison;
    }
  };

  // Toggle sort order and field
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter budgets based on search and status
  const filteredBudgets = budgetData
    .filter(budget => {
      const matchesSearch = budget.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'Todos' || budget.status === selectedStatus;
      return matchesSearch && matchesStatus;
    })
    .sort(sortBudgets);

  const summary = calculateSummary();

  // Calculate progress percentage for budgets
  const calculateProgress = (spent: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((spent / total) * 100);
  };

  return (
    <PermissionGuard resource={RESOURCES.BUDGET} requiredPermission={ACTIONS.READ}>
      <div className="container mx-auto bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Presupuesto</h1>
          <p className="text-gray-600 mt-1">
            Control y seguimiento presupuestario de proyectos y programas de extensión
          </p>
        </div>

        {/* Budget Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-xs font-medium text-amber-800 uppercase">Presupuesto Total</p>
            <h4 className="text-xl font-bold text-amber-900 mt-1">{formatCurrency(summary.total)}</h4>
            <p className="text-xs text-amber-700 mt-1">Asignado a todos los proyectos</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-xs font-medium text-blue-800 uppercase">Monto Asignado</p>
            <h4 className="text-xl font-bold text-blue-900 mt-1">{formatCurrency(summary.allocated)}</h4>
            <p className="text-xs text-blue-700 mt-1">{Math.round((summary.allocated / summary.total) * 100)}% del presupuesto total</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-xs font-medium text-green-800 uppercase">Monto Ejecutado</p>
            <h4 className="text-xl font-bold text-green-900 mt-1">{formatCurrency(summary.spent)}</h4>
            <p className="text-xs text-green-700 mt-1">{Math.round((summary.spent / summary.allocated) * 100)}% del monto asignado</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-xs font-medium text-purple-800 uppercase">Monto Disponible</p>
            <h4 className="text-xl font-bold text-purple-900 mt-1">{formatCurrency(summary.remaining)}</h4>
            <p className="text-xs text-purple-700 mt-1">{Math.round((summary.remaining / summary.allocated) * 100)}% del monto asignado</p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
          <div className="flex items-center">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
              </div>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full pl-10 p-2.5 sm:w-64" 
                placeholder="Buscar proyectos" 
              />
            </div>
          </div>

          <div className="flex gap-4">
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 p-2.5"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            
            <button 
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Nuevo presupuesto
            </button>
          </div>
        </div>

        {/* Budget Table */}
        <div className="overflow-x-auto relative">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => toggleSort('projectName')}>
                  <div className="flex items-center">
                    Proyecto
                    {sortField === 'projectName' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => toggleSort('totalAmount')}>
                  <div className="flex items-center">
                    Presupuesto
                    {sortField === 'totalAmount' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => toggleSort('spentAmount')}>
                  <div className="flex items-center">
                    Ejecutado
                    {sortField === 'spentAmount' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th scope="col" className="py-3 px-6">Progreso</th>
                <th scope="col" className="py-3 px-6">Estado</th>
                <th scope="col" className="py-3 px-6">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredBudgets.length > 0 ? (
                filteredBudgets.map((budget) => {
                  const progressPercentage = calculateProgress(budget.spentAmount, budget.allocatedAmount);
                  let progressColorClass = "bg-blue-600";
                  
                  if (progressPercentage >= 100) {
                    progressColorClass = "bg-green-600";
                  } else if (progressPercentage >= 75) {
                    progressColorClass = "bg-yellow-500";
                  } else if (progressPercentage >= 50) {
                    progressColorClass = "bg-orange-500";
                  }

                  return (
                    <tr key={budget.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="py-4 px-6 font-medium text-amber-700">
                        <div>
                          {budget.projectName}
                          <span className="block text-xs text-gray-500">
                            {budget.startDate} al {budget.endDate}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {formatCurrency(budget.totalAmount)}
                      </td>
                      <td className="py-4 px-6">
                        {formatCurrency(budget.spentAmount)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${progressColorClass}`}
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs font-medium">{progressPercentage}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          budget.status === 'Finalizado' 
                            ? 'bg-green-100 text-green-800' 
                            : budget.status === 'En ejecución'
                            ? 'bg-blue-100 text-blue-800'
                            : budget.status === 'Por finalizar'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {budget.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-3">
                          <button className="text-blue-600 hover:text-blue-900" title="Ver detalles">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button className="text-amber-600 hover:text-amber-900" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button className="text-green-600 hover:text-green-900" title="Exportar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className="bg-white">
                  <td colSpan={6} className="py-4 px-6 text-center text-gray-500">
                    No se encontraron presupuestos que coincidan con el criterio de búsqueda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Chart Placeholder */}
        <div className="mt-8 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución del Presupuesto</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <p className="mt-2 text-sm text-gray-500">
                Aquí se mostraría una gráfica con la distribución del presupuesto
              </p>
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}