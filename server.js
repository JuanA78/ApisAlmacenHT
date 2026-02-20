require('dotenv').config();          // Carga las variables de entorno desde .env
const express = require('express');
const cors = require('cors');
const connectDB = require('./mongoConfig');

const app = express();

// Puerto dinámico (Render asigna process.env.PORT)
const PORT = process.env.PORT || 3000;

// ------------------------------------
// Middlewares
// ------------------------------------

// Habilitar CORS para todos los orígenes (puedes personalizarlo para producción)
app.use(cors());

// Permitir recibir JSON en las solicitudes
app.use(express.json());

// ------------------------------------
// Conexión a MongoDB
// ------------------------------------
connectDB();

// ------------------------------------
// Rutas de prueba
// ------------------------------------
app.get('/', (req, res) => {
  res.send('🚀 API funcionando');
});

// ------------------------------------
// Rutas de la API
// ------------------------------------
app.use('/api/productos', require('./routes/productosRoutes'));
app.use('/api/empresas', require('./routes/empresasRoutes'));
app.use('/api/clientes', require('./routes/clientesRoutes'));
app.use('/api/entradas', require('./routes/entradasRoutes'));
app.use('/api/salidas', require('./routes/salidasRoutes'));
// ------------------------------------
// Iniciar servidor
// ------------------------------------
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
