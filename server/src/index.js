import express from 'express';
import cors from 'cors';
import env from './config/env.js';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patient.routes.js';
import screeningRoutes from './routes/screening.routes.js';

const app = express();

// ─── Global Middleware ───────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Large limit for base64 images
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'OpticEdge API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ─── API Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/screenings', screeningRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      statusCode: 404,
    },
  });
});

// ─── Centralized Error Handler ───────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║      🔬 OpticEdge API Server            ║
  ║      Running on port ${String(env.PORT).padEnd(5)}             ║
  ║      Environment: ${env.NODE_ENV.padEnd(12)}        ║
  ╚══════════════════════════════════════════╝
  `);
});

export default app;
