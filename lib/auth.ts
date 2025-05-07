// Simula una base de datos de usuarios para la demostración
export const usersDatabase = [
  {
    id: '1',
    username: 'admin_test',
    email: 'admin_test@unicartagena.edu.co',
    password: 'admin123', // En producción, nunca almacenar contraseñas en texto plano
    full_name: 'Usuario Administrador',
    role: 'superadmin', // Cambiado de 'admin' a 'superadmin'
    created_at: '2025-04-01T10:00:00Z',
    assigned_centers: ['1', '2'] // Asignando todos los centros disponibles
  },
  {
    id: '2',
    username: 'layazo',
    email: 'luis.ayazo@unicartagena.edu.co',
    password: 'password123',
    full_name: 'Luis Ayazo',
    role: 'usuario',
    created_at: '2025-04-02T10:00:00Z',
    assigned_centers: ['1'] // Asignado solo al Centro de educación continua
  },
  {
    id: '3',
    username: 'operario',
    email: 'operario@unicartagena.edu.co',
    password: 'operario123',
    full_name: 'Usuario Operario',
    role: 'operacion',
    created_at: '2025-04-03T10:00:00Z',
    assigned_centers: ['2'] // Asignado solo al Centro de servicios
  },
  {
    id: '4',
    username: 'soporte',
    email: 'soporte@unicartagena.edu.co',
    password: 'soporte123',
    full_name: 'Equipo Soporte',
    role: 'operacion',
    created_at: '2025-04-04T10:00:00Z',
    assigned_centers: ['1', '2'] // Asignado a ambos centros
  },
  {
    id: '5',
    username: 'invitado',
    email: 'invitado@unicartagena.edu.co',
    password: 'invitado123',
    full_name: 'Usuario Invitado',
    role: 'usuario',
    created_at: '2025-04-05T10:00:00Z',
    assigned_centers: [] // No tiene centros asignados
  }
];

// Función para autenticar usuario
export const authenticateUser = (email: string, password: string) => {
  const user = usersDatabase.find(user => user.email === email);
  
  if (user && user.password === password) {
    // En una aplicación real, nunca devuelvas la contraseña
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  return null;
};

// Función para verificar si un usuario tiene acceso de administrador
export const hasAdminAccess = (role: string | null) => {
  return role === 'admin' || role === 'superadmin';
};

// Función para obtener todos los usuarios (sin contraseñas)
export const getAllUsers = () => {
  return usersDatabase.map(({ password, ...user }) => user);
};

// Función para obtener un usuario por ID
export const getUserById = (id: string) => {
  const user = usersDatabase.find(user => user.id === id);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

// Nueva función para gestionar las asignaciones de centros a usuarios
export const updateUserCenterAssignments = (userId: string, centerIds: string[]) => {
  const userIndex = usersDatabase.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    usersDatabase[userIndex] = {
      ...usersDatabase[userIndex],
      assigned_centers: centerIds
    };
    return true;
  }
  return false;
};

// Función para obtener todos los usuarios con sus centros asignados
export const getUsersWithCenters = () => {
  return usersDatabase.map(({ password, ...user }) => user);
};
