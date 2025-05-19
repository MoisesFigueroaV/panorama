"use client"

import type React from "react"

import { useState } from "react"
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

export default function OrganizerRegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Paso 1: Datos de la cuenta
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

  // Paso 3: Datos de la persona
  const [personName, setPersonName] = useState("")
  const [personRut, setPersonRut] = useState("")
  const [personDocument, setPersonDocument] = useState<File | null>(null)

  const addSocialNetwork = () => {
    setOrgSocials([...orgSocials, { type: "instagram", url: "" }])
  }

  const updateSocialNetwork = (index: number, field: "type" | "url", value: string) => {
    const updatedSocials = [...orgSocials]
    updatedSocials[index][field] = value
    setOrgSocials(updatedSocials)
  }

  const removeSocialNetwork = (index: number) => {
    const updatedSocials = [...orgSocials]
    updatedSocials.splice(index, 1)
    setOrgSocials(updatedSocials)
  }

  const handleNext = () => {
    // Validaciones básicas por paso
    if (currentStep === 1) {
      if (!email || !password || !confirmPassword) {
        setError("Por favor completa todos los campos")
        return
      }
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden")
        return
      }
      if (!acceptTerms) {
        setError("Debes aceptar los términos y condiciones")
        return
      }
    } else if (currentStep === 2) {
      if (!orgName || !orgType || !orgRut || !orgDescription || !orgPhone || !orgAddress) {
        setError("Por favor completa todos los campos obligatorios")
        return
      }
      if (!orgDocument) {
        setError("Por favor sube un documento de verificación")
        return
      }
    } else if (currentStep === 3) {
      if (!personName || !personRut || !personDocument) {
        setError("Por favor completa todos los campos")
        return
      }
      // Aquí iría la lógica para enviar los datos al servidor
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        setCurrentStep(4)
      }, 1500)
      return
    }

    setError(null)
    setCurrentStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setError(null)
    setCurrentStep((prev) => prev - 1)
  }

  const handleOrgDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setOrgDocument(e.target.files[0])
    }
  }

  const handlePersonDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPersonDocument(e.target.files[0])
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          {currentStep === 1 && (
            <>
              <CardTitle className="text-2xl font-bold text-center">Comienza tu cuenta</CardTitle>
              <CardDescription className="text-center">
                Crea una cuenta para tu organización en Panorama
              </CardDescription>
            </>
          )}

          {currentStep === 2 && (
            <>
              <CardTitle className="text-2xl font-bold text-center">Sobre tu organización</CardTitle>
              <CardDescription className="text-center">
                Cuéntanos más sobre la organización que representas
              </CardDescription>
            </>
          )}

          {currentStep === 3 && (
            <>
              <CardTitle className="text-2xl font-bold text-center">Sobre ti</CardTitle>
              <CardDescription className="text-center">
                Necesitamos verificar que estás autorizado para representar esta organización
              </CardDescription>
            </>
          )}

          {currentStep === 4 && (
            <>
              <CardTitle className="text-2xl font-bold text-center">¡Ya casi!</CardTitle>
              <CardDescription className="text-center">
                Hemos recibido tu solicitud para crear una cuenta de organizador
              </CardDescription>
            </>
          )}

          {/* Indicador de progreso */}
          {currentStep < 4 && (
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full ${
                      step === currentStep
                        ? "bg-primary"
                        : step < currentStep
                          ? "bg-primary/60"
                          : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground ml-3">Paso {currentStep} de 4</span>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Paso 1: Crear la Cuenta */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@organizacion.cl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(!!checked)} />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Acepto los{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    términos y condiciones
                  </Link>
                </label>
              </div>
            </div>
          )}

          {/* Paso 2: Formulario de la Organización */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">Identidad</h3>
                <div className="space-y-2">
                  <Label htmlFor="orgName">Nombre legal</Label>
                  <Input
                    id="orgName"
                    type="text"
                    placeholder="Ej. EcoFest Chile SpA"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgType">Tipo de organización</Label>
                  <Select value={orgType} onValueChange={setOrgType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
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
                  <Label htmlFor="orgRut">RUT de la organización</Label>
                  <Input
                    id="orgRut"
                    type="text"
                    placeholder="Ej. 76.123.456-7"
                    value={orgRut}
                    onChange={(e) => setOrgRut(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgDocument">Documento de verificación</Label>
                  <div className="border rounded-md p-3 flex items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                    <label htmlFor="orgDocument" className="cursor-pointer flex flex-col items-center w-full">
                      <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        {orgDocument ? orgDocument.name : "Subir documento (certificado, RUT, estatutos)"}
                      </span>
                      <input
                        id="orgDocument"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleOrgDocumentChange}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">Qué haces</h3>
                <div className="space-y-2">
                  <Label htmlFor="orgDescription">Descripción</Label>
                  <Textarea
                    id="orgDescription"
                    placeholder="Ej. Organizamos festivales ecológicos"
                    value={orgDescription}
                    onChange={(e) => setOrgDescription(e.target.value)}
                    required
                    className="min-h-[80px]"
                    maxLength={300}
                  />
                  <p className="text-xs text-muted-foreground text-right">{orgDescription.length}/300 caracteres</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">Contacto</h3>
                <div className="space-y-2">
                  <Label htmlFor="orgPhone">Teléfono</Label>
                  <Input
                    id="orgPhone"
                    type="tel"
                    placeholder="Ej. +56955556666"
                    value={orgPhone}
                    onChange={(e) => setOrgPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgAddress">Ciudad y país</Label>
                  <Input
                    id="orgAddress"
                    type="text"
                    placeholder="Ej. Valparaíso, Chile"
                    value={orgAddress}
                    onChange={(e) => setOrgAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Redes sociales (opcional)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSocialNetwork}
                      className="h-8 text-xs"
                    >
                      Añadir red social
                    </Button>
                  </div>

                  {orgSocials.map((social, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Select value={social.type} onValueChange={(value) => updateSocialNetwork(index, "type", value)}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="website">Sitio web</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        type="url"
                        placeholder={`Ej. https://${social.type}.com/tuorganizacion`}
                        value={social.url}
                        onChange={(e) => updateSocialNetwork(index, "url", e.target.value)}
                        className="flex-1"
                      />

                      {orgSocials.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSocialNetwork(index)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <span className="sr-only">Eliminar</span>×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Formulario de la Persona */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="personName">Nombre completo</Label>
                <Input
                  id="personName"
                  type="text"
                  placeholder="Ej. Luis Morales"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personRut">RUT personal</Label>
                <Input
                  id="personRut"
                  type="text"
                  placeholder="Ej. 12.345.678-9"
                  value={personRut}
                  onChange={(e) => setPersonRut(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personDocument">Documento de identidad</Label>
                <div className="border rounded-md p-3 flex items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                  <label htmlFor="personDocument" className="cursor-pointer flex flex-col items-center w-full">
                    <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      {personDocument ? personDocument.name : "Subir copia de cédula o pasaporte"}
                    </span>
                    <input
                      id="personDocument"
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handlePersonDocumentChange}
                    />
                  </label>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Esto nos ayuda a confirmar que estás autorizado para representar a esta organización.
              </p>
            </div>
          )}

          {/* Paso 4: Confirmación */}
          {currentStep === 4 && (
            <div className="space-y-6 py-4">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">¡Listo! Revisa tu correo para verificar tu cuenta.</p>
                <p className="text-muted-foreground">
                  Estamos revisando los documentos de {orgName || "tu organización"} y los tuyos. Te avisaremos en 1-3
                  días.
                </p>
              </div>
              <div className="pt-4">
                <Button variant="outline" className="w-full">
                  Reenviar correo de verificación
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          {currentStep < 4 && (
            <div className="flex w-full gap-4">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
              )}
              <Button onClick={handleNext} className="flex-1 bg-primary text-white" disabled={isLoading}>
                {currentStep === 3 ? (
                  isLoading ? (
                    "Enviando..."
                  ) : (
                    "Enviar"
                  )
                ) : (
                  <>
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          {currentStep === 4 && (
            <Link href="/login" className="text-primary hover:underline text-center">
              Inicia sesión cuando estés aprobado
            </Link>
          )}

          {currentStep === 1 && (
            <div className="text-center text-sm">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Inicia sesión
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
