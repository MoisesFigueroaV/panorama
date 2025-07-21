#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(endpoint, description) {
  try {
    console.log(`🔍 Probando: ${description}`);
    const response = await axios.get(`${BASE_URL}${endpoint}`);
    console.log(`✅ ${description}: ${response.status} - ${response.data.length || 1} elementos`);
    return true;
  } catch (error) {
    console.log(`❌ ${description}: ${error.response?.status || 'Error de conexión'} - ${error.message}`);
    return false;
  }
}

async function testAllEndpoints() {
  console.log('🚀 Iniciando pruebas de endpoints del mock server...\n');
  
  const tests = [
    { endpoint: '/notificaciones/usuario/63', description: 'Notificaciones del usuario 63' },
    { endpoint: '/api/v1/eventos/dashboard-stats', description: 'Estadísticas del dashboard' },
    { endpoint: '/admin/dashboard/kpis', description: 'KPIs de administración' },
    { endpoint: '/eventos', description: 'Lista de eventos' },
    { endpoint: '/organizadores', description: 'Lista de organizadores' },
    { endpoint: '/categorias', description: 'Lista de categorías' },
    { endpoint: '/usuarios', description: 'Lista de usuarios' },
    { endpoint: '/roles', description: 'Lista de roles' }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const success = await testEndpoint(test.endpoint, test.description);
    if (success) passed++;
    console.log(''); // Línea en blanco para separar
  }
  
  console.log('📊 Resumen de pruebas:');
  console.log(`✅ Pasadas: ${passed}/${total}`);
  console.log(`❌ Fallidas: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 ¡Todos los endpoints funcionan correctamente!');
  } else {
    console.log('⚠️ Algunos endpoints fallaron. Verifica que el mock server esté corriendo.');
  }
}

// Ejecutar las pruebas
testAllEndpoints().catch(console.error); 