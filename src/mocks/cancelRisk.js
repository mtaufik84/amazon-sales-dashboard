export const cancelRiskModel = {
  roc_auc: 0.9315,
  accuracy: 78.55,
  f1: 0.5695,
  precision: 0.6241,
  recall: 0.5234,
  confusion_matrix: {
    true_negative: 12453,
    false_positive: 2387,
    false_negative: 1876,
    true_positive: 2054,
  },
  feature_importance: [
    { feature: 'fulfilment_Merchant', importance: 0.1842 },
    { feature: 'layanan_Ekspress', importance: 0.1423 },
    { feature: 'amount_bucket_2k+', importance: 0.1198 },
    { feature: 'promo_applied', importance: 0.0956 },
    { feature: 'state_tier_3', importance: 0.0834 },
    { feature: 'size_XXL_3XL', importance: 0.0721 },
    { feature: 'kategori_Gown', importance: 0.0612 },
    { feature: 'qty_3+', importance: 0.0498 },
    { feature: 'new_buyer', importance: 0.0435 },
    { feature: 'weekend_order', importance: 0.0281 },
  ],
};

export const cancelRiskSimulator = {
  categories: ['Set', 'Kurta', 'Top', 'Dress', 'Saree', 'Bottom', 'Gown', 'Dupatta'],
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free'],
  fulfilments: ['Amazon', 'Merchant'],
  services: ['Standar', 'Ekspress', 'Prioritas'],
  states: [
    'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Delhi',
    'Gujarat', 'Uttar Pradesh', 'West Bengal', 'Rajasthan', 'Kerala',
    'Bihar', 'Odisha', 'Assam', 'Jharkhand',
  ],
};
