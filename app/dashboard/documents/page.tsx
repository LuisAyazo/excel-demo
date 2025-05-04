'use client';

import React, { useState } from 'react';
import PermissionGuard from '@/components/PermissionGuard';
import { PermissionLevel, RESOURCES } from '@/app/auth/permissions';

// Mock documents data
const documentData = [
  { 
    id: '1', 
    name: 'Informe Semestral 2025-I.pdf', 
    type: 'Informe', 
    createdAt: '2025-04-01', 
    author: 'Juan Pérez', 
    size: '2.4 MB' 
  },
  { 
    id: '2', 
    name: 'Presupuesto Proyecto Extensión.xlsx', 
    type: 'Presupuesto', 
    createdAt: '2025-03-28', 
    author: 'María López', 
    size: '1.8 MB' 
  },
  { 
    id: '3', 
    name: 'Convenio Universidad-Empresa.docx', 
    type: 'Convenio', 
    createdAt: '2025-03-15', 
    author: 'Carlos Rodríguez', 
    size: '3.5 MB' 
  },
  { 
    id: '4', 
    name: 'Formato de Inscripción.pdf', 
    type: 'Formato', 
    createdAt: '2025-03-10', 
    author: 'Ana Martínez', 
    size: '1.2 MB' 
  },
  { 
    id: '5', 
    name: 'Plan de Trabajo 2025.docx', 
    type: 'Planeación', 
    createdAt: '2025-02-20', 
    author: 'Luis Gómez', 
    size: '2.1 MB' 
  }
];

// Document type options for filtering
const documentTypes = [
  'Todos',
  'Informe',
  'Presupuesto',
  'Convenio',
  'Formato',
  'Planeación'
];

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Todos');
  const [documents, setDocuments] = useState(documentData);

  // Filter documents based on search and type
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'Todos' || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Handle document deletion
  const handleDelete = (id: string) => {
    if(confirm('¿Está seguro que desea eliminar este documento?')) {
      setDocuments(documents.filter(doc => doc.id !== id));
    }
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
            Administre los documentos relacionados con proyectos y programas de extensión
          </p>
        </div>

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
            
            <button 
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Subir documento
            </button>
          </div>
        </div>

        {/* Documents Table */}
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
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-amber-700">
                      <div className="flex items-center">
                        <DocumentIcon type={doc.name.split('.').pop() || ''} />
                        <span className="ml-2">{doc.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">{doc.type}</td>
                    <td className="py-4 px-6">{doc.createdAt}</td>
                    <td className="py-4 px-6">{doc.author}</td>
                    <td className="py-4 px-6">{doc.size}</td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-3">
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
                  </tr>
                ))
              ) : (
                <tr className="bg-white">
                  <td colSpan={6} className="py-4 px-6 text-center text-gray-500">
                    No se encontraron documentos que coincidan con el criterio de búsqueda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PermissionGuard>
  );
}

// Helper component for document icons
const DocumentIcon = ({ type }: { type: string }) => {
  switch(type.toLowerCase()) {
    case 'pdf':
      return (
        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 384 512">
          <path d="M320 464C328.8 464 336 456.8 336 448V416H384V448C384 483.3 355.3 512 320 512H64C28.65 512 0 483.3 0 448V416H48V448C48 456.8 55.16 464 64 464H320zM256 160C238.3 160 224 145.7 224 128V48H64C55.16 48 48 55.16 48 64V192H0V64C0 28.65 28.65 0 64 0H229.5C246.5 0 262.7 6.743 274.7 18.75L365.3 109.3C377.3 121.3 384 137.5 384 154.5V192H336V160H256zM88 224C118.9 224 144 249.1 144 280C144 310.9 118.9 336 88 336H80V368H88C136.6 368 176 328.6 176 280C176 231.4 136.6 192 88 192H56C42.75 192 32 202.7 32 216V400C32 405.1 35.58 410.6 40.97 412.8C46.37 415 52.51 413.1 56 408.9L76.11 384H152V448H56C42.75 448 32 437.3 32 424V416H24C10.75 416 0 405.3 0 392V216C0 184.7 25.07 160 56 160H88C92.42 160 96 163.6 96 168C96 172.4 92.42 176 88 176H56C33.91 176 16 193.9 16 216V392H32V224H88zM204 224H252C286.7 224 312 249.3 312 284V328C312 362.7 286.7 388 252 388H220C206.7 388 196 377.3 196 364V248C196 234.7 206.7 224 220 224H204zM228 248V364H252C269.7 364 280 353.7 280 336V276C280 258.3 269.7 248 252 248H228zM288 424C288 410.7 298.7 400 312 400H336C371.3 400 400 371.3 400 336V248C400 234.7 410.7 224 424 224H432C445.3 224 456 234.7 456 248V336C456 389 413 432 360 432H312C298.7 432 288 421.3 288 408V424zM384 336C384 362.5 362.5 384 336 384H328V416H336C379.7 416 416 379.7 416 336V248H384V336z"/>
        </svg>
      );
    case 'docx':
    case 'doc':
      return (
        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 384 512">
          <path d="M224 128V0H48C21.49 0 0 21.49 0 48v416C0 490.5 21.49 512 48 512h288c26.51 0 48-21.49 48-48V160h-127.1C238.3 160 224 145.7 224 128zM281.5 240h23.37c7.717 0 13.43 7.18 11.69 14.7l-42.46 184C272.9 444.1 268 448 262.5 448h-29.26c-5.426 0-10.18-3.641-11.59-8.883L192 329.1l-29.61 109.1C160.1 444.4 156.2 448 150.8 448H121.5c-5.588 0-10.44-3.859-11.69-9.305l-42.46-184C65.66 247.2 71.37 240 79.08 240h23.37c5.588 0 10.44 3.859 11.69 9.301L137.8 352L165.6 248.9C167 243.6 171.8 240 177.2 240h29.61c5.426 0 10.18 3.641 11.59 8.883L246.2 352l23.7-102.7C271.1 243.9 275.1 240 281.5 240zM256 0v128h128L256 0z"/>
        </svg>
      );
    case 'xlsx':
    case 'xls':
      return (
        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 384 512">
          <path d="M224 128V0H48C21.49 0 0 21.49 0 48v416C0 490.5 21.49 512 48 512h288c26.51 0 48-21.49 48-48V160h-127.1C238.3 160 224 145.7 224 128zM272.1 264.4L224 344l48.99 79.61C279.6 434.3 271.9 448 259.4 448h-26.43c-5.557 0-10.71-2.883-13.63-7.617L192 396l-27.31 44.38C161.8 445.1 156.6 448 151.1 448H124.6c-12.52 0-20.19-13.73-13.63-24.39L160 344L111 264.4C104.4 253.7 112.1 240 124.6 240h26.43c5.557 0 10.71 2.883 13.63 7.613L192 292l27.31-44.39C222.2 242.9 227.4 240 232.9 240h26.43C271.9 240 279.6 253.7 272.1 264.4zM256 0v128h128L256 0z"/>
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 384 512">
          <path d="M365.3 93.38l-74.63-74.64C278.6 6.742 262.3 0 245.4 0L64-.0001c-35.35 0-64 28.65-64 64l.0065 384c0 35.34 28.65 64 64 64H320c35.2 0 64-28.8 64-64V138.6C384 121.7 377.3 105.4 365.3 93.38zM320 464H64.02c-8.836 0-15.1-7.164-15.1-16L48 64.13c0-8.836 7.164-16 16-16h160L224 128c0 17.67 14.33 32 32 32h79.1v288C336 456.8 328.8 464 320 464z"/>
        </svg>
      );
  }
};