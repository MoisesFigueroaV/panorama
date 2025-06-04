// /front-end/app/(auth)/register/organizer/page.tsx
"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Check, Upload } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api/apiClient" // IMPORTA apiClient

// Tipos (deberían coincidir con tu backend)
interface OrganizadorResponse { /* Define la respuesta del backend al crear organizador */ }
interface RegistroUsuarioPayload {
  nombre_usuario: string;
  correo: string;
  contrasena: string;
  // ...
}
interface UsuarioRegistrado { id_usuario: number; /* ... */ }


export default function OrganizerRegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Paso 1: Datos de la cuenta de usuario
  const [nombre_usuario_organizador, setNombreUsuarioOrganizador] = useState("") // Para el nombre del contacto de la organización
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Paso 2: Datos de la organización
  const [orgName, setOrgName] = useState("")
  const [orgType, setOrgType] = useState("")
  const [orgRut, setOrgRut] = useState("")
  const [orgDescription, setOrgDescription] = useState("")
  const [orgPhone, setOrgPhone] = useState("")
  const [orgAddress, setOrgAddress] = useState("")
  const [orgSocials, setOrgSocials] = useState<Array<{ type: string; url: string }>>([{ type: "instagram", url: "" }])
  const [orgDocument, setOrgDocument] = useState<File | null>(null)

  const addSocialNetwork = () => setOrgSocials([...orgSocials, { type: "instagram", url: "" }]);
  const updateSocialNetwork = (index: number, field: "type" | "url", value: string) => {
    const updated = [...orgSocials];
    updated[index][field] = value;
    setOrgSocials(updated);
  };
  const removeSocialNetwork = (index: number) => setOrgSocials(orgSocials.filter((_, i) => i !== index));
  const handleOrgDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setOrgDocument(e.target.files[0]);
  };


  const handleFirstStepSubmit = async () => {
    // Validaciones del Paso 1 (cuenta de usuario)
    if (!nombre_usuario_organizador || !email || !password || !confirmPassword) {
      setError("Por favor completa todos los campos de la cuenta."); return false;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden."); return false;
    }
    if (!acceptTerms) {
      setError("Debes aceptar los términos y condiciones."); return false;
    }
    setError(null);
    setIsLoading(true);

    const payload: RegistroUsuarioPayload = {
      nombre_usuario: nombre_usuario_organizador,
      correo: email,
      contrasena: password,
    };

    try {
      // Enviar solo los datos del usuario para registro
      // Asumimos que el backend tiene un endpoint que registra al usuario
      // y le asigna un rol que le permitirá luego crear un perfil de organizador.
      // O, si tienes un endpoint que crea usuario Y organizador, lo llamarías en handleSubmitOrganizationData
      await apiClient.post<UsuarioRegistrado>('/auth/registro', payload); // Usando el ROL_USUARIO_COMUN_ID por defecto
      setIsLoading(false);
      // Aquí, idealmente, el usuario debería INICIAR SESIÓN para obtener un token
      // que se usará al crear el perfil de organizador en el siguiente paso.
      // Por simplicidad, avanzaremos, pero este flujo necesita un manejo de sesión.
      alert("Cuenta de usuario creada. Ahora completa los datos de tu organización.");
      setCurrentStep(2);
      return true;
    } catch (err: any) {
      setError(err.message || "Error al crear la cuenta de usuario.");
      setIsLoading(false);
      return false;
    }
  };

  const handleSubmitOrganizationData = async () => {
    // Validaciones del Paso 2 (datos de organización)
    if (!orgName || !orgType || !orgRut) { // Añade más validaciones
      setError("Nombre, tipo y RUT de la organización son obligatorios."); return;
    }
    // if (!orgDocument) { setError("Por favor sube un documento."); return; } // Puede ser opcional

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('nombre_organizacion', orgName);
    if (orgDescription) formData.append('descripcion', orgDescription);
    if (orgType) formData.append('orgType', orgType);
    if (orgRut) formData.append('orgRut', orgRut);
    if (orgPhone) formData.append('orgPhone', orgPhone);
    if (orgAddress) formData.append('orgAddress', orgAddress);
    if (orgSocials.length > 0 && orgSocials[0].url) formData.append('orgSocialsJson', JSON.stringify(orgSocials)); // Enviar como JSON string

    if (orgDocument) {
      formData.append('documento_acreditacion_file', orgDocument, orgDocument.name);
    }

    try {
      // Esta llamada ASUME que el usuario ya está autenticado (tiene un token)
      // y que apiClient añade ese token a la cabecera.
      // El endpoint '/organizadores' en el backend crea el perfil para el usuario autenticado.
      await apiClient.post<OrganizadorResponse>('/organizadores', formData); // No se necesita JSON.stringify para FormData
      setCurrentStep(3); // Paso de confirmación
    } catch (err: any) {
      setError(err.message || "Error al enviar los datos de la organización.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      await handleFirstStepSubmit(); // Llama a la función del paso 1
    } else if (currentStep === 2) {
      await handleSubmitOrganizationData(); // Llama a la función del paso 2
    }
  };
  const handleBack = () => { setError(null); setCurrentStep((prev) => prev - 1); };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 py-10">
      <Card className="w-full max-w-lg"> {/* Un poco más ancho para el form de organizador */}
        <CardHeader className="space-y-1">
          {currentStep === 1 && (<><CardTitle className="text-2xl font-bold text-center">Comienza tu cuenta de Organizador</CardTitle><CardDescription className="text-center">Crea una cuenta para tu organización</CardDescription></>)}
          {currentStep === 2 && (<><CardTitle className="text-2xl font-bold text-center">Sobre tu Organización</CardTitle><CardDescription className="text-center">Cuéntanos más sobre la entidad que representas</CardDescription></>)}
          {currentStep === 3 && (<><CardTitle className="text-2xl font-bold text-center">¡Solicitud Enviada!</CardTitle><CardDescription className="text-center">Tu perfil de organizador está siendo procesado.</CardDescription></>)}
          {currentStep < 3 && (
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-2">
                {[1, 2].map((step) => ( // Solo 2 pasos de formulario antes de la confirmación
                  <div key={step} className={`w-3 h-3 rounded-full ${ step === currentStep ? "bg-primary" : step < currentStep ? "bg-primary/60" : "bg-muted-foreground/30"}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground ml-3">Paso {currentStep} de 2</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto px-6 py-4"> {/* Scroll si el form es muy largo */}
          {error && ( <Alert variant="destructive" className="mb-4"> <ExclamationTriangleIcon className="h-4 w-4" /> <AlertDescription>{error}</AlertDescription> </Alert> )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2"> <Label htmlFor="nombre_usuario_organizador">Nombre del Contacto Principal</Label> <Input id="nombre_usuario_organizador" value={nombre_usuario_organizador} onChange={(e) => setNombreUsuarioOrganizador(e.target.value)} required disabled={isLoading}/> </div>
              <div className="space-y-2"> <Label htmlFor="email">Correo Electrónico (para la cuenta)</Label> <Input id="email" type="email" placeholder="contacto@organizacion.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading}/> </div>
              <div className="space-y-2"> <Label htmlFor="password">Contraseña</Label> <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading}/> </div>
              <div className="space-y-2"> <Label htmlFor="confirmPassword">Confirmar Contraseña</Label> <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading}/> </div>
              <div className="flex items-center space-x-2"> <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(!!checked)} required disabled={isLoading}/> <label htmlFor="terms" className="text-sm">Acepto los <Link href="/terms" className="text-primary hover:underline">términos y condiciones</Link> </label> </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Todos tus inputs para orgName, orgType, orgRut, orgDocument, orgDescription, orgPhone, orgAddress, orgSocials */}
              {/* Ejemplo para orgName */}
              <div className="space-y-2"> <Label htmlFor="orgName">Nombre legal de la Organización</Label> <Input id="orgName" value={orgName} onChange={(e) => setOrgName(e.target.value)} required disabled={isLoading}/> </div>
              {/* Añade el resto de los campos aquí, siguiendo el patrón */}
              <div className="space-y-2"> <Label htmlFor="orgDescription">Descripción</Label> <Textarea id="orgDescription" value={orgDescription} onChange={(e) => setOrgDescription(e.target.value)} className="min-h-[80px]" maxLength={300} disabled={isLoading}/> <p className="text-xs text-muted-foreground text-right">{orgDescription.length}/300</p> </div>
              <div className="space-y-2"> <Label htmlFor="orgDocument">Documento de verificación (PDF, JPG, PNG)</Label> <Input id="orgDocument" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleOrgDocumentChange} disabled={isLoading}/> {orgDocument && <p className="text-xs text-muted-foreground mt-1">{orgDocument.name}</p>}</div>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="space-y-6 py-4 text-center">
              <div className="flex justify-center mb-6"> <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"> <Check className="h-8 w-8 text-green-600" /> </div> </div>
              <p className="text-lg font-semibold">¡Solicitud de Organizador Enviada!</p>
              <p className="text-muted-foreground"> Tu perfil está en proceso de revisión. Te notificaremos cuando esté activo. </p>
              <Button onClick={() => router.push('/dashboard')}>Ir al Dashboard</Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-6">
          {currentStep < 3 && (
            <div className="flex w-full gap-4">
              {currentStep === 2 && ( <Button variant="outline" onClick={handleBack} className="flex-1" disabled={isLoading}> <ArrowLeft className="mr-2 h-4 w-4" /> Volver </Button> )}
              <Button onClick={handleNext} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? "Procesando..." : (currentStep === 1 ? "Siguiente Paso" : "Enviar Solicitud de Organizador")}
                {currentStep === 1 && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          )}
          {currentStep === 1 && ( <div className="text-center text-sm"> ¿Ya tienes una cuenta? <Link href="/login" className="text-primary hover:underline"> Inicia sesión </Link> </div> )}
        </CardFooter>
      </Card>
    </div>
  )
}