'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PermissionGuard from '@/components/PermissionGuard';
import { PermissionLevel, RESOURCES } from '@/app/auth/permissions';

// Mock documents data with directories
const initialDocumentData = [
  { 
    id: '1', 
    name: 'Informe Semestral 2025-I.pdf', 
    type: 'file',
    fileType: 'pdf',
    createdAt: '2025-04-01', 
    author: 'Juan Pérez', 
    size: '2.4 MB',
    path: '/Informes/'
  },
  { 
    id: '2', 
    name: 'Presupuesto Proyecto Extensión.xlsx', 
    type: 'file',
    fileType: 'xlsx',
    createdAt: '2025-03-28', 
    author: 'María López', 
    size: '1.8 MB',
    path: '/Finanzas/'
  },
  { 
    id: '3', 
    name: 'Convenio Universidad-Empresa.docx', 
    type: 'file',
    fileType: 'docx',
    createdAt: '2025-03-15', 
    author: 'Carlos Rodríguez', 
    size: '3.5 MB',
    path: '/Convenios/'
  },
  { 
    id: '4', 
    name: 'Formato de Inscripción.pdf', 
    type: 'file',
    fileType: 'pdf',
    createdAt: '2025-03-10', 
    author: 'Ana Martínez', 
    size: '1.2 MB',
    path: '/Formularios/'
  },
  { 
    id: '5', 
    name: 'Plan de Trabajo 2025.docx', 
    type: 'file',
    fileType: 'docx',
    createdAt: '2025-02-20', 
    author: 'Luis Gómez', 
    size: '2.1 MB',
    path: '/Planificación/'
  },
  { 
    id: 'dir1', 
    name: 'Informes', 
    type: 'directory',
    createdAt: '2025-01-10', 
    author: 'Admin Sistema', 
    size: '--',
    path: '/'
  },
  { 
    id: 'dir2', 
    name: 'Finanzas', 
    type: 'directory',
    createdAt: '2025-01-10', 
    author: 'Admin Sistema', 
    size: '--',
    path: '/'
  },
  { 
    id: 'dir3', 
    name: 'Convenios', 
    type: 'directory',
    createdAt: '2025-02-05', 
    author: 'Carlos Rodríguez', 
    size: '--',
    path: '/'
  },
  { 
    id: 'dir4', 
    name: 'Formularios', 
    type: 'directory',
    createdAt: '2025-02-08', 
    author: 'Ana Martínez', 
    size: '--',
    path: '/'
  },
  { 
    id: 'dir5', 
    name: 'Planificación', 
    type: 'directory',
    createdAt: '2025-01-15', 
    author: 'María López', 
    size: '--',
    path: '/'
  }
];

