import express from 'express';
import cors from 'cors';
import customerRoutes from './routes/customerRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { logger } from './utils/logger.js';
import dotenv from 'dotenv';
import './config/db.js'; 

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 5000; 

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/addresses', addressRoutes);

// 404 & Error Handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
});


