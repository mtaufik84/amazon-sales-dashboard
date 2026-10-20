const categories = ['Set', 'Kurta', 'Top', 'Dress', 'Saree', 'Bottom', 'Gown', 'Dupatta'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free'];

function seedRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function generateStock() {
  const stock = [];
  const rand = seedRandom(99);

  for (let i = 0; i < 30; i++) {
    const category = categories[i % categories.length];
    const size = sizes[i % sizes.length];
    const num = String(Math.floor(rand() * 999)).padStart(3, '0');
    const sku = `${category.slice(0, 3).toUpperCase()}${num}-${['KR', 'RD', 'NP', 'BL'][i % 4]}-${['XS', 'S', 'M', 'L', 'XL', 'XXL'][i % 6]}`;

    const ads = Math.round((1.5 + rand() * 12) * 10) / 10; // average daily sales
    const forecast14d = Math.round(ads * 14 * (0.9 + rand() * 0.2));
    const safetyStock = Math.round(ads * 7 * (0.8 + rand() * 0.4));
    const reorderPoint = forecast14d + safetyStock;
    const currentStock = Math.round(reorderPoint * (0.3 + rand() * 0.8));
    const status = currentStock <= reorderPoint * 0.8 ? 'Mendesak' : 'Aman';
    const unitCost = Math.round(200 + rand() * 800);
    const reorderQty = Math.max(reorderPoint - currentStock, 0);
    const estimatedReorderCost = reorderQty * unitCost;

    stock.push({
      id: i + 1,
      sku,
      category,
      size,
      ads,
      currentStock,
      forecast14d,
      safetyStock,
      reorderPoint,
      status,
      unitCost,
      reorderQty,
      estimatedReorderCost,
    });
  }

  return stock.sort((a, b) => b.estimatedReorderCost - a.estimatedReorderCost);
}

export const stock = generateStock();
