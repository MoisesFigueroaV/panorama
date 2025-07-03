// Eliminar el import de './config' si no existe y asegurar que API_BASE esté definido correctamente en este archivo o importado desde el archivo de configuración real.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

upload: {
  // Subir imagen
  uploadImage: async (file: File, token: string, folder?: string) => {
    const formData = new FormData();
    formData.append('image', file);
    if (folder) formData.append('folder', folder);
    const response = await fetch(`${API_BASE}/api/v1/upload/image`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al subir imagen');
    }
    return response.json();
  }
} 