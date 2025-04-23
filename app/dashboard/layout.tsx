'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: pathname === '/dashboard' },
    { name: 'Subir Excel', href: '/dashboard/upload-excel', icon: UploadIcon, current: pathname === '/dashboard/upload-excel' },
    { name: 'Crear Ficha', href: '/dashboard/create-form', icon: FormIcon, current: pathname === '/dashboard/create-form' },
    { name: 'Ver Fichas', href: '/dashboard/view-forms', icon: ViewIcon, current: pathname === '/dashboard/view-forms' },
    { name: 'La loca de Luismi', href: '/dashboard/special', icon: SpecialIcon, current: pathname === '/dashboard/special' },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="min-h-screen bg-background-alt">
      {/* Sidebar para móvil */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        {/* Overlay de fondo */}
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75" 
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
        
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-64 flex flex-col bg-white shadow-lg">
          <div className="flex justify-between items-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold mr-2">
                SG
              </div>
              <span className="text-xl font-semibold text-secondary">Sistema</span>
            </div>
            <button
              className="text-gray-400 hover:text-gray-500"
              onClick={toggleSidebar}
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Menú navegación */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  item.current
                    ? 'bg-primary-light/20 text-primary'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    item.current ? 'text-primary' : 'text-gray-500 group-hover:text-gray-600'
                  }`}
                />
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  U
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Usuario Demo</p>
                <Link
                  href="/login"
                  className="text-xs text-gray-500 hover:text-primary"
                >
                  Cerrar sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white shadow-lg">
          <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold mr-2">
                SG
              </div>
              <span className="text-xl font-semibold text-secondary">Sistema</span>
            </div>
          </div>
          
          {/* Menú navegación */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  item.current
                    ? 'bg-primary-light/20 text-primary'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    item.current ? 'text-primary' : 'text-gray-500 group-hover:text-gray-600'
                  }`}
                />
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  U
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Usuario Demo</p>
                <Link
                  href="/login"
                  className="text-xs text-gray-500 hover:text-primary"
                >
                  Cerrar sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Barra superior */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="text-gray-500 lg:hidden"
              onClick={toggleSidebar}
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            
            {/* Navegación superior para versión móvil */}
            <div className="lg:hidden flex items-center">
              <div className="text-secondary font-semibold">
                {navigation.find(item => item.current)?.name || 'Dashboard'}
              </div>
            </div>
            
            {/* Acciones de usuario */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <BellIcon className="h-6 w-6" />
              </button>
              
              <div className="hidden md:flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-2">
                  U
                </div>
                <span className="text-sm font-medium text-gray-700">Usuario Demo</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contenido principal */}
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// Componentes de iconos
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
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

function FormIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
  );
}

function ViewIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
    </svg>
  );
}

function SpecialIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
    </svg>
  );
}