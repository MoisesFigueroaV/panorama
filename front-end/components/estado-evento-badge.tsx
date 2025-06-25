import React from 'react';

interface EstadoEventoBadgeProps {
  en_curso: boolean;
  proximo: boolean;
  ya_realizado: boolean;
}

export default function EstadoEventoBadge({ en_curso, proximo, ya_realizado }: EstadoEventoBadgeProps) {
  let estado = '';
  let estadoColor = '';
  if (en_curso) {
    estado = 'En curso';
    estadoColor = 'bg-green-500 text-white';
  } else if (proximo) {
    estado = 'Próximo';
    estadoColor = 'bg-blue-500 text-white';
  } else if (ya_realizado) {
    estado = 'Finalizado';
    estadoColor = 'bg-gray-500 text-white';
  }
  if (!estado) return null;
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${estadoColor}`}>{estado}</span>
  );
} 