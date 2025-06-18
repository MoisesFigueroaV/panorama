// /front-end/app/(auth)/register/organizer/page.tsx
"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
// ... (todos tus imports de UI: Button, Input, Label, Card, Select, Checkbox, etc.)
import { apiClient } from "@/lib/api/apiClient" // Ajusta la ruta si es necesario
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { Check, ArrowRight, ArrowLeft } from "lucide-react"
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

// Este tipo debería coincidir con lo que espera tu endpoint /auth/registro-organizador
// y lo que devuelve (o al menos la parte del organizador).
// Idealmente, lo compartirías con el backend o lo definirías basándote en la doc OpenAPI.
interface OrganizadorRegistradoResponse {
  id_organizador: number;
  nombre_organizacion: string;
  descripcion?: string;
  documento_acreditacion?: string;
  acreditado: boolean;
  ubicacion?: string;
  anio_fundacion?: number;
  sitio_web?: string;
  imagen_portada?: string;
  logo_organizacion?: string;
  id_usuario: number;
  usuario?: {
    id_usuario: number;
    nombre_usuario: string;
    correo: string;
    fecha_registro: string;
  };
}

export default function OrganizerRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Paso 1: Datos de la cuenta de usuario (contacto de la organización) ---
  const [nombre_usuario, setNombreUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sexo, setSexo] = useState<'M' | 'F' | 'O' | 'N'>('N');
  const [fecha_nacimiento, setFechaNacimiento] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // --- Paso 2: Datos de la organización ---
  const [nombre_organizacion, setNombreOrganizacion] = useState("");
  const [tipo_organizacion, setTipoOrganizacion] = useState("");
  const [rut_organizacion, setRutOrganizacion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [telefono_organizacion, setTelefonoOrganizacion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [anio_fundacion, setAnioFundacion] = useState("");
  const [sitio_web, setSitioWeb] = useState("");
  const [redes_sociales, setRedesSociales] = useState<Array<{ plataforma: string; url: string }>>([{ plataforma: "instagram", url: "" }]);
  const [documento_acreditacion, setDocumentoAcreditacion] = useState<File | null>(null);

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setDocumentoAcreditacion(e.target.files[0]);
  };

  const addRedSocial = () => setRedesSociales([...redes_sociales, { plataforma: "instagram", url: "" }]);
  const updateRedSocial = (index: number, field: "plataforma" | "url", value: string) => {
    const updated = [...redes_sociales]; 
    updated[index][field] = value; 
    setRedesSociales(updated);
  };
  const removeRedSocial = (index: number) => setRedesSociales(redes_sociales.filter((_, i) => i !== index));

  const validateStep1 = (): boolean => {
    if (!nombre_usuario || !email || !password || !confirmPassword) {
      setError("Paso 1: Por favor completa todos los campos de la cuenta."); 
      return false;
    }
    if (password !== confirmPassword) {
      setError("Paso 1: Las contraseñas no coinciden."); 
      return false;
    }
    if (!acceptTerms) {
      setError("Paso 1: Debes aceptar los términos y condiciones."); 
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!nombre_organizacion) {
      setError("Paso 2: El nombre de la organización es obligatorio."); 
      return false;
    }
    if (!tipo_organizacion) {
      setError("Paso 2: El tipo de organización es obligatorio."); 
      return false;
    }
    if (!rut_organizacion) {
      setError("Paso 2: El RUT de la organización es obligatorio."); 
      return false;
    }
    if (!documento_acreditacion) {
      setError("Paso 2: El documento de acreditación es requerido."); 
      return false;
    }
    setError(null);
    return true;
  };

  const handleFinalSubmit = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    
    // Añadir datos del Paso 1 (cuenta de usuario)
    formData.append('nombre_usuario', nombre_usuario);
    formData.append('correo', email);
    formData.append('contrasena', password);
    if (sexo && sexo !== 'N') formData.append('sexo', sexo);
    if (fecha_nacimiento) formData.append('fecha_nacimiento', fecha_nacimiento);

    // Añadir datos del Paso 2 (organización)
    formData.append('nombre_organizacion', nombre_organizacion);
    formData.append('tipo_organizacion', tipo_organizacion);
    formData.append('rut_organizacion', rut_organizacion);
    if (descripcion) formData.append('descripcion', descripcion);
    if (telefono_organizacion) formData.append('telefono_organizacion', telefono_organizacion);
    if (ubicacion) formData.append('ubicacion', ubicacion);
    if (anio_fundacion) formData.append('anio_fundacion', anio_fundacion);
    if (sitio_web) formData.append('sitio_web', sitio_web);
    if (redes_sociales.length > 0 && redes_sociales.some(r => r.url)) {
      formData.append('redes_sociales', JSON.stringify(redes_sociales.filter(r => r.url)));
    }
    if (documento_acreditacion) {
      formData.append('documento_acreditacion_file', documento_acreditacion, documento_acreditacion.name);
    }

    try {
      console.log('Datos a enviar:', {
        nombre_usuario,
        email,
        password: '***',
        sexo,
        fecha_nacimiento,
        nombre_organizacion,
        tipo_organizacion,
        rut_organizacion,
        descripcion,
        telefono_organizacion,
        ubicacion,
        anio_fundacion,
        sitio_web,
        redes_sociales: redes_sociales.filter(r => r.url),
        documento_acreditacion: documento_acreditacion?.name
      });

      const responseData = await apiClient.post<OrganizadorRegistradoResponse>(
        '/auth/registro-organizador',
        formData
      );
      
      console.log("Organización registrada con éxito:", responseData);
      setCurrentStep(3);
    } catch (err: any) {
      console.error("Error en handleFinalSubmit:", err);
      console.error("Respuesta del servidor:", err.response?.data);
      setError(err.response?.data?.error || err.message || "Error al registrar la organización. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      handleFinalSubmit();
    }
  };

  const handleBack = () => { 
    setError(null); 
    setCurrentStep((prev) => prev - 1); 
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          {/* ... (Títulos condicionales para currentStep 1, 2, 3) ... */}
           {currentStep === 1 && (<><CardTitle className="text-2xl font-bold text-center">Registro Organizador</CardTitle><CardDescription className="text-center">Paso 1: Datos de Cuenta</CardDescription></>)}
           {currentStep === 2 && (<><CardTitle className="text-2xl font-bold text-center">Registro Organizador</CardTitle><CardDescription className="text-center">Paso 2: Datos de Organización</CardDescription></>)}
           {currentStep === 3 && (<><CardTitle className="text-2xl font-bold text-center">¡Solicitud Enviada!</CardTitle><CardDescription className="text-center">Revisaremos tu información.</CardDescription></>)}
          {currentStep < 3 && (
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-2">
                {[1, 2].map((step) => (
                  <div key={step} className={`w-3 h-3 rounded-full ${ step === currentStep ? "bg-primary" : step < currentStep ? "bg-primary/60" : "bg-muted-foreground/30"}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground ml-3">Paso {currentStep} de 2</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="max-h-[70vh] overflow-y-auto px-6 py-4">
          {error && ( <Alert variant="destructive" className="mb-4"> <ExclamationTriangleIcon className="h-4 w-4" /> <AlertDescription>{error}</AlertDescription> </Alert> )}

          {/* PASO 1: DATOS DE CUENTA */}
          {currentStep === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
              {/* Nombre Contacto */}
              <div className="space-y-2">
                <Label htmlFor="nombre_usuario">Nombre Completo (Contacto Principal)</Label>
                <Input 
                  id="nombre_usuario" 
                  value={nombre_usuario} 
                  onChange={(e) => setNombreUsuario(e.target.value)} 
                  required 
                  disabled={isLoading}
                />
              </div>
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico (para la cuenta)</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="contacto@organizacion.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  disabled={isLoading}
                />
              </div>
              {/* Contraseña y Confirmar Contraseña */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    disabled={isLoading}
                  />
                </div>
              </div>
              {/* Sexo y Fecha Nacimiento (Opcionales para el contacto) */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sexo">Sexo (Contacto)</Label>
                  <Select value={sexo} onValueChange={(v) => setSexo(v as any)} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Opcional..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="O">Otro</SelectItem>
                      <SelectItem value="N">Prefiero no especificar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_nacimiento">Fecha Nacimiento (Contacto)</Label>
                  <Input 
                    id="fecha_nacimiento" 
                    type="date" 
                    value={fecha_nacimiento} 
                    onChange={(e) => setFechaNacimiento(e.target.value)} 
                    disabled={isLoading} 
                  />
                </div>
              </div>
              {/* Términos y Condiciones */}
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="terms" 
                  checked={acceptTerms} 
                  onCheckedChange={(checked) => setAcceptTerms(!!checked)} 
                  required 
                  disabled={isLoading}
                />
                <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Acepto los <Link href="/terms" className="text-primary hover:underline">términos y condiciones</Link>
                </label>
              </div>
            </form>
          )}

          {/* PASO 2: DATOS DE ORGANIZACIÓN */}
          {currentStep === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
              {/* Nombre Organización */}
              <div className="space-y-2">
                <Label htmlFor="nombre_organizacion">Nombre legal de la Organización*</Label>
                <Input 
                  id="nombre_organizacion" 
                  placeholder="Ej: Eventos Creativos SpA" 
                  value={nombre_organizacion} 
                  onChange={(e) => setNombreOrganizacion(e.target.value)} 
                  required 
                  disabled={isLoading}
                />
              </div>
              
              {/* Tipo y RUT */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_organizacion">Tipo de organización*</Label>
                  <Select value={tipo_organizacion} onValueChange={setTipoOrganizacion} disabled={isLoading}>
                    <SelectTrigger id="tipo_organizacion">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empresa">Empresa (productoras, locales)</SelectItem>
                      <SelectItem value="publica">Institución pública (municipalidades)</SelectItem>
                      <SelectItem value="ong">Organización sin fines de lucro (ONGs)</SelectItem>
                      <SelectItem value="educativa">Institución educativa (universidades)</SelectItem>
                      <SelectItem value="pyme">Pequeño o mediano negocio (bares con eventos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rut_organizacion">RUT de la organización*</Label>
                  <Input 
                    id="rut_organizacion" 
                    placeholder="Ej: 76.123.456-7" 
                    value={rut_organizacion} 
                    onChange={(e) => setRutOrganizacion(e.target.value)} 
                    required 
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción Breve de la Organización</Label>
                <Textarea 
                  id="descripcion" 
                  value={descripcion} 
                  onChange={(e) => setDescripcion(e.target.value)} 
                  className="min-h-[100px]" 
                  maxLength={500} 
                  disabled={isLoading} 
                  placeholder="Describe tu organización, el tipo de eventos que realizas, tu misión, etc."
                />
                <p className="text-xs text-muted-foreground text-right">{descripcion.length}/500</p>
              </div>
              
              {/* Teléfono y Ubicación */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono_organizacion">Teléfono de Contacto (Organización)</Label>
                  <Input 
                    id="telefono_organizacion" 
                    type="tel" 
                    value={telefono_organizacion} 
                    onChange={(e) => setTelefonoOrganizacion(e.target.value)} 
                    disabled={isLoading} 
                    placeholder="Ej: +56912345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ubicacion">Ubicación (Ciudad y País)</Label>
                  <Input 
                    id="ubicacion" 
                    value={ubicacion} 
                    onChange={(e) => setUbicacion(e.target.value)} 
                    disabled={isLoading} 
                    placeholder="Ej: Santiago, Chile"
                  />
                </div>
              </div>
              
              {/* Año de Fundación y Sitio Web */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="anio_fundacion">Año de Fundación</Label>
                  <Input 
                    id="anio_fundacion" 
                    type="number" 
                    min="1900" 
                    max={new Date().getFullYear()} 
                    value={anio_fundacion} 
                    onChange={(e) => setAnioFundacion(e.target.value)} 
                    disabled={isLoading} 
                    placeholder="Ej: 2020"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sitio_web">Sitio Web (Opcional)</Label>
                  <Input 
                    id="sitio_web" 
                    type="url" 
                    value={sitio_web} 
                    onChange={(e) => setSitioWeb(e.target.value)} 
                    disabled={isLoading} 
                    placeholder="https://www.tuorganizacion.com"
                  />
                </div>
              </div>
              
              {/* Redes Sociales */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Redes sociales (opcional)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addRedSocial} className="h-8 text-xs" disabled={isLoading}>
                    Añadir red
                  </Button>
                </div>
                {redes_sociales.map((red, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Select value={red.plataforma} onValueChange={(value) => updateRedSocial(index, "plataforma", value)} disabled={isLoading}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="twitter">X (Twitter)</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="website">Sitio web</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      type="url" 
                      placeholder="URL completa (ej: https://...)" 
                      value={red.url} 
                      onChange={(e) => updateRedSocial(index, "url", e.target.value)} 
                      className="flex-1" 
                      disabled={isLoading}
                    />
                    {redes_sociales.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeRedSocial(index)} 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive" 
                        disabled={isLoading}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Documento de Acreditación */}
              <div className="space-y-2">
                <Label htmlFor="documento_acreditacion">Documento de verificación* (PDF, JPG, PNG, WEBP - Máx 5MB)</Label>
                <Input 
                  id="documento_acreditacion" 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png,.webp" 
                  onChange={handleDocumentoChange} 
                  required 
                  disabled={isLoading}
                />
                {documento_acreditacion && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {documento_acreditacion.name} ({(documento_acreditacion.size / (1024*1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </form>
          )}
          
          {/* PASO 3: CONFIRMACIÓN */}
          {currentStep === 3 && (
            <div className="space-y-6 py-4 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-lg font-semibold">¡Solicitud de Organizador Recibida!</p>
              <p className="text-muted-foreground">
                Hemos recibido los datos de tu organización. Tu perfil será revisado por nuestro equipo y
                te notificaremos por correo electrónico una vez que sea aprobado. Este proceso puede tardar
                hasta 48 horas hábiles.
              </p>
              <Button onClick={() => router.push('/login')}>Ir a Iniciar Sesión</Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-6">
          {currentStep < 3 && ( // Solo mostrar botones de navegación si no estamos en confirmación
            <div className="flex w-full gap-4">
              {currentStep === 2 && (
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1" disabled={isLoading}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Button>
              )}
              <Button 
                type="button" // Para que no haga submit del form si está dentro de uno
                onClick={handleNext} 
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" 
                disabled={isLoading}
              >
                {isLoading ? "Procesando..." : (currentStep === 1 ? "Siguiente: Datos de Organización" : "Enviar Solicitud")}
                {currentStep === 1 && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          )}
          {currentStep === 1 && (
            <div className="text-center text-sm mt-4">
              ¿Ya tienes una cuenta de usuario?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Inicia sesión aquí
              </Link>
              <span className="text-muted-foreground"> y luego podrás crear tu perfil de organizador desde tu panel.</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}