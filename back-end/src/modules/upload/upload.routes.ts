import { Elysia, t } from 'elysia';
import { authMiddleware, requireAuth } from '../../middleware/auth.middleware';
import { saveImage, getImageUrl } from '../../utils/upload';
import { CustomError } from '../../utils/errors';

export const uploadRoutes = new Elysia({ prefix: '/upload', detail: { tags: ['Upload'] } })
  .use(authMiddleware)

  /**
   * Subir imagen
   */
  .post(
    '/image',
    async (context) => {
      try {
        // Primero verificar autenticación
        const currentSession = requireAuth()(context.session);
        
        // Luego procesar el FormData
        const formData = await context.request.formData();
        console.log('FormData keys:', Array.from(formData.keys()));
        const fileEntry = formData.get('file') || formData.get('image');
        let file: File | null = null;
        if (fileEntry && typeof fileEntry === 'object' && 'type' in fileEntry) {
          file = fileEntry as File;
        }
        let folder = formData.get('folder');
        if (typeof folder !== 'string') {
          folder = folder?.toString?.() || '';
        }
        console.log('Valor de folder recibido:', folder, typeof folder);
        if (folder === 'portada') {
          folder = 'Portada';
        } else if (folder === 'logo') {
          folder = 'Logo';
        } else {
          context.set.status = 400;
          return {
            success: false,
            error: 'El campo folder es obligatorio y debe ser "portada" o "logo".'
          };
        }
        console.log('Valor de folder después de validar:', folder);
        
        if (!file) {
          context.set.status = 400;
          return {
            success: false,
            error: 'No se proporcionó ninguna imagen'
          };
        }
        
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          context.set.status = 400;
          return {
            success: false,
            error: 'El archivo debe ser una imagen'
          };
        }
        
        // Validar tamaño (máximo 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          context.set.status = 400;
          return {
            success: false,
            error: 'La imagen no puede ser mayor a 5MB'
          };
        }
        
        console.log('🚀 Iniciando upload de imagen...');
        const imageUrl = await saveImage(file, undefined, folder);
        
        console.log('✅ Upload completado exitosamente');
        return {
          success: true,
          imageUrl,
          filename: imageUrl.split('/').pop() || ''
        };
      } catch (error: any) {
        console.error('❌ Error en upload route:', error);
        
        // Asegurar que siempre devolvemos JSON válido
        context.set.status = 500;
        return {
          success: false,
          error: error.message || 'Error interno del servidor al subir la imagen'
        };
      }
    },
    {
      response: {
        200: t.Object({
          success: t.Boolean(),
          imageUrl: t.String(),
          filename: t.String()
        }),
        400: t.Object({
          success: t.Boolean(),
          error: t.String()
        }),
        500: t.Object({
          success: t.Boolean(),
          error: t.String()
        })
      },
      detail: { summary: 'Subir imagen', security: [{ bearerAuth: [] }] }
    }
  ); 