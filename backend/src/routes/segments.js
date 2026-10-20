import express from 'express';
import { getRegionClusters, getGeojsonWithClusters, getStateSegment } from '../services/mlLoader.js';

const router = express.Router();

/**
 * GET /api/segments
 * Returns all region clusters, cluster summaries, and state mappings
 */
router.get('/', (req, res) => {
  try {
    const data = getRegionClusters();
    if (!data) {
      return res.status(503).json({ error: 'Data klaster wilayah belum siap.' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data klaster wilayah: ' + err.message });
  }
});

/**
 * GET /api/segments/geojson
 * Returns India GeoJSON enriched with cluster assignments for choropleth rendering
 */
router.get('/geojson', (req, res) => {
  try {
    const geo = getGeojsonWithClusters();
    if (!geo) {
      return res.status(503).json({ error: 'Data GeoJSON India belum siap.' });
    }
    res.json(geo);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil GeoJSON: ' + err.message });
  }
});

/**
 * GET /api/segments/:state
 * Returns cluster information and aggregate metrics for a single state
 */
router.get('/:state', (req, res) => {
  try {
    const stateName = req.params.state;
    const segment = getStateSegment(stateName);
    if (!segment) {
      return res.status(404).json({ error: `Wilayah '${stateName}' tidak ditemukan dalam klaster.` });
    }
    res.json(segment);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mencari wilayah: ' + err.message });
  }
});

export default router;
