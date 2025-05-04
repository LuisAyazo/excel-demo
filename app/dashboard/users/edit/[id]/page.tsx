'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

// Interfaz para el formulario de usuario
interface UserFormInputs {
  username: string;
  email: string;
  password?: string; // Opcional en edición
  confirmPassword?: string; // Opcional en edición
  full_name?: string;
  role: string;
}

// Tipo para el usuario que se carga
type User = {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  role: string;
  created_at: string;
  updated_at?: string;
};

// Datos ficticios para simular la carga de usuario
const usersMock = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    full_name: 'Administrador',
    role: 'admin',
    created_at: '2025-04-01T10:00:00Z'
  },
  {
    id: '2',
    username: 'operario',
    email: 'operario@example.com',
    full_name: 'Usuario Operario',
    role: 'operacion',
    created_at: '2025-04-02T10:00:00Z'
  },
  {
    id: '3',
    username: 'usuario',
    email: 'usuario@example.com',
    full_name: 'Usuario Regular',
    role: 'usuario',
    created_at: '2025-04-03T10:00:00Z'
  },
  {
    id: '4',
    username: 'soporte',
    email: 'soporte@example.com',
    full_name: 'Equipo Soporte',
    role: 'operacion',
    created_at: '2025-04-04T10:00:00Z'
  },
  {
    id: '5',
    username: 'invitado',
    email: 'invitado@example.com',
    full_name: 'Usuario Invitado',
    role: 'usuario',
    created_at: '2025-04-05T10:00:00Z'
  },
];

export default function EditUserPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<UserFormInputs>();
  
  // Para validar que las contraseñas coincidan
  const password = watch('password');

  // Cargar los datos del usuario
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        // En una implementación real, aquí se haría la llamada al API
        // const response = await fetch(`/api/users/${userId}`);
        // const data = await response.json();
        
        // Por ahora simulamos la carga con datos mockeados
        const foundUser = usersMock.find(u => u.id === userId);
        
        if (!foundUser) {
          throw new Error('Usuario no encontrado');
        }
        
        setUser(foundUser);
        
        // Establecer los valores del formulario
        setValue('username', foundUser.username);
        setValue('email', foundUser.email);
        setValue('full_name', foundUser.full_name || '');
        setValue('role', foundUser.role);
        
        setError('');
      } catch (err: any) {
        setError(err.message || 'Error al cargar el usuario');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchUser();
    }
  }, [userId, setValue]);

  // Función para manejar el envío del formulario
  const onSubmit: SubmitHandler<UserFormInputs> = async (data) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      // Eliminamos la confirmación de contraseña y si la contraseña está vacía también la eliminamos
      const { confirmPassword, ...userData } = data;
      if (!userData.password) {
        delete userData.password;
      }
      
      // En una implementación real, aquí se enviarían los datos al backend
      console.log('Datos del usuario a actualizar:', userData);
      
      // Simulación de envío al API
      setTimeout(() => {
        setIsSubmitting(false);
        // Redirigir a la lista de usuarios con un mensaje de éxito
        router.push('/dashboard/users');
      }, 1000);
      
    } catch (err) {
      setError('Ha ocurrido un error al actualizar el usuario.');
      console.error(err);
      setIsSubmitting(false);
    }
  };

  // Si está cargando, mostramos un indicador
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-500">Cargando usuario...</span>
        </div>
      </div>
    );
  }

  // Si hay un error al cargar y no hay usuario
  if (!user && error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <div className="mt-4">
              <Link
                href="/dashboard/users"
                className="text-sm text-red-700 font-medium hover:text-red-600 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Volver a la lista de usuarios
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-secondary">Editar Usuario</h2>
            <p className="text-gray-500 mt-1">Modificar datos del usuario {user?.username}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link 
              href="/dashboard/users" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Volver
            </Link>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Nombre de usuario */}
            <div className="sm:col-span-3">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nombre de usuario <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="username"
                  autoComplete="username"
                  className={`shadow-sm block w-full sm:text-sm rounded-md ${
                    errors.username ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'
                  }`}
                  {...register('username', {
                    required: 'El nombre de usuario es obligatorio',
                    minLength: {
                      value: 3,
                      message: 'El nombre de usuario debe tener al menos 3 caracteres'
                    }
                  })}
                />
                {errors.username && <p className="mt-2 text-sm text-red-600">{errors.username.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`shadow-sm block w-full sm:text-sm rounded-md ${
                    errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'
                  }`}
                  {...register('email', {
                    required: 'El correo electrónico es obligatorio',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'El formato de correo electrónico no es válido'
                    }
                  })}
                />
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
              </div>
            </div>

            {/* Nombre completo */}
            <div className="sm:col-span-6">
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Nombre completo
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="full_name"
                  autoComplete="name"
                  className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  {...register('full_name')}
                />
              </div>
            </div>

            {/* Contraseña - opcional en edición */}
            <div className="sm:col-span-3">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña <span className="text-gray-400">(Opcional)</span>
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  className={`shadow-sm block w-full sm:text-sm rounded-md ${
                    errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'
                  }`}
                  {...register('password', {
                    minLength: {
                      value: 8,
                      message: 'La contraseña debe tener al menos 8 caracteres'
                    }
                  })}
                />
                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
                <p className="mt-2 text-xs text-gray-500">Dejar en blanco para mantener la contraseña actual</p>
              </div>
            </div>

            {/* Confirmar Contraseña - opcional en edición */}
            <div className="sm:col-span-3">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña <span className="text-gray-400">(Opcional)</span>
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  className={`shadow-sm block w-full sm:text-sm rounded-md ${
                    errors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'
                  }`}
                  {...register('confirmPassword', {
                    validate: value => !password || value === password || 'Las contraseñas no coinciden'
                  })}
                />
                {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* Rol */}
            <div className="sm:col-span-6">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Rol <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  className={`shadow-sm block w-full sm:text-sm rounded-md ${
                    errors.role ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'
                  }`}
                  {...register('role', { required: 'El rol es obligatorio' })}
                >
                  <option value="admin">Administrador</option>
                  <option value="operacion">Operación</option>
                  <option value="usuario">Usuario</option>
                </select>
                {errors.role && <p className="mt-2 text-sm text-red-600">{errors.role.message}</p>}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                <span className="font-medium text-gray-700">Roles: </span>
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full mr-1">admin</span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full mr-1">operacion</span>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">usuario</span>
              </p>
            </div>

            {/* Información adicional */}
            {user && (
              <div className="sm:col-span-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-sm text-gray-700">Información del usuario</h4>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
                    <p><span className="font-medium">ID:</span> {user.id}</p>
                    <p><span className="font-medium">Fecha de creación:</span> {new Date(user.created_at).toLocaleString()}</p>
                    {user.updated_at && (
                      <p><span className="font-medium">Última actualización:</span> {new Date(user.updated_at).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-5">
            <Link
              href="/dashboard/users"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}