"use client"

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Database, HardDrive } from 'lucide-react';
import { useDataMode } from '@/lib/hooks/useLocalData';
import { toast } from 'sonner';

export function DataModeToggle() {
  const { isLocalMode, toggleMode } = useDataMode();

  const handleToggle = () => {
    toggleMode();
    toast.success(
      isLocalMode 
        ? 'Cambiado a modo Supabase (datos remotos)' 
        : 'Cambiado a modo local (datos de mocks)',
      {
        description: 'Los cambios se aplicarán en la próxima carga de datos'
      }
    );
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border">
      <div className="flex items-center space-x-2">
        {isLocalMode ? (
          <HardDrive className="h-4 w-4 text-blue-600" />
        ) : (
          <Database className="h-4 w-4 text-green-600" />
        )}
        <Label htmlFor="data-mode" className="text-sm font-medium">
          Modo de Datos
        </Label>
      </div>
      
      <Switch
        id="data-mode"
        checked={!isLocalMode}
        onCheckedChange={handleToggle}
      />
      
      <Badge variant={isLocalMode ? "secondary" : "default"}>
        {isLocalMode ? "Local" : "Supabase"}
      </Badge>
      
      <div className="text-xs text-muted-foreground">
        {isLocalMode 
          ? "Usando datos de mocks locales" 
          : "Usando datos de Supabase"
        }
      </div>
    </div>
  );
}

// Componente compacto para usar en headers
export function DataModeToggleCompact() {
  const { isLocalMode, toggleMode } = useDataMode();

  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={!isLocalMode}
        onCheckedChange={toggleMode}
        className="scale-75"
      />
      <Badge variant={isLocalMode ? "outline" : "default"} className="text-xs">
        {isLocalMode ? "Local" : "Cloud"}
      </Badge>
    </div>
  );
} 