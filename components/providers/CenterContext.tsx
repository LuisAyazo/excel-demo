'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

// Definición del tipo de centro
export interface Center {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isDefault?: boolean;
  active?: boolean;
  stats?: {
    [key: string]: any;  // You may want to define a more specific structure here
  };
}

// Lista predefinida de centros disponibles
export const AVAILABLE_CENTERS: Center[] = [
  {
    id: '1',
    name: 'Centro de educación continua',
    slug: 'centro-educacion-continua',
    description: 'Centro especializado en educación continua',
    isDefault: true
  },
  {
    id: '2',
    name: 'Centro de servicios',
    slug: 'centro-servicios',
    description: 'Centro para la prestación de servicios universitarios'
  }
];

// Tipo para el contexto
interface CenterContextType {
  currentCenter: Center | null;
  availableCenters: Center[];
  setCenter: (center: Center) => void;
  addCenter: (center: Center) => void;
  loading: boolean;
}

const CenterContext = createContext<CenterContextType>({
  currentCenter: null,
  availableCenters: AVAILABLE_CENTERS,
  setCenter: () => {},
  addCenter: () => {},
  loading: true
});

export const useCenterContext = () => useContext(CenterContext);

export const CenterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [currentCenter, setCurrentCenter] = useState<Center | null>(null);
  const [availableCenters, setAvailableCenters] = useState<Center[]>(AVAILABLE_CENTERS);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Memoized function to get center from localStorage
  const getSavedCenter = useCallback(() => {
    try {
      const savedCenter = localStorage.getItem('selectedCenter');
      if (savedCenter) {
        const centerData = JSON.parse(savedCenter);
        if (centerData && centerData.id && centerData.name && centerData.slug) {
          return centerData;
        }
      }
    } catch (error) {
      console.error('Error reading center from localStorage:', error);
    }
    return null;
  }, []);

  // Memoized fallbackToDefaultCenter function
  const fallbackToDefaultCenter = useCallback(() => {
    const defaultCenter = availableCenters.find(center => center.isDefault);
    if (defaultCenter) {
      console.log('Using default center:', defaultCenter.name);
      setCurrentCenter(defaultCenter);
      try {
        localStorage.setItem('selectedCenter', JSON.stringify(defaultCenter));
      } catch (error) {
        console.error('Error saving default center to localStorage:', error);
      }
    } else if (availableCenters.length > 0) {
      // If no default is marked, use the first available center
      console.log('No default center found, using first available:', availableCenters[0].name);
      setCurrentCenter(availableCenters[0]);
      try {
        localStorage.setItem('selectedCenter', JSON.stringify(availableCenters[0]));
      } catch (error) {
        console.error('Error saving first center to localStorage:', error);
      }
    }
  }, [availableCenters]);

  // Load center from localStorage or default when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      setLoading(true);
      
      // Try to get center from localStorage
      const savedCenter = getSavedCenter();
      
      if (savedCenter) {
        console.log('Loading saved center from localStorage:', savedCenter.name);
        // Verify the center exists in available centers to prevent using stale data
        const centerExists = availableCenters.some(c => c.id === savedCenter.id);
        if (centerExists) {
          setCurrentCenter(savedCenter);
        } else {
          console.warn('Saved center not found in available centers, using default');
          fallbackToDefaultCenter();
        }
      } else {
        fallbackToDefaultCenter();
      }
      
      setLoading(false);
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, getSavedCenter, fallbackToDefaultCenter, availableCenters]);

  // Cambiar el centro actual - memoized with useCallback to prevent recreation
  const setCenter = useCallback((center: Center) => {
    // Prevent unnecessary state updates
    if (currentCenter && currentCenter.id === center.id) {
      console.log('Center already selected:', center.name);
      return;
    }
    
    console.log('Setting center to:', center.name);
    setCurrentCenter(center);
    
    try {
      localStorage.setItem('selectedCenter', JSON.stringify(center));
    } catch (e) {
      console.error('Error saving center to localStorage:', e);
    }
    
    // Si estamos en una ruta específica de un centro, redirigir al nuevo centro
    if (pathname.includes('/center/')) {
      // Extract the current path segments
      const pathSegments = pathname.split('/');
      
      // Replace the center slug (third segment) with the new center slug
      if (pathSegments.length > 2) {
        pathSegments[2] = center.slug;
        const newPath = pathSegments.join('/');
        console.log('Redirecting to:', newPath);
        router.push(newPath);
      } else {
        // If for some reason we can't determine the correct path, just go to the dashboard
        const newPath = `/center/${center.slug}/dashboard`;
        console.log('Redirecting to dashboard:', newPath);
        router.push(newPath);
      }
    }
  }, [currentCenter, pathname, router]);

  // Añadir un nuevo centro a la lista
  const addCenter = (newCenter: Center) => {
    setAvailableCenters(prev => [...prev, newCenter]);
  };

  return (
    <CenterContext.Provider value={{ 
      currentCenter, 
      availableCenters, 
      setCenter, 
      addCenter,
      loading 
    }}>
      {children}
    </CenterContext.Provider>
  );
};