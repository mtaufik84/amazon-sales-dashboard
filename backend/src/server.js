import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { loadData } from './dataLoader.js';
import salesRoutes from './routes/salesRoutes.js';
import segmentsRoutes from './routes/segments.js';
import recommendationsRoutes from './routes/recommendations.js';
import { loadMLArtifacts } from './services/mlLoader.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Inisialisasi data sekali untuk lingkungan server maupun serverless
let initPromise = null;
function ensureDataReady() {
    if (!initPromise) {
        initPromise = Promise.all([loadData(), Promise.resolve(loadMLArtifacts())]);
    }
    return initPromise;
}

// Middleware: Tunggu inisialisasi data selesai sebelum melayani request apa pun
app.use(async (req, res, next) => {
    try {
        await ensureDataReady();
        next();
    } catch (err) {
        console.error('Data initialization error:', err);
        res.status(500).json({ error: 'Gagal inisialisasi data: ' + err.message });
    }
});

// Routes (Mendukung path dengan atau tanpa prefix /api untuk fleksibilitas Vercel rewrite)
app.use('/api/sales', salesRoutes);
app.use('/sales', salesRoutes);

app.use('/api/segments', segmentsRoutes);
app.use('/segments', segmentsRoutes);

app.use('/api/recommendations', recommendationsRoutes);
app.use('/recommendations', recommendationsRoutes);

app.get(['/api/health', '/health'], (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

async function startServer() {
    try {
        await ensureDataReady();
        // Hanya listen jika tidak berada di lingkungan serverless Lambda/Vercel
        if (!process.env.VERCEL) {
            app.listen(PORT, () => {
                console.log(`Backend Server berjalan aktif di http://localhost:${PORT}`);
            });
        }
    } catch (err) {
        console.error('Gagal menjalankan server:', err);
    }
}

startServer();

export default app;