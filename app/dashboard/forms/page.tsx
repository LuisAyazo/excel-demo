'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { hasPermission, PermissionLevel, UserRole } from '@/app/auth/permissions';
import { usePermission } from '@/app/auth/hooks';
import { useSession } from 'next-auth/react';

// Define proper ficha status types
type StatusType = 'borrador' | 'activo' | 'finalizado' | 'cancelado';

// Define proper form type
interface FormData {
  id: string;
  codigo: string;
  nombre: string;
  fechaApertura: string;
  fechaCierre: string;
  inversion: string;
  proceso: string;
  costo: string;
  tipoPrograma: string;
  tipoModalidad: string;
  unidadEjecutora: string;
  dependencia: string;
  coordinador: string;
  estado: StatusType;
}

// Mock data for forms
const MOCK_FORMS: FormData[] = [
  {
    id: '1',
    codigo: 'FC-2023-001',
    nombre: 'Capacitación en herramientas tecnológicas',
    fechaApertura: '2023-03-15',
    fechaCierre: '2023-12-15',
    inversion: '$5,000,000',
    proceso: 'Formación',
    costo: 'Gratuito',
    tipoPrograma: 'Educación continua',
    tipoModalidad: 'Virtual',
    unidadEjecutora: 'Facultad de Ingeniería',
    dependencia: 'Departamento de Sistemas',
    coordinador: 'Juan Pérez',
    estado: 'activo'
  },
  {
    id: '2',
    codigo: 'FC-2023-002',
    nombre: 'Asesoría empresarial para pequeños negocios',
    fechaApertura: '2023-04-10',
    fechaCierre: '2023-10-10',
    inversion: '$8,500,000',
    proceso: 'Consultoría',
    costo: 'Pago',
    tipoPrograma: 'Proyección social',
    tipoModalidad: 'Presencial',
    unidadEjecutora: 'Facultad de Ciencias Económicas',
    dependencia: 'Departamento de Administración',
    coordinador: 'María Rodríguez',
    estado: 'activo'
  },
  {
    id: '3',
    codigo: 'FC-2023-003',
    nombre: 'Desarrollo de apps móviles para comunidades',
    fechaApertura: '2023-02-20',
    fechaCierre: '2023-08-20',
    inversion: '$12,000,000',
    proceso: 'Desarrollo',
    costo: 'Gratuito',
    tipoPrograma: 'Extensión',
    tipoModalidad: 'Híbrida',
    unidadEjecutora: 'Facultad de Ingeniería',
    dependencia: 'Departamento de Sistemas',
    coordinador: 'Carlos Gómez',
    estado: 'borrador'
  },
  {
    id: '4',
    codigo: 'FC-2023-004',
    nombre: 'Taller de escritura creativa',
    fechaApertura: '2023-05-05',
    fechaCierre: '2023-07-05',
    inversion: '$2,300,000',
    proceso: 'Formación',
    costo: 'Gratuito',
    tipoPrograma: 'Cultural',
    tipoModalidad: 'Presencial',
    unidadEjecutora: 'Facultad de Humanidades',
    dependencia: 'Departamento de Literatura',
    coordinador: 'Laura Martínez',
    estado: 'finalizado'
  },
  {
    id: '5',
    codigo: 'FC-2023-005',
    nombre: 'Consultoría en gestión ambiental',
    fechaApertura: '2023-06-01',
    fechaCierre: '2023-11-30',
    inversion: '$15,700,000',
    proceso: 'Consultoría',
    costo: 'Pago',
    tipoPrograma: 'Extensión',
    tipoModalidad: 'Híbrida',
    unidadEjecutora: 'Facultad de Ciencias Ambientales',
    dependencia: 'Departamento de Gestión Ambiental',
    coordinador: 'Pedro Sánchez',
    estado: 'activo'
  }
];

export default function FormsPage() {
  // Next.js will automatically use this during static generation
  // to create a redirect for /dashboard/forms to /dashboard/fichas/forms
  return null;
}

export async function generateMetadata() {
  return {
    title: "Redirecting...",
  };
}

// Add server-side redirect
export function generateStaticParams() {
  return [];
}

// This will handle the redirect on the client-side
export const dynamic = 'force-static';
export const revalidate = false;

// Add this to redirect on the server using middleware
export const config = {
  // Next.js middleware will intercept this route
  matcher: '/dashboard/forms',
};