#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando mock server...');

// Verificar que json-server esté instalado
const jsonServerPath = path.join(__dirname, 'node_modules', '.bin', 'json-server');
const routesPath = path.join(__dirname, 'routes.json');
const mocksPath = path.join(__dirname, 'mocks');

// Argumentos para json-server
const args = [
  '--watch', mocksPath,
  '--routes', routesPath,
  '--port', '3000',
  '--host', '0.0.0.0',
  '--no-cors'
];

console.log('📁 Directorio de mocks:', mocksPath);
console.log('🛣️ Archivo de rutas:', routesPath);
console.log('🌐 Puerto:', '3000');

// Iniciar json-server
const jsonServer = spawn(jsonServerPath, args, {
  stdio: 'inherit',
  shell: true
});

jsonServer.on('error', (error) => {
  console.error('❌ Error al iniciar json-server:', error);
  console.log('💡 Asegúrate de que json-server esté instalado: npm install -g json-server');
  process.exit(1);
});

jsonServer.on('close', (code) => {
  console.log(`📴 Mock server cerrado con código: ${code}`);
});

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo mock server...');
  jsonServer.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Deteniendo mock server...');
  jsonServer.kill('SIGTERM');
});

console.log('✅ Mock server iniciado en http://localhost:3000');
console.log('📋 Rutas disponibles:');
console.log('   - GET /notificaciones/usuario/:id');
console.log('   - GET /api/v1/eventos/dashboard-stats');
console.log('   - GET /admin/dashboard/kpis');
console.log('   - GET /eventos');
console.log('   - GET /organizadores');
console.log('   - GET /categorias');
console.log('   - GET /usuarios');
console.log('   - GET /roles');
console.log('');
console.log('🛑 Presiona Ctrl+C para detener el servidor'); 