// Document type options for filtering
const documentTypes = [
  'Todos',
  'PDF',
  'Excel',
  'Word',
  'Directorios'
];

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Todos');
  const [documents, setDocuments] = useState(initialDocumentData);
  const [currentPath, setCurrentPath] = useState('/');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalType, setModalType] = useState<'file' | 'directory'>('file');
  const [newItemName, setNewItemName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  const handleCreateDirectory = () => {
    if (!newItemName.trim()) return;
    
    const newDirectory = {
      id: `dir${Date.now()}`,
      name: newItemName.trim(),
      type: 'directory',
      createdAt: new Date().toISOString().split('T')[0],
      author: 'Usuario Actual',
      size: '--',
      path: currentPath
    };
    
    setDocuments([...documents, newDirectory]);
    setShowCreateModal(false);
    setNewItemName('');
  };

  const handleFileUpload = () => {
    if (fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
      const file = fileInputRef.current.files[0];
      setUploadingFile(true);
      
      // Simulate file upload with a delay
      setTimeout(() => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        let fileType = '';
        
        switch(fileExtension) {
          case 'pdf': fileType = 'pdf'; break;
          case 'doc':
          case 'docx': fileType = 'docx'; break;
          case 'xls':
          case 'xlsx': fileType = 'xlsx'; break;
          default: fileType = fileExtension;
        }
        
        const newFile = {
          id: `file${Date.now()}`,
          name: file.name,
          type: 'file',
          fileType: fileType,
          createdAt: new Date().toISOString().split('T')[0],
          author: 'Usuario Actual',
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          path: currentPath
        };
        
        setDocuments([...documents, newFile]);
        setUploadingFile(false);
        setShowCreateModal(false);
        setNewItemName('');
      }, 1500);
    }
  };

  // Navigate to directory
  const navigateToDirectory = (dirName: string) => {
    if (dirName === '..') {
      // Go up one level
      const pathParts = currentPath.split('/').filter(p => p);
      if (pathParts.length > 0) {
        pathParts.pop();
        setCurrentPath(`/${pathParts.join('/')}/`);
      } else {
        setCurrentPath('/');
      }
    } else {
      // Go into directory
      setCurrentPath(`${currentPath}${dirName}/`);
    }
  };

  // Filter documents based on search, type, and current path
  const filteredDocuments = documents.filter(doc => {
    // Match the current path
    if (doc.path !== currentPath) return false;
    
    // Search filter
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    let matchesType = true;
    if (selectedType !== 'Todos') {
      if (selectedType === 'Directorios') {
        matchesType = doc.type === 'directory';
      } else if (selectedType === 'PDF') {
        matchesType = doc.type === 'file' && doc.fileType === 'pdf';
      } else if (selectedType === 'Excel') {
        matchesType = doc.type === 'file' && (doc.fileType === 'xlsx' || doc.fileType === 'xls');
      } else if (selectedType === 'Word') {
        matchesType = doc.type === 'file' && (doc.fileType === 'docx' || doc.fileType === 'doc');
      }
    }
    
    return matchesSearch && matchesType;
  });

  // Handle document deletion
  const handleDelete = (id: string) => {
    if(confirm('¿Está seguro que desea eliminar este elemento?')) {
      setDocuments(documents.filter(doc => doc.id !== id));
    }
  };

  // Format the breadcrumb
  const renderBreadcrumb = () => {
    const paths = currentPath.split('/').filter(p => p);
    
    return (
      <nav className="flex mb-4 text-sm">
        <button 
          onClick={() => setCurrentPath('/')}
          className="text-amber-600 hover:text-amber-800 transition-colors"
        >
          Inicio
        </button>
        
        {paths.map((path, index) => (
          <React.Fragment key={path}>
            <span className="mx-2 text-gray-500">/</span>
            <button 
              onClick={() => {
                const targetPath = '/' + paths.slice(0, index + 1).join('/') + '/';
                setCurrentPath(targetPath);
              }}
              className="text-amber-600 hover:text-amber-800 transition-colors"
            >
              {path}
            </button>
          </React.Fragment>
        ))}
      </nav>
    );
  };

  return (
    <PermissionGuard 
      resource={RESOURCES.DOCUMENTS} 
      requiredPermission={PermissionLevel.READ}
      redirectTo="/dashboard"
    >
      <div className="container mx-auto bg-white rounded-lg shadow p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Gestión Documental</h1>
          <p className="text-gray-600 mt-1">
            Administre los documentos y directorios relacionados con proyectos y programas de extensión
          </p>
        </div>

        {/* Breadcrumb navigation */}
        {renderBreadcrumb()}

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="flex items-center">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
              </div>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full pl-10 p-2.5" 
                placeholder="Buscar documentos" 
              />
            </div>
          </div>

          <div className="flex gap-4">
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 p-2.5"
            >
              {documentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <div className="flex gap-2">
              <motion.button
                onClick={() => {setShowCreateModal(true); setModalType('directory')}}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11v6M9 14h6" />
                </svg>
                Crear Directorio
              </motion.button>
              
              <motion.button 
                onClick={() => {setShowCreateModal(true); setModalType('file')}}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Subir documento
              </motion.button>
              
              <div className="flex border border-gray-300 rounded-lg">
                <motion.button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-amber-600' : 'text-gray-600'}`}
                  whileHover={{ backgroundColor: viewMode !== 'list' ? '#f3f4f6' : undefined }}
                >
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </motion.button>
                <motion.button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-amber-600' : 'text-gray-600'}`}
                  whileHover={{ backgroundColor: viewMode !== 'grid' ? '#f3f4f6' : undefined }}
                >
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Back button when inside directory */}
        {currentPath !== '/' && (
          <motion.button
            onClick={() => navigateToDirectory('..')}
            className="mb-4 flex items-center text-amber-600 hover:text-amber-800 transition-colors"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -10, opacity: 0 }}
          >
            <svg className="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
            </svg>
            Subir un nivel
          </motion.button>
        )}

        {/* Documents List View */}
        {viewMode === 'list' && (
          <div className="overflow-x-auto relative">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="py-3 px-6">Nombre</th>
                  <th scope="col" className="py-3 px-6">Tipo</th>
                  <th scope="col" className="py-3 px-6">Fecha creación</th>
                  <th scope="col" className="py-3 px-6">Autor</th>
                  <th scope="col" className="py-3 px-6">Tamaño</th>
                  <th scope="col" className="py-3 px-6">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                      <motion.tr 
                        key={doc.id} 
                        className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        whileHover={{ backgroundColor: "#f9fafb" }}
                        onClick={() => doc.type === 'directory' ? navigateToDirectory(doc.name) : null}
                      >
                        <td className="py-4 px-6 font-medium text-amber-700">
                          <div className="flex items-center">
                            {doc.type === 'directory' ? (
                              <svg className="w-6 h-6 text-amber-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
                              </svg>
                            ) : (
                              <DocumentIcon type={doc.fileType || ''} />
                            )}
                            <span className="ml-2">{doc.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">{doc.type === 'directory' ? 'Directorio' : doc.fileType?.toUpperCase()}</td>
                        <td className="py-4 px-6">{doc.createdAt}</td>
                        <td className="py-4 px-6">{doc.author}</td>
                        <td className="py-4 px-6">{doc.size}</td>
                        <td className="py-4 px-6">
                          <div className="flex space-x-3" onClick={(e) => e.stopPropagation()}>
                            {doc.type === 'file' && (
                              <>
                                <button className="text-blue-600 hover:text-blue-900">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                <button className="text-green-600 hover:text-green-900">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </button>
                              </>
                            )}
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr 
                      className="bg-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td colSpan={6} className="py-4 px-6 text-center text-gray-500">
                        No se encontraron documentos que coincidan con el criterio de búsqueda
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Documents Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <AnimatePresence>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <motion.div
                    key={doc.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md cursor-pointer"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5 }}
                    onClick={() => doc.type === 'directory' ? navigateToDirectory(doc.name) : null}
                  >
                    <div className="p-4 flex flex-col items-center">
                      {doc.type === 'directory' ? (
                        <svg className="w-16 h-16 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
                        </svg>
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center">
                          <DocumentIcon large type={doc.fileType || ''} />
                        </div>
                      )}
                      <div className="mt-2 text-center">
                        <h3 className="text-sm font-medium text-gray-900 truncate w-full max-w-[140px]">{doc.name}</h3>
                        <p className="text-xs text-gray-500">{doc.type === 'directory' ? 'Directorio' : doc.fileType?.toUpperCase()}</p>
                      </div>
                      
                      <div className="mt-2 flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        {doc.type === 'file' && (
                          <>
                            <button className="text-blue-600 hover:text-blue-900 p-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button className="text-green-600 hover:text-green-900 p-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                          </>
                        )}
                        <button 
                          className="text-red-600 hover:text-red-900 p-1"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  className="col-span-full text-center py-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay documentos</h3>
                  <p className="mt-1 text-sm text-gray-500">No se encontraron documentos que coincidan con el criterio de búsqueda</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div 
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {modalType === 'directory' ? 'Crear Nuevo Directorio' : 'Subir Documento'}
                </h3>
                
                {modalType === 'directory' ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="directoryName" className="block text-sm font-medium text-gray-700">
                        Nombre del directorio
                      </label>
                      <input
                        type="text"
                        id="directoryName"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Mi Directorio"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowCreateModal(false)}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleCreateDirectory}
                        disabled={!newItemName.trim()}
                        className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
                          !newItemName.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'
                        }`}
                      >
                        Crear
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="fileUpload"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                          uploadingFile ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingFile ? (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="animate-spin h-8 w-8 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-2 text-sm text-gray-500">Cargando archivo...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            <p className="mt-2 text-sm text-gray-500">
                              <span className="font-semibold">Haga clic para cargar</span> o arrastre y suelte
                            </p>
                            <p className="text-xs text-gray-500">PDF, Word, Excel (MAX. 10MB)</p>
                          </div>
                        )}
                        <input 
                          id="fileUpload"
                          ref={fileInputRef}
                          type="file" 
                          className="hidden" 
                          disabled={uploadingFile}
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowCreateModal(false)}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PermissionGuard>
  );
}

// Helper component for document icons
const DocumentIcon = ({ type, large = false }: { type: string, large?: boolean }) => {
  const size = large ? "w-12 h-12" : "w-6 h-6";
  
  switch(type.toLowerCase()) {
    case 'pdf':
      return (
        <svg className={`${size} text-red-500`} fill="currentColor" viewBox="0 0 384 512">
          <path d="M320 464C328.8 464 336 456.8 336 448V416H384V448C384 483.3 355.3 512 320 512H64C28.65 512 0 483.3 0 448V416H48V448C48 456.8 55.16 464 64 464H320zM256 160C238.3 160 224 145.7 224 128V48H64C55.16 48 48 55.16 48 64V192H0V64C0 28.65 28.65 0 64 0H229.5C246.5 0 262.7 6.743 274.7 18.75L365.3 109.3C377.3 121.3 384 137.5 384 154.5V192H336V160H256zM88 224C118.9 224 144 249.1 144 280C144 310.9 118.9 336 88 336H80V368H88C136.6 368 176 328.6 176 280C176 231.4 136.6 192 88 192H56C42.75 192 32 202.7 32 216V400C32 405.1 35.58 410.6 40.97 412.8C46.37 415 52.51 413.1 56 408.9L76.11 384H152V448H56C42.75 448 32 437.3 32 424V416H24C10.75 416 0 405.3 0 392V216C0 184.7 25.07 160 56 160H88C92.42 160 96 163.6 96 168C96 172.4 92.42 176 88 176H56C33.91 176 16 193.9 16 216V392H32V224H88zM204 224H252C286.7 224 312 249.3 312 284V328C312 362.7 286.7 388 252 388H220C206.7 388 196 377.3 196 364V248C196 234.7 206.7 224 220 224H204zM228 248V364H252C269.7 364 280 353.7 280 336V276C280 258.3 269.7 248 252 248H228zM288 424C288 410.7 298.7 400 312 400H336C371.3 400 400 371.3 400 336V248C400 234.7 410.7 224 424 224H432C445.3 224 456 234.7 456 248V336C456 389 413 432 360 432H312C298.7 432 288 421.3 288 408V424zM384 336C384 362.5 362.5 384 336 384H328V416H336C379.7 416 416 379.7 416 336V248H384V336z"/>
        </svg>
      );
    case 'docx':
    case 'doc':
      return (
        <svg className={`${size} text-blue-500`} fill="currentColor" viewBox="0 0 384 512">
          <path d="M224 128V0H48C21.49 0 0 21.49 0 48v416C0 490.5 21.49 512 48 512h288c26.51 0 48-21.49 48-48V160h-127.1C238.3 160 224 145.7 224 128zM281.5 240h23.37c7.717 0 13.43 7.18 11.69 14.7l-42.46 184C272.9 444.1 268 448 262.5 448h-29.26c-5.426 0-10.18-3.641-11.59-8.883L192 329.1l-29.61 109.1C160.1 444.4 156.2 448 150.8 448H121.5c-5.588 0-10.44-3.859-11.69-9.305l-42.46-184C65.66 247.2 71.37 240 79.08 240h23.37c5.588 0 10.44 3.859 11.69 9.301L137.8 352L165.6 248.9C167 243.6 171.8 240 177.2 240h29.61c5.426 0 10.18 3.641 11.59 8.883L246.2 352l23.7-102.7C271.1 243.9 275.1 240 281.5 240zM256 0v128h128L256 0z"/>
        </svg>
      );
    case 'xlsx':
    case 'xls':
      return (
        <svg className={`${size} text-green-500`} fill="currentColor" viewBox="0 0 384 512">
          <path d="M224 128V0H48C21.49 0 0 21.49 0 48v416C0 490.5 21.49 512 48 512h288c26.51 0 48-21.49 48-48V160h-127.1C238.3 160 224 145.7 224 128zM272.1 264.4L224 344l48.99 79.61C279.6 434.3 271.9 448 259.4 448h-26.43c-5.557 0-10.71-2.883-13.63-7.617L192 396l-27.31 44.38C161.8 445.1 156.6 448 151.1 448H124.6c-12.52 0-20.19-13.73-13.63-24.39L160 344L111 264.4C104.4 253.7 112.1 240 124.6 240h26.43c5.557 0 10.71 2.883 13.63 7.613L192 292l27.31-44.39C222.2 242.9 227.4 240 232.9 240h26.43C271.9 240 279.6 253.7 272.1 264.4zM256 0v128h128L256 0z"/>
        </svg>
      );
    default:
      return (
        <svg className={`${size} text-gray-400`} fill="currentColor" viewBox="0 0 384 512">
          <path d="M365.3 93.38l-74.63-74.64C278.6 6.742 262.3 0 245.4 0L64-.0001c-35.35 0-64 28.65-64 64l.0065 384c0 35.34 28.65 64 64 64H320c35.2 0 64-28.8 64-64V138.6C384 121.7 377.3 105.4 365.3 93.38zM320 464H64.02c-8.836 0-15.1-7.164-15.1-16L48 64.13c0-8.836 7.164-16 16-16h160L224 128c0 17.67 14.33 32 32 32h79.1v288C336 456.8 328.8 464 320 464z"/>
        </svg>
      );
  }
};