import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_ML_DIR = path.join(__dirname, '..', 'data', 'ml');
const DATA_GEO_DIR = path.join(__dirname, '..', 'data', 'geo');

// Cache in memory
let regionClusters = null;
let indiaGeojson = null;
let cancelRiskSummary = null;
let cancelRiskModel = null;
let stockRecommendations = null;
let recommendations = null;
let metadata = null;

function readJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`Error loading JSON file at ${filePath}:`, err.message);
  }
  return null;
}

export function loadMLArtifacts() {
  console.log('Memuat artefak Machine Learning ke memori...');
  regionClusters = readJsonFile(path.join(DATA_ML_DIR, 'region_clusters.json'));
  indiaGeojson = readJsonFile(path.join(DATA_GEO_DIR, 'india_states.geojson'));
  cancelRiskSummary = readJsonFile(path.join(DATA_ML_DIR, 'cancel_risk_summary.json'));
  cancelRiskModel = readJsonFile(path.join(DATA_ML_DIR, 'cancel_risk_model.json'));
  stockRecommendations = readJsonFile(path.join(DATA_ML_DIR, 'stock_recommendations.json'));
  recommendations = readJsonFile(path.join(DATA_ML_DIR, 'recommendations.json'));
  metadata = readJsonFile(path.join(DATA_ML_DIR, 'metadata.json'));

  console.log(`ML Artefak siap: Region Clusters (${regionClusters ? 'OK' : 'FAIL'}), GeoJSON (${indiaGeojson ? 'OK' : 'FAIL'}), Cancel Model (${cancelRiskModel ? 'OK' : 'FAIL'})`);
}

export function getRegionClusters() {
  if (!regionClusters) loadMLArtifacts();
  return regionClusters;
}

export function getIndiaGeojson() {
  if (!indiaGeojson) loadMLArtifacts();
  return indiaGeojson;
}

export function getStateSegment(stateName) {
  const clusters = getRegionClusters();
  if (!clusters || !clusters.state_lookup) return null;

  // Case insensitive matching
  const targetLower = String(stateName).trim().toLowerCase();
  for (const [sName, sData] of Object.entries(clusters.state_lookup)) {
    if (sName.toLowerCase() === targetLower) {
      return {
        state: sName,
        ...sData
      };
    }
  }
  return null;
}

export function getGeojsonWithClusters() {
  const geo = getIndiaGeojson();
  const clusters = getRegionClusters();
  if (!geo || !clusters) return geo;

  const enrichedFeatures = geo.features.map(feature => {
    const stateName = feature.properties?.st_nm || feature.properties?.name || '';
    const segment = getStateSegment(stateName);

    return {
      ...feature,
      properties: {
        ...feature.properties,
        cluster_id: segment ? segment.cluster_id : null,
        cluster_label: segment ? segment.cluster_label : 'Belum Terklaster',
        color: segment ? segment.color : '#94A3B8',
        metrics: segment ? segment.metrics : null
      }
    };
  });

  return {
    ...geo,
    features: enrichedFeatures
  };
}

export function getCancelRiskSummary() {
  if (!cancelRiskSummary) loadMLArtifacts();
  return cancelRiskSummary;
}

export function getCancelRiskModel() {
  if (!cancelRiskModel) loadMLArtifacts();
  return cancelRiskModel;
}

export function getStockRecommendations() {
  if (!stockRecommendations) loadMLArtifacts();
  return stockRecommendations;
}

export function getRecommendations() {
  if (!recommendations) loadMLArtifacts();
  return recommendations;
}

export function getMetadata() {
  if (!metadata) loadMLArtifacts();
  return metadata;
}

/**
 * Predict cancellation probability for any order
 * @param {Object} input - Order features
 * @returns {Object} { probability, risk_level, contributing_factors }
 */
export function predictCancelRisk(input = {}) {
  const model = getCancelRiskModel();
  if (!model) {
    throw new Error('Model klasifikasi risiko pembatalan belum tersedia.');
  }

  const { intercept, coefficients, numerical_features, categorical_features } = model;
  let logit = intercept;
  const factors = [];

  // Numerical features
  for (const [col, stats] of Object.entries(numerical_features)) {
    const rawVal = input[col] !== undefined ? Number(input[col]) : stats.mean;
    const z = (rawVal - stats.mean) / (stats.std || 1.0);
    const weight = coefficients[col] || 0;
    const effect = weight * z;
    logit += effect;

    if (Math.abs(effect) > 0.05) {
      factors.push({
        feature: col,
        value: rawVal,
        effect: Math.round(effect * 1000) / 1000,
        direction: effect > 0 ? 'Menaikkan Risiko' : 'Menurunkan Risiko'
      });
    }
  }

  // Categorical features
  for (const col of Object.keys(categorical_features)) {
    const val = input[col] !== undefined ? String(input[col]) : '';
    const key = `${col}_${val}`;
    const weight = coefficients[key] || 0;
    logit += weight;

    if (Math.abs(weight) > 0.2) {
      factors.push({
        feature: col,
        value: val,
        effect: Math.round(weight * 1000) / 1000,
        direction: weight > 0 ? 'Menaikkan Risiko' : 'Menurunkan Risiko'
      });
    }
  }

  // Sigmoid
  const prob = 1 / (1 + Math.exp(-logit));
  const roundedProb = Math.round(prob * 10000) / 10000;

  let riskLevel = 'Rendah';
  let badgeColor = '#10B981';
  if (roundedProb >= 0.40) {
    riskLevel = 'Tinggi';
    badgeColor = '#EF4444';
  } else if (roundedProb >= 0.20) {
    riskLevel = 'Sedang';
    badgeColor = '#F59E0B';
  }

  factors.sort((a, b) => Math.abs(b.effect) - Math.abs(a.effect));

  return {
    probability: roundedProb,
    risk_level: riskLevel,
    badge_color: badgeColor,
    logit: Math.round(logit * 1000) / 1000,
    contributing_factors: factors.slice(0, 5)
  };
}
