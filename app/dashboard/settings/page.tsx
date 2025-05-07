'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PermissionGuard from '@/components/PermissionGuard';
import { PermissionLevel, RESOURCES } from '@/app/auth/permissions';
import { useCenterContext } from '@/components/providers/CenterContext';
import { getUsersWithCenters, updateUserCenterAssignments } from '@/lib/auth';

// Definir interfaces necesarias para resolver errores de tipos
interface Center {
  id: string;
  name: string;
  description: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  assigned_centers: string[];
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newFicha: true,
    updates: false,
    approvals: true,
    systemUpdates: true
  });
  const [displaySettings, setDisplaySettings] = useState({
    darkMode: false,
    compactView: false,
    showWelcome: true,
    language: 'es'
  });
  const [systemSettings, setSystemSettings] = useState({
    autoSave: true,
    autoSaveInterval: 5,
    sessionTimeout: 30,
    defaultView: 'dashboard'
  });
  
  // Add prefix settings state
  const [prefixSettings, setPrefixSettings] = useState({
    fichasPrefix: 'FC-',
    presupuestoPrefix: 'PS-',
    proyectosPrefix: 'PY-',
    documentosPrefix: 'DOC-',
    informesPrefix: 'INF-'
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Estados para la administración de centros
  const centerContext = useCenterContext();
  const availableCenters = centerContext?.availableCenters || [];
  const [users, setUsers] = useState<User[]>([]);
  const [editingCenter, setEditingCenter] = useState<Center | null>(null);
  const [newCenter, setNewCenter] = useState<{ name: string; description: string }>({ name: '', description: '' });
  const [userCenterAssignments, setUserCenterAssignments] = useState<Record<string, string[]>>({});
  const [savingAssignments, setSavingAssignments] = useState(false);
  
  // Cargar usuarios con sus centros asignados
  useEffect(() => {
    if (activeTab === 'centers') {
      try {
        const allUsers = getUsersWithCenters();
        setUsers(allUsers);
        
        // Preparar objeto para las asignaciones de centros a usuarios
        const assignments: Record<string, string[]> = {};
        allUsers.forEach(user => {
          assignments[user.id] = user.assigned_centers || [];
        });
        setUserCenterAssignments(assignments);
      } catch (error) {
        console.error('Error fetching users with centers:', error);
        // Fall back to empty array if there's an error
        setUsers([]);
      }
    }
  }, [activeTab]);

  // Animación para los elementos
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

  // Handle prefix settings changes
  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPrefixSettings({
      ...prefixSettings,
      [name]: value
    });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call to save settings
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccessMessage(true);
      
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }, 1000);
  };

  const toggleCenterAssignment = (userId: string, centerId: string) => {
    setUserCenterAssignments(prev => {
      const userAssignments = [...(prev[userId] || [])];
      
      if (userAssignments.includes(centerId)) {
        return {
          ...prev,
          [userId]: userAssignments.filter(id => id !== centerId)
        };
      } else {
        return {
          ...prev,
          [userId]: [...userAssignments, centerId]
        };
      }
    });
  };

  const saveUserCenterAssignments = async () => {
    setSavingAssignments(true);
    try {
      await updateUserCenterAssignments(userCenterAssignments);
      setSavingAssignments(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error updating user center assignments:', error);
      setSavingAssignments(false);
    }
  };

  return (
    <PermissionGuard requiredPermission={PermissionLevel.EDIT} resource={RESOURCES.SETTINGS}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Configuración</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button 
                onClick={() => handleTabChange('general')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'general' 
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                General
              </button>
              <button 
                onClick={() => handleTabChange('notifications')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'notifications' 
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Notificaciones
              </button>
              <button 
                onClick={() => handleTabChange('display')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'display' 
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Visualización
              </button>
              <button 
                onClick={() => handleTabChange('system')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'system' 
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Sistema
              </button>
              <button 
                onClick={() => handleTabChange('prefix')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'prefix' 
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Prefijos
              </button>
              <button 
                onClick={() => handleTabChange('centers')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'centers' 
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Centros y Usuarios
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'general' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Configuración General</h2>
                {/* General settings content */}
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Configuración de Notificaciones</h2>
                {/* Notifications settings content */}
              </div>
            )}
            
            {activeTab === 'display' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Configuración de Visualización</h2>
                {/* Display settings content */}
              </div>
            )}
            
            {activeTab === 'system' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Configuración del Sistema</h2>
                {/* System settings content */}
              </div>
            )}

            {activeTab === 'prefix' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Configuración de Prefijos</h2>
                {/* Prefix settings content */}
              </div>
            )}

            {activeTab === 'centers' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Gestión de Centros y Usuarios</h2>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Asignar Usuarios a Centros</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuario</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                          {availableCenters && availableCenters.map(center => (
                            <th key={center.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              {center.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map(user => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                              {user.full_name || user.username}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {user.role}
                            </td>
                            {availableCenters && availableCenters.map(center => (
                              <td key={`${user.id}-${center.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <input 
                                  type="checkbox"
                                  checked={userCenterAssignments[user.id]?.includes(center.id) || false}
                                  onChange={() => toggleCenterAssignment(user.id, center.id)}
                                  className="rounded text-blue-600 focus:ring-blue-500"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={saveUserCenterAssignments}
                      disabled={savingAssignments}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {savingAssignments ? 'Guardando...' : 'Guardar Asignaciones'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab !== 'centers' && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"
            role="alert"
          >
            <span className="block sm:inline">Configuración guardada exitosamente.</span>
          </motion.div>
        )}
      </div>
    </PermissionGuard>
  );
}
