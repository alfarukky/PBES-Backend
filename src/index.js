import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import locationRoutes from './routes/commandLocation.route.js';
import { limiter, authLimiter } from './middleware/limiter.middleware.js';
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to log rate limit events
app.use((req, res, next) => {
  const remaining = req.rateLimit?.remaining;
  if (remaining === 0) {
    console.log(`Rate limit reached for IP: ${req.ip}`);
  }
  next();
});

//middlewares
app.use('/api', limiter);
app.use('/api/auth', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);

//catch all routes
app.get('/*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;
