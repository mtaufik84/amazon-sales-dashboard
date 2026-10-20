// Daily sales trends for Q2 2022 (Apr 1 - Jun 30, 91 days)
function generateTrends() {
  const trends = [];
  const startDate = new Date(2022, 3, 1); // April 1, 2022
  let baseRevenue = 620000;
  let baseOrders = 320;

  for (let i = 0; i < 91; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);

    // Weekly seasonality
    const dayOfWeek = date.getDay();
    const weekendBoost = dayOfWeek === 0 || dayOfWeek === 6 ? 1.15 : 1.0;

    // Growth trend
    const growth = 1 + (i / 91) * 0.25;

    // Random noise
    const noise = 0.85 + Math.random() * 0.3;

    const revenue = Math.round(baseRevenue * growth * weekendBoost * noise);
    const orders = Math.round(baseOrders * growth * weekendBoost * noise * (0.9 + Math.random() * 0.2));
    const qty = Math.round(orders * (2.5 + Math.random() * 0.8));

    trends.push({ date: dateStr, revenue, orders, qty });
  }

  return trends;
}

export const trends = generateTrends();

// 7-day moving average
export const trendsWithMA = trends.map((d, i) => {
  if (i < 6) return { ...d, ma7: null };
  const window = trends.slice(i - 6, i + 1);
  const ma7 = Math.round(window.reduce((sum, w) => sum + w.revenue, 0) / 7);
  return { ...d, ma7 };
});
