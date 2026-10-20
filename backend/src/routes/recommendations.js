import express from 'express';
import {
  getRecommendations,
  getStockRecommendations,
  getCancelRiskSummary,
  getMetadata,
  predictCancelRisk
} from '../services/mlLoader.js';

const router = express.Router();

/**
 * GET /api/recommendations
 * Returns actionable business recommendation cards and metadata
 */
router.get('/', (req, res) => {
  try {
    const recs = getRecommendations();
    const meta = getMetadata();
    res.json({
      metadata: meta,
      recommendations: recs || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memuat rekomendasi: ' + err.message });
  }
});

/**
 * GET /api/recommendations/stock
 * Returns stock forecasting, run-rates, and SKU reorder planning
 */
router.get('/stock', (req, res) => {
  try {
    const stock = getStockRecommendations();
    if (!stock) {
      return res.status(503).json({ error: 'Data peramalan stok belum siap.' });
    }
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: 'Gagal memuat rencana stok: ' + err.message });
  }
});

/**
 * GET /api/recommendations/cancel-risk
 * Returns cancel risk summary, model evaluation metrics, and risk tables
 */
router.get('/cancel-risk', (req, res) => {
  try {
    const cancelData = getCancelRiskSummary();
    if (!cancelData) {
      return res.status(503).json({ error: 'Data analisis risiko pembatalan belum siap.' });
    }
    res.json(cancelData);
  } catch (err) {
    res.status(500).json({ error: 'Gagal memuat analisis risiko: ' + err.message });
  }
});

/**
 * POST /api/recommendations/predict-cancel
 * Predict cancellation probability for an incoming order
 * Body: { Category, Size, is_fba, is_expedited, ship_state_clean, is_b2b, has_promotion, unit_price, qty_imputed, day_of_week, day_of_month }
 */
router.post('/predict-cancel', (req, res) => {
  try {
    const orderFeatures = req.body;
    const prediction = predictCancelRisk(orderFeatures);
    res.json({
      input: orderFeatures,
      prediction
    });
  } catch (err) {
    res.status(400).json({ error: 'Gagal memproses prediksi risiko: ' + err.message });
  }
});

export default router;
