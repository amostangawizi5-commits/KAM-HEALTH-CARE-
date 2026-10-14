const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const { sequelize } = require('./src/models');

dotenv.config();

const app = express();
const httpServer = createServer(app);
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');
const hasFrontendBuild = fs.existsSync(frontendIndexPath);

// CORS Configuration
const defaultClientOrigins = [
  'https://kam-health-care.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002'
];

const configuredClientOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS || '').split(',')
].filter(Boolean);

const allowedClientOrigins = [...new Set([...defaultClientOrigins, ...configuredClientOrigins])]
  .map((origin) => origin.trim())
  .filter(Boolean);

const isDevelopment = process.env.NODE_ENV !== 'production';
const isAllowedOrigin = (origin) => {
  if (!origin || allowedClientOrigins.includes(origin)) return true;

  if (!isDevelopment) return false;

  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === 'http:' && ['localhost', '127.0.0.1'].includes(hostname);
  } catch (error) {
    return false;
  }
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true
};

// Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(morgan('dev'));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));
if (hasFrontendBuild) {
  app.use(express.static(frontendDistPath));
}

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);
  
  socket.on('join-queue', (department) => {
    socket.join(`queue-${department}`);
    console.log(`📋 ${socket.id} joined queue-${department}`);
  });
  
  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

app.set('io', io);

// Root route
app.get('/', (req, res) => {
  if (hasFrontendBuild) {
    return res.sendFile(frontendIndexPath);
  }

  res.json({
    name: 'KazimiliCare API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      patients: '/api/patients',
      visits: '/api/visits',
      consultant: '/api/consultant',
      doctor: '/api/doctor',
      pharmacy: '/api/pharmacy',
      cashier: '/api/cashier',
      admin: '/api/admin'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'KazimiliCare API is running',
    timestamp: new Date().toISOString()
  });
});

// IMPORT ROUTES - ONLY ONCE
const authRoutes = require('./src/routes/authRoutes');
const patientRoutes = require('./src/routes/patientRoutes');
const visitRoutes = require('./src/routes/visitRoutes');
const consultantRoutes = require('./src/routes/consultantRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
const pharmacyRoutes = require('./src/routes/pharmacyRoutes');
const cashierRoutes = require('./src/routes/cashierRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// USE ROUTES - ONLY ONCE
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/consultant', consultantRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/cashier', cashierRoutes);
app.use('/api/admin', adminRoutes);

if (hasFrontendBuild) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }

    return res.sendFile(frontendIndexPath);
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Database connected: ${sequelize.config.database}`);

    const shouldSyncDatabase = process.env.DB_SYNC === 'true' || process.env.NODE_ENV !== 'production';
    if (shouldSyncDatabase) {
      const syncOptions = process.env.DB_SYNC_ALTER === 'false' ? {} : { alter: true };
      await sequelize.sync(syncOptions);
      console.log('✅ Database models synced');
    }

    httpServer.listen(PORT, () => {
      console.log(`🚀 KazimiliCare Backend running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔑 Login at: http://localhost:${PORT}/login.html`);
    });
  } catch (error) {
    console.error('❌ Unable to start server because the database is not ready:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
