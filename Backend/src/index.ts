import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import chequeRoutes from './routes/chequeRoutes';
import statementRoutes from './routes/statementRoutes';
import reconciliationRoutes from './routes/reconciliationRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/cheques', chequeRoutes);
app.use('/api/statements', statementRoutes);
app.use('/api/reconciliation', reconciliationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Finance Wing Backend is running.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
