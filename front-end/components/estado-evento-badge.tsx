import React from 'react';

interface EstadoEventoBadgeProps {
  en_curso: boolean;
  proximo: boolean;
  ya_realizado: boolean;
}

export default function EstadoEventoBadge({ en_curso, proximo, ya_realizado }: EstadoEventoBadgeProps) {
  console.log('🔍 EstadoEventoBadge renderizado con:', { en_curso, proximo, ya_realizado });
  
  // Verificar si las propiedades son booleanos válidos
  const enCurso = Boolean(en_curso);
  const proximoEvento = Boolean(proximo);
  const yaRealizado = Boolean(ya_realizado);
  
  console.log('🔍 Estados convertidos a booleanos:', { enCurso, proximoEvento, yaRealizado });
  
  let estado = '';
  let estadoColor = '';
  if (enCurso) {
    estado = 'En curso';
    estadoColor = 'bg-green-500 text-white';
  } else if (proximoEvento) {
    estado = 'Próximo';
    estadoColor = 'bg-blue-500 text-white';
  } else if (yaRealizado) {
    estado = 'Finalizado';
    estadoColor = 'bg-gray-500 text-white';
  }
  
  console.log('🔍 Estado calculado:', estado, estadoColor);
  
  if (!estado) {
    console.log('🔍 No se muestra badge porque no hay estado válido');
    return null;
  }
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold text-center flex items-center justify-center ${estadoColor}`}>{estado}</span>
  );
} 