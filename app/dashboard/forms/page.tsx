'use client';

import React, { useState } from 'react';

// Mock form templates data
const formsData = [
  {
    id: '1',
    name: 'Formato Presentación de Proyectos',
    description: 'Formato estándar para la presentación de proyectos de extensión',
    category: 'Proyectos',
    lastUpdated: '2025-04-10',
    status: 'Activo',
    fields: 24
  },
  {
    id: '2',
    name: 'Presupuesto de Actividades',
    description: 'Formato para elaboración de presupuestos de actividades de extensión',
    category: 'Financiero',
    lastUpdated: '2025-03-25',
    status: 'Activo',
    fields: 18
  },
  {
    id: '3',
    name: 'Inscripción de Participantes',
    description: 'Formulario para inscripción de participantes en actividades',
    category: 'Participantes',
    lastUpdated: '2025-03-15',
    status: 'Activo',
    fields: 12
  },
  {
    id: '4',
    name: 'Evaluación de Impacto',
    description: 'Formato para evaluar el impacto de proyectos finalizados',
    category: 'Evaluación',
    lastUpdated: '2025-02-28',
    status: 'Activo',
    fields: 30
  },
  {
    id: '5',
    name: 'Registro de Horas',
    description: 'Formato para registro de horas de trabajo en proyectos',
    category: 'Administrativo',
    lastUpdated: '2025-02-15',
    status: 'Inactivo',
    fields: 8
  }
];

// Form categories for filtering
const formCategories = [
  'Todos',
  'Proyectos',
  'Financiero',
  'Participantes',
  'Evaluación',
  'Administrativo'
];

export default function FormsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedTab, setSelectedTab] = useState('templates');
  const [forms, setForms] = useState(formsData);
  const [showNewFormModal, setShowNewFormModal] = useState(false);

  // Filter forms based on search and category
  const filteredForms = forms.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || form.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Toggle form active status
  const toggleStatus = (id: string) => {
    setForms(forms.map(form => 
      form.id === id ? { ...form, status: form.status === 'Activo' ? 'Inactivo' : 'Activo' } : form
    ));
  };

  // Handle form deletion
  const handleDelete = (id: string) => {
    if(confirm('¿Está seguro que desea eliminar este formulario?')) {
      setForms(forms.filter(form => form.id !== id));
    }
  };

  // Mock function for creating a new form
  const handleCreateForm = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would save the form to a database
    setShowNewFormModal(false);
    // Show a success message
    alert('Formulario creado exitosamente');
  };

  return (
    <div className="container mx-auto bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Formularios</h1>
        <p className="text-gray-600 mt-1">
          Administre los formularios y plantillas del sistema
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setSelectedTab('templates')}
              className={`inline-flex items-center py-2 px-4 text-sm font-medium text-center ${
                selectedTab === 'templates'
                  ? 'text-amber-600 border-b-2 border-amber-600'
                  : 'text-gray-500 border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Plantillas
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setSelectedTab('submissions')}
              className={`inline-flex items-center py-2 px-4 text-sm font-medium text-center ${
                selectedTab === 'submissions'
                  ? 'text-amber-600 border-b-2 border-amber-600'
                  : 'text-gray-500 border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Envíos
            </button>
          </li>
        </ul>
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
              placeholder="Buscar formularios" 
            />
          </div>
        </div>

        <div className="flex gap-4">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 p-2.5"
          >
            {formCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <button 
            onClick={() => setShowNewFormModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Crear formulario
          </button>
        </div>
      </div>

      {/* Content based on selected tab */}
      {selectedTab === 'templates' ? (
        <>
          {/* Templates Table */}
          <div className="overflow-x-auto relative">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="py-3 px-6">Nombre</th>
                  <th scope="col" className="py-3 px-6">Descripción</th>
                  <th scope="col" className="py-3 px-6">Categoría</th>
                  <th scope="col" className="py-3 px-6">Última actualización</th>
                  <th scope="col" className="py-3 px-6">Estado</th>
                  <th scope="col" className="py-3 px-6">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredForms.length > 0 ? (
                  filteredForms.map((form) => (
                    <tr key={form.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="py-4 px-6 font-medium text-amber-700">
                        <div className="flex items-center">
                          <FormIcon />
                          <span className="ml-2">{form.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate">{form.description}</td>
                      <td className="py-4 px-6">{form.category}</td>
                      <td className="py-4 px-6">{form.lastUpdated}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          form.status === 'Activo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {form.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-3">
                          <button className="text-blue-600 hover:text-blue-900">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            className="text-amber-600 hover:text-amber-900"
                            onClick={() => toggleStatus(form.id)}
                          >
                            {form.status === 'Activo' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDelete(form.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="bg-white">
                    <td colSpan={6} className="py-4 px-6 text-center text-gray-500">
                      No se encontraron formularios que coincidan con el criterio de búsqueda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay envíos recientes</h3>
          <p className="mt-1 text-sm text-gray-500">
            Los envíos de formularios completados aparecerán aquí.
          </p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Crear nuevo envío
            </button>
          </div>
        </div>
      )}

      {/* New Form Modal */}
      {showNewFormModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Crear nuevo formulario</h3>
              <button 
                onClick={() => setShowNewFormModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateForm} className="p-6">
              <div className="mb-4">
                <label htmlFor="formName" className="block mb-2 text-sm font-medium text-gray-700">Nombre del formulario</label>
                <input 
                  type="text" 
                  id="formName" 
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5" 
                  placeholder="Ej: Formulario de inscripción" 
                  required 
                />
              </div>
              <div className="mb-4">
                <label htmlFor="formDescription" className="block mb-2 text-sm font-medium text-gray-700">Descripción</label>
                <textarea 
                  id="formDescription" 
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5" 
                  placeholder="Breve descripción del propósito del formulario" 
                  rows={3}
                  required 
                ></textarea>
              </div>
              <div className="mb-4">
                <label htmlFor="formCategory" className="block mb-2 text-sm font-medium text-gray-700">Categoría</label>
                <select 
                  id="formCategory" 
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
                  required
                >
                  {formCategories.filter(cat => cat !== 'Todos').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end mt-6 space-x-4">
                <button
                  type="button"
                  onClick={() => setShowNewFormModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Crear formulario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for form icons
const FormIcon = () => (
  <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
  </svg>
);