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

// Routes
app.use('/api/sales', salesRoutes);
app.use('/api/segments', segmentsRoutes);
app.use('/api/recommendations', recommendationsRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

async function startServer() {
    try {
        await loadData();
        loadMLArtifacts();
        app.listen(PORT, () => {
            console.log(`Backend Server berjalan aktif di http://localhost:${PORT}`);
            console.log(`Endpoint data siap di http://localhost:${PORT}/api/sales/stats`);
            console.log(`Endpoint Machine Learning siap:`);
            console.log(` - Wilayah & Klaster: http://localhost:${PORT}/api/segments`);
            console.log(` - GeoJSON Klaster:   http://localhost:${PORT}/api/segments/geojson`);
            console.log(` - Rekomendasi:       http://localhost:${PORT}/api/recommendations`);
            console.log(` - Rencana Stok:      http://localhost:${PORT}/api/recommendations/stock`);
            console.log(` - Risiko Batal:      http://localhost:${PORT}/api/recommendations/cancel-risk`);
        });
    } catch (err) {
        console.error('Gagal menjalankan server:', err);
        process.exit(1);
    }
}

startServer();

export default app;