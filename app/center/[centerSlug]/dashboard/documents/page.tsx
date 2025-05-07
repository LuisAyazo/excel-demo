'use client';

import React, { useState, useRef, useEffect } from 'react';
import PermissionGuard from '@/components/PermissionGuard';
import { PermissionLevel, RESOURCES } from '@/app/auth/permissions';
import DocumentIcon from '@/components/DocumentIcon';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Referencia para la altura del contenedor de "subir nivel"
  const backButtonRef = useRef<HTMLDivElement>(null);
  const [backButtonHeight, setBackButtonHeight] = useState(0);
  
  // Detectar la altura del botón "subir nivel" para animaciones suaves
  useEffect(() => {
    if (backButtonRef.current) {
      setBackButtonHeight(backButtonRef.current.offsetHeight);
    }
  }, [currentPath]);
  
  // Handle directory creation
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

  // Handle file upload
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
  
  // Sort functions
  const toggleSort = (sortField: 'name' | 'date' | 'size') => {
    if (sortBy === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(sortField);
      setSortOrder('asc');
    }
  };
  
  // Sort documents
  const sortDocuments = (docs: any[]) => {
    return [...docs].sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        // For size, handle directory specially
        if (a.type === 'directory' && b.type !== 'directory') {
          return sortOrder === 'asc' ? -1 : 1;
        }
        if (a.type !== 'directory' && b.type === 'directory') {
          return sortOrder === 'asc' ? 1 : -1;
        }
        if (a.type === 'directory' && b.type === 'directory') {
          return 0;
        }
        // Convert size strings to comparable numbers
        const sizeA = parseFloat(a.size);
        const sizeB = parseFloat(b.size);
        return sortOrder === 'asc' ? sizeA - sizeB : sizeB - sizeA;
      }
    });
  };

  // Navigate to directory
  const navigateToDirectory = (dirName: string) => {
    if (dirName === '..') {
      // Go up one level - Corregir la lógica para asegurar que siempre se muestre contenido
      const pathParts = currentPath.split('/').filter(p => p);
      if (pathParts.length > 0) {
        pathParts.pop();
        const newPath = pathParts.length > 0 ? `/${pathParts.join('/')}/` : '/';
        setCurrentPath(newPath);
      } else {
        setCurrentPath('/');
      }
    } else {
      // Go into directory
      setCurrentPath(`${currentPath}${dirName}/`);
    }
  };

  // Handle document click
  const handleDocClick = (doc: any) => {
    if (doc.type === 'directory') {
      navigateToDirectory(doc.name);
    } else {
      setSelectedDoc(doc);
      setShowFileDetails(true);
    }
  };

  // Handle document deletion
  const handleDelete = (id: string) => {
    if(confirm('¿Está seguro que desea eliminar este elemento?')) {
      setDocuments(documents.filter(doc => doc.id !== id));
      if (selectedDoc && selectedDoc.id === id) {
        setSelectedDoc(null);
        setShowFileDetails(false);
      }
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
  
  // Sort filtered documents
  const sortedDocuments = sortDocuments(filteredDocuments);
  
  // Calculate document stats
  const docStats = {
    total: filteredDocuments.length,
    files: filteredDocuments.filter(doc => doc.type === 'file').length,
    folders: filteredDocuments.filter(doc => doc.type === 'directory').length,
  };

  // Format the breadcrumb
  const renderBreadcrumb = () => {
    const paths = currentPath.split('/').filter(p => p);
    
    return (
      <nav className="flex items-center flex-wrap text-sm mb-4">
        <div className="p-2 rounded-md hover:bg-gray-100 transition-colors">
          <button 
            onClick={() => setCurrentPath('/')}
            className="text-blue-600 hover:text-blue-800 transition-colors font-medium flex items-center"
          >
            <svg className="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Inicio
          </button>
        </div>
        
        {paths.map((path, index) => (
          <React.Fragment key={path}>
            <span className="mx-2 text-gray-500">/</span>
            <div className="p-2 rounded-md hover:bg-gray-100 transition-colors">
              <button 
                onClick={() => {
                  const targetPath = '/' + paths.slice(0, index + 1).join('/') + '/';
                  setCurrentPath(targetPath);
                }}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                {path}
              </button>
            </div>
          </React.Fragment>
        ))}
      </nav>
    );
  };

  // Animation variants with improvements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.03  // Más rápido para mejor respuesta
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };
  
  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: 10  // Movimiento más sutil
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,  // Más firme
        damping: 30      // Menos rebote
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.15 }
    }
  };
  
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.15
      }
    }
  };

  // Back button animation variants
  const backButtonVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      marginBottom: 0
    },
    visible: { 
      opacity: 1, 
      height: 'auto',
      marginBottom: 24,  // 6 * 4 = 24px for mb-6
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    },
    exit: { 
      opacity: 0,
      height: 0,
      marginBottom: 0,
      transition: {
        opacity: { duration: 0.2 },
        height: { duration: 0.3 }
      }
    }
  };
  
  return (
    <PermissionGuard 
      resource={RESOURCES.DOCUMENTS} 
      requiredPermission={PermissionLevel.READ}
      redirectTo="/dashboard"
    >
      {/* Main container with new design */}
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header section with new design */}
        <div className="bg-white p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión Documental</h1>
              <p className="text-gray-500 mt-1">
                Administre documentos y carpetas relacionados con proyectos y programas
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {setShowCreateModal(true); setModalType('file')}}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium flex items-center transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                Subir documento
              </button>
              <button
                onClick={() => {setShowCreateModal(true); setModalType('directory')}}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-5 py-2 rounded-md font-medium flex items-center transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
                Nueva carpeta
              </button>
            </div>
          </div>
        </div>

        {/* Document workspace */}
        <div className="flex-1 p-6">
          {/* Navigation and filters row */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div className="flex-1">
              {renderBreadcrumb()}
              
              {/* Stats pills */}
              <div className="flex gap-3 mt-2">
                <div className="text-xs bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-medium">
                  {docStats.total} elementos
                </div>
                <div className="text-xs bg-green-100 text-green-800 py-1 px-3 rounded-full font-medium">
                  {docStats.files} archivos
                </div>
                <div className="text-xs bg-amber-100 text-amber-800 py-1 px-3 rounded-full font-medium">
                  {docStats.folders} carpetas
                </div>
              </div>
            </div>

            {/* Control bar */}
            <div className="flex w-full md:w-auto flex-wrap items-center gap-3">
              <div className="relative flex-1 md:w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                  </svg>
                </div>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md block w-full pl-10 p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="Buscar archivos y carpetas" 
                />
              </div>
              
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              <div className="flex shadow-sm rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 border border-gray-300 ${viewMode === 'list' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-700'}`}
                >
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 border border-gray-300 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-700'}`}
                >
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
              
              <div className="flex shadow-sm rounded-md overflow-hidden">
                <button
                  onClick={() => toggleSort('name')}
                  className={`p-2.5 border border-gray-300 ${sortBy === 'name' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-700'}`}
                  title="Ordenar por nombre"
                >
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                </button>
                <button
                  onClick={() => toggleSort('date')}
                  className={`p-2.5 border border-gray-300 ${sortBy === 'date' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-700'}`}
                  title="Ordenar por fecha"
                >
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => toggleSort('size')}
                  className={`p-2.5 border border-gray-300 ${sortBy === 'size' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-700'}`}
                  title="Ordenar por tamaño"
                >
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Back button when inside directory with improved animation */}
          <div style={{ minHeight: currentPath !== '/' ? backButtonHeight || 40 : 0 }} className="relative w-full">
            <AnimatePresence>
              {currentPath !== '/' && (
                <motion.div
                  ref={backButtonRef}
                  key="back-button"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={backButtonVariants}
                  className="absolute w-full"
                >
                  <button
                    onClick={() => navigateToDirectory('..')}
                    className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-md transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Subir un nivel
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content area - improved styling with animations */}
          <div className={`bg-white border border-gray-200 rounded-lg ${showFileDetails ? 'grid grid-cols-3' : ''}`}>
            <div className={showFileDetails ? "col-span-2 border-r border-gray-200 relative" : "relative"}>
              {/* Documents List View with improved animations */}
              {viewMode === 'list' && (
                <div className="overflow-x-auto relative">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
                      <tr>
                        <th scope="col" className="py-3 px-6">
                          <div className="flex items-center cursor-pointer" onClick={() => toggleSort('name')}>
                            Nombre
                            {sortBy === 'name' && (
                              <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="py-3 px-6">Tipo</th>
                        <th scope="col" className="py-3 px-6">
                          <div className="flex items-center cursor-pointer" onClick={() => toggleSort('date')}>
                            Fecha creación
                            {sortBy === 'date' && (
                              <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="py-3 px-6">Autor</th>
                        <th scope="col" className="py-3 px-6">
                          <div className="flex items-center cursor-pointer" onClick={() => toggleSort('size')}>
                            Tamaño
                            {sortBy === 'size' && (
                              <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="py-3 px-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`list-${currentPath}`}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={containerVariants}
                          className="contents"
                        >
                          {sortedDocuments.length > 0 ? (
                            sortedDocuments.map((doc) => (
                              <motion.tr 
                                key={doc.id}
                                variants={itemVariants}
                                className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${selectedDoc && selectedDoc.id === doc.id ? 'bg-blue-50' : 'bg-white'}`}
                                onClick={() => handleDocClick(doc)}
                              >
                                <td className="py-4 px-6 font-medium">
                                  <div className="flex items-center">
                                    <div className="mr-3 flex-shrink-0">
                                      <DocumentIcon 
                                        fileName={doc.name} 
                                        isDirectory={doc.type === 'directory'} 
                                        size={20} 
                                        view="list"
                                      />
                                    </div>
                                    <span className="truncate max-w-xs">{doc.name}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  {doc.type === 'directory' ? (
                                    <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded">Carpeta</span>
                                  ) : (
                                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                                      doc.fileType === 'pdf' ? 'bg-red-100 text-red-800' : 
                                      doc.fileType === 'docx' ? 'bg-blue-100 text-blue-800' : 
                                      doc.fileType === 'xlsx' ? 'bg-green-100 text-green-800' : 
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {doc.fileType?.toUpperCase()}
                                    </span>
                                  )}
                                </td>
                                <td className="py-4 px-6">{doc.createdAt}</td>
                                <td className="py-4 px-6">{doc.author}</td>
                                <td className="py-4 px-6">{doc.size}</td>
                                <td className="py-4 px-6 text-right">
                                  <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                                    {doc.type === 'file' && (
                                      <>
                                        <button className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                          </svg>
                                        </button>
                                        <button className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                          </svg>
                                        </button>
                                      </>
                                    )}
                                    <button 
                                      className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
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
                            <motion.tr variants={itemVariants}>
                              <td colSpan={6} className="py-6 text-center">
                                <div className="flex flex-col items-center">
                                  <svg className="w-12 h-12 text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                  </svg>
                                  <h3 className="mb-1 text-lg font-medium text-gray-900">No se encontraron documentos</h3>
                                  <p className="text-gray-500">No hay documentos en esta ubicación que coincidan con su búsqueda</p>
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Documents Grid View - improved animations and layout */}
              {viewMode === 'grid' && (
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={`grid-${currentPath}`}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4"
                  >
                    {sortedDocuments.length > 0 ? (
                      sortedDocuments.map((doc) => (
                        <motion.div
                          key={doc.id}
                          variants={itemVariants}
                          whileHover={{ 
                            scale: 1.03,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)" 
                          }}
                          className={`border rounded-lg p-4 flex flex-col items-center hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedDoc?.id === doc.id ? 'bg-blue-50 border-blue-300' : ''
                          }`}
                          onClick={() => handleDocClick(doc)}
                        >
                          <div className="w-16 h-16 mb-3">
                            <DocumentIcon 
                              fileName={doc.name} 
                              isDirectory={doc.type === 'directory'} 
                              size={48} 
                              view="grid"
                            />
                          </div>
                          <div className="w-full text-center">
                            <p className="text-sm font-medium truncate" title={doc.name}>
                              {doc.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {doc.type === 'directory' ? 'Carpeta' : doc.fileType?.toUpperCase()}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        variants={itemVariants}
                        className="col-span-full flex flex-col items-center justify-center py-10"
                      >
                        <svg className="w-16 h-16 text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <h3 className="mb-1 text-lg font-medium text-gray-900">No se encontraron documentos</h3>
                        <p className="text-gray-500">No hay documentos en esta ubicación que coincidan con su búsqueda</p>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
            
            {/* File Details Panel - with improved animation */}
            <AnimatePresence>
              {showFileDetails && selectedDoc && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="p-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Detalles del archivo</h3>
                    <button 
                      onClick={() => setShowFileDetails(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="h-24 w-24 mx-auto mb-2">
                      <DocumentIcon 
                        fileName={selectedDoc.name} 
                        isDirectory={selectedDoc.type === 'directory'} 
                        size={22}
                        view="grid"
                      />
                    </div>
                    <h3 className="mt-2 text-xl font-semibold text-gray-900 break-all">{selectedDoc.name}</h3>
                    {selectedDoc.type !== 'directory' && (
                      <span className={`inline-block mt-2 text-sm font-medium px-3 py-1 rounded ${
                        selectedDoc.fileType === 'pdf' ? 'bg-red-100 text-red-800' : 
                        selectedDoc.fileType === 'docx' ? 'bg-blue-100 text-blue-800' : 
                        selectedDoc.fileType === 'xlsx' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedDoc.fileType?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedDoc.type === 'directory' ? 'Carpeta' : `Documento ${selectedDoc.fileType?.toUpperCase()}`}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Tamaño</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedDoc.size}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Fecha de creación</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedDoc.createdAt}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Creado por</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedDoc.author}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Ubicación</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedDoc.path || '/'}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  {selectedDoc.type === 'file' && (
                    <div className="mt-6 flex flex-col gap-3">
                      <button className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver documento
                      </button>
                      <button className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Descargar
                      </button>
                      <button 
                        className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={() => handleDelete(selectedDoc.id)}
                      >
                        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Create Modal - improved styling */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div 
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={modalVariants}
                className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600"></div>
                
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {modalType === 'directory' ? 'Crear Nueva Carpeta' : 'Subir Documento'}
                  </h3>
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {modalType === 'directory' ? (
                  <div className="space-y-4">
                    <div className="mb-6">
                      <label htmlFor="directoryName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de la carpeta
                      </label>
                      <input
                        type="text"
                        id="directoryName"
                        autoFocus
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Mi nueva carpeta"
                      />
                      <p className="mt-1 text-xs text-gray-500">La carpeta se creará en la ubicación actual: {currentPath}</p>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowCreateModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleCreateDirectory}
                        disabled={!newItemName.trim()}
                        className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          !newItemName.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        Crear carpeta
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="fileUpload"
                        className={`flex flex-col items-center justify-center w-full h-40 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors ${
                          uploadingFile ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingFile ? (
                          <div className="flex flex-col items-center justify-center py-5">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                            <p className="text-sm text-blue-700">Cargando documento...</p>
                            <p className="text-xs text-gray-500 mt-1">Por favor espere</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-5">
                            <svg className="w-10 h-10 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            <p className="text-sm text-blue-700 mb-1">
                              <span className="font-medium">Haga clic para cargar</span> o arrastre y suelte
                            </p>
                            <p className="text-xs text-gray-500">PDF, Word, Excel (Máximo 10MB)</p>
                            <p className="text-xs text-gray-500 mt-1">Ubicación actual: {currentPath}</p>
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
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
