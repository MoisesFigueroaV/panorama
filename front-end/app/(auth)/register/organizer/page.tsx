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
  // ... más campos del organizador y posiblemente del usuario asociado
}

export default function OrganizerRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Paso 1: Datos de la cuenta de usuario (contacto de la organización) ---
  const [nombre_usuario_contacto, setNombreUsuarioContacto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sexo_contacto, setSexoContacto] = useState<'M' | 'F' | 'O' | 'N'>('N');
  const [fecha_nacimiento_contacto, setFechaNacimientoContacto] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // --- Paso 2: Datos de la organización ---
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState(""); // Ej: 'empresa', 'ong'
  const [orgRut, setOrgRut] = useState("");
  const [orgDescription, setOrgDescription] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [orgSocials, setOrgSocials] = useState<Array<{ type: string; url: string }>>([{ type: "instagram", url: "" }]);
  const [orgDocument, setOrgDocument] = useState<File | null>(null);

  // ... (tus funciones addSocialNetwork, updateSocialNetwork, removeSocialNetwork, handleOrgDocumentChange) ...
  const addSocialNetwork = () => setOrgSocials([...orgSocials, { type: "instagram", url: "" }]);
  const updateSocialNetwork = (index: number, field: "type" | "url", value: string) => {
    const updated = [...orgSocials]; updated[index][field] = value; setOrgSocials(updated);
  };
  const removeSocialNetwork = (index: number) => setOrgSocials(orgSocials.filter((_, i) => i !== index));
  const handleOrgDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setOrgDocument(e.target.files[0]);
  };


  const validateStep1 = (): boolean => {
    if (!nombre_usuario_contacto || !email || !password || !confirmPassword) {
      setError("Paso 1: Por favor completa todos los campos de la cuenta."); return false;
    }
    if (password !== confirmPassword) {
      setError("Paso 1: Las contraseñas no coinciden."); return false;
    }
    if (!acceptTerms) {
      setError("Paso 1: Debes aceptar los términos y condiciones."); return false;
    }
    // Añadir más validaciones si es necesario (ej. formato de email, complejidad de contraseña)
    setError(null);
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!orgName || !orgType || !orgRut) { // Haz los campos que necesites obligatorios
      setError("Paso 2: Nombre, tipo y RUT de la organización son obligatorios."); return false;
    }
    if (!orgDocument) { // Hacerlo opcional si así lo decides
        setError("Paso 2: El documento de acreditación es requerido."); return false;
    }
    // Añadir más validaciones
    setError(null);
    return true;
  };

  const handleFinalSubmit = async () => {
    if (!validateStep2()) return; // Validar campos del paso 2 antes de enviar

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    
    // Añadir datos del Paso 1 (cuenta de usuario)
    formData.append('nombre_usuario_contacto', nombre_usuario_contacto);
    formData.append('correo', email);
    formData.append('contrasena', password);
    if (sexo_contacto) formData.append('sexo_contacto', sexo_contacto);
    if (fecha_nacimiento_contacto) formData.append('fecha_nacimiento_contacto', fecha_nacimiento_contacto);

    // Añadir datos del Paso 2 (organización)
    formData.append('nombre_organizacion', orgName);
    formData.append('tipo_organizacion', orgType); // Asegúrate que este campo exista en tu schema backend
    formData.append('rut_organizacion', orgRut);   // Asegúrate que este campo exista
    if (orgDescription) formData.append('descripcion_organizacion', orgDescription);
    if (orgPhone) formData.append('telefono_organizacion', orgPhone);
    if (orgAddress) formData.append('direccion_organizacion', orgAddress);
    if (orgSocials.length > 0 && orgSocials.some(s => s.url)) { // Solo enviar si hay alguna URL
      formData.append('redes_sociales_json', JSON.stringify(orgSocials.filter(s => s.url))); // Filtrar vacíos
    }
    if (orgDocument) {
      formData.append('documento_acreditacion_file', orgDocument, orgDocument.name);
    }

    try {
      // Llamar al endpoint backend "todo en uno"
      const responseData = await apiClient.post<OrganizadorRegistradoResponse>(
        '/auth/registro-organizador', // Endpoint que crea Usuario Y Organizador
        formData // apiClient.post ya maneja FormData
      );
      
      console.log("Organización registrada con éxito:", responseData);
      // Opcional: auto-loguear al usuario si el backend devuelve tokens aquí
      // if (responseData.accessToken && responseData.refreshToken) {
      //   setAccessToken(responseData.accessToken);
      //   setRefreshToken(responseData.refreshToken);
      // }
      setCurrentStep(3); // Ir al paso de confirmación en la UI
    } catch (err: any) {
      console.error("Error en handleFinalSubmit:", err);
      setError(err.message || "Error al registrar la organización. Intenta de nuevo.");
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
      // Al hacer clic en el botón final del paso 2, se llama a handleFinalSubmit
      handleFinalSubmit();
    }
  };

  const handleBack = () => { setError(null); setCurrentStep((prev) => prev - 1); };

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
                <Label htmlFor="nombre_usuario_contacto">Nombre Completo (Contacto Principal)</Label>
                <Input id="nombre_usuario_contacto" value={nombre_usuario_contacto} onChange={(e) => setNombreUsuarioContacto(e.target.value)} required disabled={isLoading}/>
              </div>
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email_organizador">Correo Electrónico (para la cuenta)</Label>
                <Input id="email_organizador" type="email" placeholder="contacto@organizacion.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading}/>
              </div>
              {/* Contraseña y Confirmar Contraseña */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password_organizador">Contraseña</Label>
                  <Input id="password_organizador" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword_organizador">Confirmar Contraseña</Label>
                  <Input id="confirmPassword_organizador" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading}/>
                </div>
              </div>
              {/* Sexo y Fecha Nacimiento (Opcionales para el contacto) */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sexo_contacto">Sexo (Contacto)</Label>
                  <Select value={sexo_contacto} onValueChange={(v) => setSexoContacto(v as any)} disabled={isLoading}>
                    <SelectTrigger><SelectValue placeholder="Opcional..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="O">Otro</SelectItem>
                      <SelectItem value="N">Prefiero no especificar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_nacimiento_contacto">Fecha Nacimiento (Contacto)</Label>
                  <Input id="fecha_nacimiento_contacto" type="date" value={fecha_nacimiento_contacto} onChange={(e) => setFechaNacimientoContacto(e.target.value)} disabled={isLoading} />
                </div>
              </div>
              {/* Términos y Condiciones */}
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="terms_organizador" checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(!!checked)} required disabled={isLoading}/>
                <label htmlFor="terms_organizador" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                <Label htmlFor="orgName">Nombre legal de la Organización*</Label>
                <Input id="orgName" placeholder="Ej: Eventos Creativos SpA" value={orgName} onChange={(e) => setOrgName(e.target.value)} required disabled={isLoading}/>
              </div>
              {/* Tipo y RUT */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orgType">Tipo de organización*</Label>
                  <Select value={orgType} onValueChange={setOrgType} disabled={isLoading}>
                    <SelectTrigger id="orgType"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
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
                  <Label htmlFor="orgRut">RUT de la organización*</Label>
                  <Input id="orgRut" placeholder="Ej: 76.123.456-7" value={orgRut} onChange={(e) => setOrgRut(e.target.value)} required disabled={isLoading}/>
                </div>
              </div>
              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="orgDescription">Descripción Breve de la Organización</Label>
                <Textarea id="orgDescription" value={orgDescription} onChange={(e) => setOrgDescription(e.target.value)} className="min-h-[100px]" maxLength={500} disabled={isLoading} placeholder="Describe tu organización, el tipo de eventos que realizas, tu misión, etc."/>
                <p className="text-xs text-muted-foreground text-right">{orgDescription.length}/500</p>
              </div>
              {/* Teléfono y Dirección */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orgPhone">Teléfono de Contacto (Organización)</Label>
                  <Input id="orgPhone" type="tel" value={orgPhone} onChange={(e) => setOrgPhone(e.target.value)} disabled={isLoading} placeholder="Ej: +56912345678"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgAddress">Ciudad y País (Organización)</Label>
                  <Input id="orgAddress" value={orgAddress} onChange={(e) => setOrgAddress(e.target.value)} disabled={isLoading} placeholder="Ej: Santiago, Chile"/>
                </div>
              </div>
              {/* Redes Sociales */}
              <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Redes sociales (opcional)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSocialNetwork} className="h-8 text-xs" disabled={isLoading}>Añadir red</Button>
                  </div>
                  {orgSocials.map((social, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Select value={social.type} onValueChange={(value) => updateSocialNetwork(index, "type", value)} disabled={isLoading}>
                        <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
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
                      <Input type="url" placeholder="URL completa (ej: https://...)" value={social.url} onChange={(e) => updateSocialNetwork(index, "url", e.target.value)} className="flex-1" disabled={isLoading}/>
                      {orgSocials.length > 1 && (<Button type="button" variant="ghost" size="icon" onClick={() => removeSocialNetwork(index)} className="h-8 w-8 text-muted-foreground hover:text-destructive" disabled={isLoading}>×</Button>)}
                    </div>
                  ))}
              </div>
              {/* Documento de Acreditación */}
              <div className="space-y-2">
                <Label htmlFor="orgDocument">Documento de verificación* (PDF, JPG, PNG, WEBP - Máx 5MB)</Label>
                <Input id="orgDocument" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleOrgDocumentChange} required disabled={isLoading}/>
                {orgDocument && <p className="text-xs text-muted-foreground mt-1">{orgDocument.name} ({(orgDocument.size / (1024*1024)).toFixed(2)} MB)</p>}
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