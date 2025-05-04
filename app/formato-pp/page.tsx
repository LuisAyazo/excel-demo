import React from 'react';
import FormatoPP from '@/components/FormatoPP';

export const metadata = {
  title: 'Formato P&P - Universidad de Cartagena',
  description: 'Ficha Técnica para Proyectos y Programas de Extensión y Proyección Social',
};

export default function FormatoPPPage() {
  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4">
      <FormatoPP />
    </div>
  );
}
