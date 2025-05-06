'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getUserById } from '@/lib/auth';
import { usePermission } from '@/app/auth/hooks';
import { PermissionLevel, RESOURCES } from '@/app/auth/permissions';
import PermissionGuard from '@/components/PermissionGuard';

// Define role options with their descriptions and permissions - aligned with the roles page
const roleOptions = [
  {
    value: 'admin',
    label: 'Administrador',
    description: 'Acceso completo a todas las funciones del sistema',
    permissions: [
      'users.create', 'users.read', 'users.update', 'users.delete',
      'roles.create', 'roles.read', 'roles.update', 'roles.delete',
      'forms.create', 'forms.read', 'forms.update', 'forms.delete'
    ]
  },
  {
    value: 'operacion',
    label: 'Operación',
    description: 'Acceso a funciones de operación, sin administración de usuarios',
    permissions: [
      'forms.create', 'forms.read', 'forms.update', 'forms.delete', 
      'users.read'
    ]
  },
  {
    value: 'consulta',
    label: 'Consulta',
    description: 'Acceso básico solo para consulta de información',
    permissions: ['forms.read']
  },
  {
    value: 'superadmin',
    label: 'Super Administrador',
    description: 'Acceso ilimitado con capacidad de modificar parámetros críticos del sistema',
    permissions: ['*'] // All permissions
  }
];

export default function EditUserPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'consulta'
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoleInfo, setSelectedRoleInfo] = useState(roleOptions.find(r => r.value === 'consulta'));
  
  const router = useRouter();
  
  // Load user data
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const user = getUserById(params.id);
        if (user) {
          setFormData({
            username: user.username,
            email: user.email,
            password: '',
            confirmPassword: '',
            full_name: user.full_name,
            role: user.role
          });
        } else {
          setErrors({ form: 'Usuario no encontrado' });
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setErrors({ form: 'Error al cargar los datos del usuario' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [params.id]);
  
  // Update selected role info when role changes
  useEffect(() => {
    const roleInfo = roleOptions.find(r => r.value === formData.role);
    setSelectedRoleInfo(roleInfo);
  }, [formData.role]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 4) {
      newErrors.username = 'El nombre de usuario debe tener al menos 4 caracteres';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del correo electrónico es inválido';
    }
    
    // Only validate password if it's provided (since it might be an edit without changing password)
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre completo es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulación de envío al servidor
    try {
      // En una implementación real, aquí se enviaría la solicitud al API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redireccionar a la lista de usuarios tras éxito
      router.push('/dashboard/users');
    } catch (error) {
      console.error('Error updating user:', error);
      setErrors({
        form: 'Ocurrió un error al actualizar el usuario. Por favor intente nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const inputVariants = {
    focus: { scale: 1.02, borderColor: '#f59e0b', transition: { duration: 0.2 } },
    error: { x: [0, -10, 10, -10, 0], transition: { duration: 0.4 } }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-b-2 border-amber-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <PermissionGuard
      resource={RESOURCES.USERS}
      requiredPermission={PermissionLevel.WRITE}
      redirectTo="/dashboard"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="bg-white rounded-lg shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-white">
            <div className="flex items-center space-x-3">
              <motion.div 
                className="p-2 bg-amber-100 rounded-full"
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Editar Usuario</h1>
                <p className="text-gray-600 text-sm mt-1">Modifique la información del usuario según sea necesario.</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            {errors.form && (
              <motion.div 
                className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{errors.form}</p>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <motion.div 
                  whileFocus="focus" 
                  animate={errors.full_name ? "error" : ""}
                  variants={inputVariants}
                >
                  <input
                    type="text"
                    name="full_name"
                    id="full_name"
                    className={`shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md h-12 ${errors.full_name ? 'border-red-300' : ''}`}
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Ingrese el nombre completo"
                  />
                </motion.div>
                {errors.full_name && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.full_name}
                  </motion.p>
                )}
              </div>
              
              <div className="col-span-1">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de Usuario
                </label>
                <motion.div 
                  whileFocus="focus" 
                  animate={errors.username ? "error" : ""}
                  variants={inputVariants}
                >
                  <input
                    type="text"
                    name="username"
                    id="username"
                    className={`shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md h-12 ${errors.username ? 'border-red-300' : ''}`}
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Nombre de usuario para acceso"
                  />
                </motion.div>
                {errors.username && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.username}
                  </motion.p>
                )}
              </div>
              
              <div className="col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <motion.div 
                  whileFocus="focus" 
                  animate={errors.email ? "error" : ""}
                  variants={inputVariants}
                >
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className={`shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md h-12 ${errors.email ? 'border-red-300' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@dominio.com"
                  />
                </motion.div>
                {errors.email && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>
              
              <div className="col-span-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña <span className="text-xs text-gray-500">(dejar en blanco para mantener la actual)</span>
                </label>
                <div className="relative">
                  <motion.div 
                    whileFocus="focus" 
                    animate={errors.password ? "error" : ""}
                    variants={inputVariants}
                  >
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      className={`shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md h-12 ${errors.password ? 'border-red-300' : ''}`}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </motion.div>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </motion.div>
                  </button>
                </div>
                {errors.password && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>
              
              <div className="col-span-1">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña
                </label>
                <motion.div 
                  whileFocus="focus" 
                  animate={errors.confirmPassword ? "error" : ""}
                  variants={inputVariants}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    className={`shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md h-12 ${errors.confirmPassword ? 'border-red-300' : ''}`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repita la contraseña"
                  />
                </motion.div>
                {errors.confirmPassword && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </div>
              
              <div className="col-span-2">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Rol de Usuario
                </label>
                <select
                  id="role"
                  name="role"
                  className="block w-full pl-3 pr-10 py-3 h-12 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                  value={formData.role}
                  onChange={handleChange}
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                
                {selectedRoleInfo && (
                  <motion.div
                    className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-sm font-medium text-gray-700">{selectedRoleInfo.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{selectedRoleInfo.description}</p>
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-600 mb-1">Permisos:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedRoleInfo.permissions.map((permission, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
            
            <motion.div 
              className="flex justify-end mt-8 space-x-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                onClick={() => router.back()}
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancelar
              </motion.button>
              <motion.button
                type="submit"
                className={`inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={isSubmitting}
                whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                whileTap={!isSubmitting ? { scale: 0.95 } : {}}
              >
                {isSubmitting ? (
                  <>
                    <motion.svg 
                      className="-ml-1 mr-2 h-4 w-4 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </motion.svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </PermissionGuard>
  );
}