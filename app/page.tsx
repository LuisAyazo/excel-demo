"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCenterContext } from "@/components/providers/CenterContext";

export default function Home() {
  const router = useRouter();
  const { availableCenters, currentCenter } = useCenterContext();

  useEffect(() => {
    // Redirigir a la ruta del centro si hay centros disponibles
    if (availableCenters.length > 0) {
      const centerToUse = currentCenter || availableCenters[0];
      const slug = centerToUse.name.toLowerCase().replace(/ /g, '-');
      router.replace(`/center/${slug}/dashboard`);
    }
  }, [availableCenters, currentCenter, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Cargando...</h2>
        <p className="mt-2">Estamos preparando tu experiencia</p>
      </div>
    </div>
  );
}
