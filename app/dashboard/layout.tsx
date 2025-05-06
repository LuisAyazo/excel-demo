"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/app/auth/hooks";
import { hasPermission, PermissionLevel, UserRole } from "../auth/permissions";

// Define types for navigation items
interface SubItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  adminOnly: boolean;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  adminOnly: boolean;
  subItems?: SubItem[];
}

// Add this new interface
interface NavItemWithSubItems extends NavItem {
  subItems: SubItem[];
}

interface NavSection {
  name: string;
  icon: React.ReactNode;
  items: NavItem[];
}

interface NavSections {
  [key: string]: NavSection;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    administration: true,
    operation: false,
    financial: false,
  });
  // Add state for tracking expanded subitems
  const [expandedSubItems, setExpandedSubItems] = useState<Record<string, boolean>>({});

  // Redirigir si no está autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Evitar renderizar hasta que la sesión esté cargada para evitar hydration mismatch
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-gray-500">Cargando...</span>
      </div>
    );
  }

  // Obtener datos del usuario autenticado
  const userRole = session?.user?.role || null;
  const userName = session?.user?.name || null;
  const userEmail = session?.user?.email || null;

  // Toggle section expand/collapse
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Add function to toggle subitems
  const toggleSubItems = (itemKey: string) => {
    setExpandedSubItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  // Define navigation items grouped by sections
  const navigationSections = {
    administration: {
      name: "Administración",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      items: [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
          ),
          adminOnly: false
        },
        {
          name: "Usuarios",
          href: "/dashboard/users",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
          ),
          adminOnly: true
        },
        {
          name: "Roles",
          href: "/dashboard/roles",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
              />
            </svg>
          ),
          adminOnly: true
        },
        {
          name: "Configuración",
          href: "/dashboard/settings",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          ),
          adminOnly: true
        },
        {
          name: "Dashboard",
          href: "/dashboard/",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
            </svg>
          ),
          adminOnly: true
        }
      ]
    },
    operation: {
      name: "Operación",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
          />
        </svg>
      ),
      items: [
        {
          name: "Fichas",
          href: "/dashboard/fichas",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
              />
            </svg>
          ),
          subItems: [
            {
              name: "Fichas Creadas",
              href: "/dashboard/fichas/forms", // Update from /dashboard/forms to /dashboard/fichas/forms
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              ),
              adminOnly: false
            },
            {
              name: "Cargar Ficha",
              href: "/dashboard/fichas/cargar-ficha",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              ),
              adminOnly: false
            }
          ],
          adminOnly: false
        },
        {
          name: "Gestión Documental",
          href: "/dashboard/documents",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          ),
          adminOnly: false
        },
        {
          name: "Historial de Cambios",
          href: "/dashboard/history",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          adminOnly: false
        },
        {
          name: "Historial de Fichas",
          href: "/dashboard/historial-fichas",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.5H17.25m0 0h1.5m0 0h1.5m-1.5 0A2.25 2.25 0 0121 5.25v1.5m0 0v1.5m0-1.5v1.5m0 0v1.5m0-1.5h-1.5m0 0h-1.5m0 0H15m1.5 0v1.5"
              />
            </svg>
          ),
          adminOnly: false
        }
      ]
    },
    financial: {
      name: "Financiero",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 01-.75.75h-.75m0-1.5h.375a1.125 1.125 0 011.125 1.125v.375M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12v-.008zm0 3h.008v.008H12v-.008zm0 3h.008v.008H12v-.008z"
          />
        </svg>
      ),
      items: [
        {
          name: "Presupuesto",
          href: "/dashboard/budget",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          adminOnly: false
        },
        {
          name: "Seguimiento Financiero",
          href: "/dashboard/finances/tracking",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
          />
        </svg>
      ),
      adminOnly: false
    },
    {
      name: "Reportes Financieros",
      href: "/dashboard/finances/reports",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      ),
      adminOnly: false
    },
    {
      name: "Planificación Financiera",
      href: "/dashboard/finances/planning",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      ),
      adminOnly: false
    }
  ]
},

  };

  // Function to check if a user has admin access
  const hasAdminAccess = () => {
    return userRole === 'admin' || userRole === 'superadmin';
  };

  // Function to handle logout
  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };
  
  // Find current page name
  const findCurrentPageName = () => {
    for (const section of Object.values(navigationSections)) {
      for (const item of section.items) {
        if (item.href === pathname) {
          return item.name;
        }
      }
    }
    return "Dashboard";
  };

  // Filtrar secciones y items según permisos del usuario
  const filteredNavigationSections = Object.entries(navigationSections).reduce((acc, [key, section]) => {
    // Filtrar items según permisos
    const filteredItems = section.items.filter(item => {
      // Si es adminOnly y no tiene acceso admin, no mostrar
      if (item.adminOnly && !hasAdminAccess()) return false;
      // Verificar permiso de lectura para el recurso (por href)
      // Mapear href a recurso
      let resource = null;
      if (item.href.includes("users")) resource = "users";
      else if (item.href.includes("roles")) resource = "roles";
      else if (item.href.includes("budget")) resource = "budget";
      else if (item.href.includes("forms")) resource = "forms";
      else if (item.href.includes("documents")) resource = "documents";
      else if (item.href.includes("history")) resource = "history";
      else if (item.href.includes("financial-tracking")) resource = "financial_tracking";
      else if (item.href.includes("reports")) resource = "reports";
      else if (item.href.includes("upload-excel")) resource = "excel";
      else if (item.href === "/dashboard") resource = "dashboard";
      else if (item.href.includes("project")) resource = "projects";
      // Si no se puede mapear, mostrar solo a admin
      if (!resource) return hasAdminAccess();
      // Verificar permiso de lectura
      return hasPermission({ role: userRole as UserRole | undefined }, resource, PermissionLevel.READ);
    });
    // Cast key to the specific keys of navigationSections to satisfy TypeScript
    const typedKey = key as keyof typeof navigationSections;
    if (filteredItems.length > 0) {
      acc[typedKey] = { ...section, items: filteredItems };
    }
    return acc;
  }, {} as typeof navigationSections);

  // Render sections only if they have visible items
  return (
    <div className="flex h-screen">
      {/* Sidebar - Changed to white background with orange accents */}
      <div className="w-64 bg-white shadow-md text-gray-800 overflow-y-auto border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="p-4">
            <div className="mb-8 flex flex-col items-center">
              <Image 
                src="/images/logo-oficial.png" 
                alt="SIEP Logo"
                width={120}
                height={60}
                className="mb-2"
              />
              <h1 className="text-xl font-bold text-gray-800">SIEP</h1>
              <p className="text-xs text-gray-600">Sistema Institucional de Extensión y Proyectos</p>
            </div>
            <nav>
              <ul className="space-y-2">
                {/* Render sections and their items */}
                {Object.entries(filteredNavigationSections).map(([key, section]) => (
                  section.items.length > 0 && (
                    <li key={key} className="mb-2">
                      {/* Section header (clickable to expand/collapse) */}
                      <button 
                        onClick={() => toggleSection(key)}
                        className="flex items-center justify-between w-full p-2 text-left rounded hover:bg-amber-50 text-gray-700"
                      >
                        <div className="flex items-center">
                          <span className="text-amber-600">{section.icon}</span>
                          <span className="ml-2 font-medium">{section.name}</span>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className={`w-4 h-4 transition-transform ${expandedSections[key] ? 'rotate-90' : ''}`}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                      
                      {/* Section items (shown when expanded) - Updated colors */}
                      {expandedSections[key] && (
                        <ul className="pl-4 mt-1 space-y-1">
                          {section.items.map((item, index) => {
                            // Skip admin-only items for non-admin users
                            if (item.adminOnly && !hasAdminAccess()) return null;

                            // Determine if this is a menu with subitems
                            // Usamos type assertion para evitar el error de TypeScript
                            // TypeScript no puede inferir correctamente que subItems existe en este contexto
                            const hasSubItems = 'subItems' in item && Array.isArray(item.subItems) && item.subItems.length > 0;
                            const itemKey = `${key}-${index}`;
                            const isSubItemsExpanded = expandedSubItems[itemKey] || false;
                            
                            return (
                              <li key={index}>
                                {hasSubItems ? (
                                  <>
                                    <button
                                      onClick={() => toggleSubItems(itemKey)}
                                      className="flex items-center justify-between w-full p-2 rounded-md text-sm text-gray-700 hover:bg-amber-100"
                                    >
                                      <div className="flex items-center">
                                        <span className="mr-2">{item.icon}</span>
                                        {item.name}
                                      </div>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className={`w-3 h-3 transition-transform ${isSubItemsExpanded ? 'rotate-90' : ''}`}
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                      </svg>
                                    </button>
                                    
                                    {/* SubItems */}
                                    {isSubItemsExpanded && (
                                      <ul className="pl-4 mt-1 space-y-1">
                                        {/* Use optional chaining and a type assertion to safely handle the subItems */}
                                        {(item as NavItemWithSubItems).subItems?.map((subItem: SubItem, subIndex: number) => {
                                          // Skip admin-only items for non-admin users
                                          if (subItem.adminOnly && !hasAdminAccess()) return null;
                                          
                                          return (
                                            <li key={subIndex}>
                                              <Link
                                                href={subItem.href}
                                                className={`flex items-center p-2 rounded-md text-xs ${
                                                  pathname === subItem.href 
                                                    ? "bg-amber-500 text-white" 
                                                    : "text-gray-700 hover:bg-amber-100"
                                                }`}
                                              >
                                                <span className="mr-2">{subItem.icon}</span>
                                                {subItem.name}
                                              </Link>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    )}
                                  </>
                                ) : (
                                  <Link
                                    href={item.href}
                                    className={`flex items-center p-2 rounded-md text-sm ${
                                      pathname === item.href 
                                        ? "bg-amber-500 text-white" 
                                        : "text-gray-700 hover:bg-amber-100"
                                    }`}
                                  >
                                    <span className="mr-2">{item.icon}</span>
                                    {item.name}
                                  </Link>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  )
                ))}
              </ul>
            </nav>
          </div>
        </div>
        {/* Botón de logout fijo abajo y versión */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-2 rounded hover:bg-amber-100 text-left text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-2 text-amber-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
            Cerrar sesión
          </button>
          <div className="text-xs text-gray-400 text-center mt-2">v1.0.0-beta</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {findCurrentPageName()}
            </h2>
            <div className="flex items-center gap-4">
              {userRole && (
                <div className="flex items-center">
                  <div className="mr-4 text-right">
                    {userName && <p className="text-sm font-medium">{userName}</p>}
                    {userEmail && <p className="text-xs text-gray-500">{userEmail}</p>}
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-gray-100 p-4">{children}</main>
      </div>
    </div>
  );
}