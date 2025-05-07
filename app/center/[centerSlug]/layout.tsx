"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCenterContext } from "@/components/providers/CenterContext";

export default function CenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { centerSlug } = useParams();
  const { availableCenters, setCenter, currentCenter, loading } = useCenterContext();
  const router = useRouter();

  useEffect(() => {
    // Skip effect execution if centers are still loading or center slug is not available
    if (loading || !centerSlug) {
      return;
    }

    // Encuentra el centro correspondiente al slug en la URL
    const slugToFind = String(centerSlug);
    
    // Check if the current center already matches the slug to avoid unnecessary updates
    if (currentCenter && currentCenter.slug === slugToFind) {
      console.log(`Centro ya seleccionado: ${currentCenter.name} (ID: ${currentCenter.id})`);
      return;
    }
    
    // Buscar por la propiedad slug en lugar del nombre convertido
    const foundCenter = availableCenters.find(
      (center) => center.slug === slugToFind
    );

    // Si se encuentra el centro y es diferente del seleccionado actualmente, actualizarlo
    if (foundCenter && (!currentCenter || foundCenter.id !== currentCenter.id)) {
      console.log(`Centro encontrado por slug: ${foundCenter.name} (ID: ${foundCenter.id})`);
      setCenter(foundCenter);
      console.log(`Centro cambiado a: ${foundCenter.name} (ID: ${foundCenter.id})`);
    } else if (!foundCenter && availableCenters.length > 0) {
      // Si no se encuentra el centro, redirigir al primer centro disponible
      console.log(`No se encontró centro con slug: ${slugToFind}. Redirigiendo al primero disponible.`);
      const firstCenter = availableCenters[0];
      const slug = firstCenter.slug; // Usar el slug directamente
      router.replace(`/center/${slug}/dashboard`);
    }
  }, [centerSlug, availableCenters, setCenter, currentCenter, router, loading]);

  return (
    <>
      {children}
    </>
  );
}