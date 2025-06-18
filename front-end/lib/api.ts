const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = {
    users: {
      getAll: () => fetch(`${API_BASE}/users`).then(res => res.json()),
      getById: (id: number) => fetch(`${API_BASE}/users/${id}`).then(res => res.json()),
      create: (userData: any) => 
        fetch(`${API_BASE}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        }).then(res => res.json())
    },
    eventos: {
      // Crear evento
      create: async (eventoData: any, token: string) => {
        console.log('🚀 API: Iniciando creación de evento')
        console.log('🚀 API: URL base:', API_BASE)
        console.log('🚀 API: Datos a enviar:', eventoData)
        console.log('🚀 API: Token presente:', !!token)
        
        const url = `${API_BASE}/api/v1/eventos`
        console.log('🚀 API: URL completa:', url)
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(eventoData)
        });
        
        console.log('🚀 API: Respuesta recibida, status:', response.status)
        
        if (!response.ok) {
          const error = await response.json();
          console.error('🚀 API: Error en respuesta:', error)
          throw new Error(error.error || 'Error al crear el evento');
        }
        
        const result = await response.json();
        console.log('🚀 API: Evento creado exitosamente:', result)
        return result;
      },
      
      // Obtener eventos del organizador
      getMisEventos: async (token: string) => {
        const response = await fetch(`${API_BASE}/api/v1/eventos/mis-eventos`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al obtener eventos');
        }
        
        return response.json();
      },
      
      // Actualizar evento
      update: async (idEvento: number, eventoData: any, token: string) => {
        const response = await fetch(`${API_BASE}/api/v1/eventos/${idEvento}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(eventoData)
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al actualizar el evento');
        }
        
        return response.json();
      }
    }
  };