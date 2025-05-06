'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/app/auth/hooks';
import { PermissionLevel, RESOURCES } from '@/app/auth/permissions';
import { motion, AnimatePresence } from 'framer-motion';

// Component imports
import StatCard from '@/components/dashboard/StatCard';
import DashboardChart from '@/components/dashboard/DashboardChart';

// Datos ficticios para el dashboard
const MOCK_DATA = {
  stats: [
    { 
      title: 'Fichas Creadas', 
      value: 128, 
      change: 12, 
      changeType: 'increase' as const, 
      period: 'vs mes anterior',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      title: 'Usuarios Activos', 
      value: 24, 
      change: 4, 
      changeType: 'increase' as const, 
      period: 'vs mes anterior',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      title: 'Documentos Subidos', 
      value: 56, 
      change: -3, 
      changeType: 'decrease' as const, 
      period: 'vs mes anterior',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      )
    },
    { 
      title: 'Procesos Pendientes', 
      value: 14, 
      change: -5, 
      changeType: 'decrease' as const, 
      period: 'vs mes anterior',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      title: 'Aprobaciones Financieras', 
      value: 32, 
      change: 8, 
      changeType: 'increase' as const, 
      period: 'vs mes anterior',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      title: 'Presupuesto Utilizado', 
      value: '75%', 
      change: 5, 
      changeType: 'increase' as const, 
      period: 'vs mes anterior',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ],
  
  // Historial de fichas actualizado (con códigos FC-)
  fileHistory: [
    {
      id: 'FC-1002',
      title: 'Capacitación en herramientas digitales para comunidades rurales',
      status: 'Aprobada',
      date: '2023-10-15T10:30:00Z',
      user: 'Maria Rodriguez',
      type: 'project',
      priority: 'alta'
    },
    {
      id: 'FC-985',
      title: 'Solicitud de Presupuesto Q4',
      status: 'Pendiente',
      date: '2023-10-14T14:15:00Z',
      user: 'Carlos Mendez',
      type: 'financial',
      priority: 'media'
    },
    {
      id: 'FC-952',
      title: 'Informe de Gastos Septiembre',
      status: 'Rechazada',
      date: '2023-10-12T09:45:00Z',
      user: 'Juan González',
      type: 'financial',
      priority: 'baja'
    },
    {
      id: 'FC-920',
      title: 'Plan Operativo Anual',
      status: 'Aprobada',
      date: '2023-10-10T11:20:00Z',
      user: 'Ana Martínez',
      type: 'operational',
      priority: 'alta'
    },
    {
      id: 'FC-898',
      title: 'Evaluación de Riesgos',
      status: 'En revisión',
      date: '2023-10-08T16:05:00Z',
      user: 'Roberto Pérez',
      type: 'project',
      priority: 'media'
    }
  ],

  // Historial actualizado
  history: [
    {
      id: 1,
      user: 'Roberto Pérez',
      action: 'ha actualizado',
      target: 'presupuesto',
      targetId: 'FC-102',
      date: '2023-10-15T08:30:00Z',
      details: 'Ajuste presupuestario Q4',
      type: 'financial'
    },
    {
      id: 2,
      user: 'María López',
      action: 'ha creado',
      target: 'ficha',
      targetId: 'FC-1002',
      date: '2023-10-15T07:45:00Z',
      details: 'Nueva ficha de proyecto',
      type: 'operational'
    },
    {
      id: 3,
      user: 'admin_test',
      action: 'ha aprobado',
      target: 'solicitud',
      targetId: 'FC-87',
      date: '2023-10-14T15:20:00Z',
      details: 'Aprobación de fondos emergentes',
      type: 'financial'
    },
    {
      id: 4,
      user: 'Juan Gómez',
      action: 'ha rechazado',
      target: 'reporte',
      targetId: 'FC-45',
      date: '2023-10-14T12:10:00Z',
      details: 'Reporte con inconsistencias',
      type: 'operational'
    },
    {
      id: 5,
      user: 'Carmen Ruiz',
      action: 'ha modificado',
      target: 'proceso',
      targetId: 'FC-12',
      date: '2023-10-13T14:30:00Z',
      details: 'Actualización protocolo operativo',
      type: 'operational'
    }
  ],
  
  pendingApprovals: [
    {
      id: 'PA1001',
      title: 'Presupuesto para evento de fin de año',
      requestedBy: 'Juan Pérez',
      requestedDate: '2023-10-12T10:00:00Z',
      amount: '$5,000',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 'PA1002',
      title: 'Actualización de equipos informáticos',
      requestedBy: 'María Gómez',
      requestedDate: '2023-10-13T11:30:00Z',
      amount: '$12,500',
      status: 'pending',
      priority: 'medium'
    },
    {
      id: 'PA1003',
      title: 'Contratación de servicios de consultoría',
      requestedBy: 'Carlos Ruiz',
      requestedDate: '2023-10-14T09:15:00Z',
      amount: '$8,750',
      status: 'pending',
      priority: 'low'
    }
  ],
  
  // Datos para gráficos
  chartData: {
    formsCreatedByMonth: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'],
      datasets: [
        {
          label: 'Fichas Creadas',
          data: [12, 15, 10, 14, 18, 16, 19, 22, 25, 28],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    userActivityByDay: {
      labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
      datasets: [
        {
          label: 'Usuarios Activos',
          data: [42, 38, 45, 50, 38, 15, 12],
          backgroundColor: '#3b82f6',
          borderRadius: 4
        }
      ]
    },
    budgetUtilization: {
      labels: ['Salarios', 'Operaciones', 'Marketing', 'Tecnología', 'Administración', 'Sin Asignar'],
      datasets: [
        {
          data: [35, 25, 15, 10, 10, 5],
          backgroundColor: [
            'rgba(245, 158, 11, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(209, 213, 219, 0.8)'
          ]
        }
      ]
    }
  }
};

// Vista principal del dashboard
export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Variants para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  // Determinar el saludo según la hora actual
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Renderizar contenido específico según el rol del usuario
  const renderRoleSpecificContent = () => {
    // Asumiendo que obtenemos el rol del usuario desde session
    const userRole = session?.user?.role || 'consulta';
    
    if (userRole === 'superadmin' || userRole === 'admin') {
      return (
        <motion.section 
          className="mt-6 grid grid-cols-1 gap-5"
          variants={itemVariants}
        >
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-2">Panel de Administrador</h3>
            <p className="mb-4">Tienes acceso completo al sistema. Aquí puedes administrar usuarios, roles y configuraciones avanzadas.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/users">
                <button className="bg-white text-amber-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
                  Gestionar Usuarios
                </button>
              </Link>
              <Link href="/dashboard/roles">
                <button className="bg-white text-amber-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
                  Gestionar Roles
                </button>
              </Link>
              <Link href="/dashboard/settings">
                <button className="bg-white text-amber-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
                  Configuración
                </button>
              </Link>
            </div>
          </div>
        </motion.section>
      );
    }
    
    if (userRole === 'financiero') {
      return (
        <motion.section 
          className="mt-6 grid grid-cols-1 gap-5"
          variants={itemVariants}
        >
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-2">Panel Financiero</h3>
            <p className="mb-4">Accede a los reportes financieros y gestiona presupuestos y aprobaciones.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/finances/reports">
                <button className="bg-white text-green-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
                  Ver Reportes
                </button>
              </Link>
              <Link href="/dashboard/finances/budget">
                <button className="bg-white text-green-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
                  Gestionar Presupuesto
                </button>
              </Link>
            </div>
          </div>
        </motion.section>
      );
    }

    return null;
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-b-2 border-amber-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header con saludo y fecha */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {getGreeting()}, {session?.user?.name || 'Usuario'}
          </h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <select 
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-700 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="week">Esta Semana</option>
            <option value="month">Este Mes</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Año</option>
          </select>
          <button className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-md shadow transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Exportar
          </button>
        </div>
      </motion.div>

      {/* Tarjetas de estadísticas */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5"
        variants={itemVariants}
      >
        {MOCK_DATA.stats.map((stat, index) => (
          <motion.div 
            key={index}
            whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            transition={{ duration: 0.2 }}
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              period={stat.period}
              icon={stat.icon}
            />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Contenido específico por rol */}
      {renderRoleSpecificContent()}
      
      {/* Historial de Fichas con botón Ver Más */}
      <motion.div 
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        variants={itemVariants}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Historial de Fichas</h3>
          <Link href="/dashboard/historial-fichas">
            <button className="text-amber-600 hover:text-amber-700 flex items-center text-sm font-medium transition-colors">
              Ver Más
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {MOCK_DATA.fileHistory.slice(0, 4).map((file, index) => (
                <motion.tr 
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: "#f9fafb" }}
                  className="cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{file.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{file.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${file.status === 'Aprobada' ? 'bg-green-100 text-green-800' : 
                        file.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                        file.status === 'Rechazada' ? 'bg-red-100 text-red-800' : 
                        'bg-blue-100 text-blue-800'}`}>
                      {file.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{file.user}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${file.type === 'financial' ? 'bg-indigo-100 text-indigo-800' : 
                        file.type === 'project' ? 'bg-purple-100 text-purple-800' : 
                        'bg-amber-100 text-amber-800'}`}>
                      {file.type === 'financial' ? 'Financiero' : 
                       file.type === 'project' ? 'Proyecto' : 'Operacional'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(file.date).toLocaleString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-amber-600 hover:text-amber-900">
                      Ver detalle
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Actividad Reciente con botón Ver Más */}
      <motion.div 
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        variants={itemVariants}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
          <Link href="/dashboard/history">
            <button className="text-amber-600 hover:text-amber-700 flex items-center text-sm font-medium transition-colors">
              Ver Más
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </Link>
        </div>
        
        {MOCK_DATA.history.slice(0, 3).map((activity, index) => (
          <motion.div 
            key={activity.id}
            className={`border-l-4 ${
              activity.type === 'financial' ? 'border-indigo-500' : 'border-amber-500'
            } p-4 mb-4 bg-white shadow-sm rounded-md`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 5, backgroundColor: "#f9fafb" }}
          >
            <div className="flex items-start">
              <div className={`p-2 rounded-full ${
                activity.type === 'financial' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
              } mr-4`}>
                {activity.type === 'financial' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{activity.user} </span>
                    <span className="text-gray-600">{activity.action} </span>
                    <span className="text-gray-900">{activity.target} </span>
                    <span className="font-medium text-amber-600">{activity.targetId}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(activity.date).toLocaleString('es-ES')}
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-600">{activity.details}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activity.type === 'financial' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {activity.type === 'financial' ? 'Financiero' : 'Operacional'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Gráficos */}
      <motion.div 
        className="space-y-6"
        variants={itemVariants}
      >
        <h3 className="text-lg font-medium text-gray-900 mt-4">Estadísticas y Gráficos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            className="bg-white p-4 rounded-lg shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          >
            <h4 className="text-lg font-medium mb-4">Fichas Creadas por Mes</h4>
            <div className="h-72">
              <DashboardChart 
                type="line"
                data={MOCK_DATA.chartData.formsCreatedByMonth}
              />
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white p-4 rounded-lg shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          >
            <h4 className="text-lg font-medium mb-4">Actividad de Usuarios por Día</h4>
            <div className="h-72">
              <DashboardChart 
                type="bar"
                data={MOCK_DATA.chartData.userActivityByDay}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Aprobaciones Pendientes */}
      <motion.div 
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        variants={itemVariants}
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Aprobaciones Pendientes</h3>
        <div className="space-y-4">
          {MOCK_DATA.pendingApprovals.map((approval, index) => (
            <motion.div 
              key={approval.id}
              className="bg-white shadow-sm rounded-lg border border-gray-200 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      approval.priority === 'high' ? 'bg-red-500' : 
                      approval.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></span>
                    <h4 className="text-lg font-medium">{approval.title}</h4>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Solicitado por: <span className="font-medium">{approval.requestedBy}</span></p>
                    <p>Fecha: {new Date(approval.requestedDate).toLocaleDateString()}</p>
                    <p>Monto: <span className="font-medium text-gray-900">{approval.amount}</span></p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md font-medium text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Aprobar
                  </motion.button>
                  <motion.button
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md font-medium text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Rechazar
                  </motion.button>
                  <motion.button
                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-md font-medium text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Detalles
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}