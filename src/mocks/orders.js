const categories = ['Set', 'Kurta', 'Top', 'Dress', 'Saree', 'Bottom', 'Gown', 'Dupatta'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free'];
const statuses = ['Shipped', 'Delivered', 'Cancelled', 'Pending', 'Returned'];
const fulfilments = ['Amazon', 'Merchant'];
const cities = [
  ['Mumbai', 'Maharashtra'], ['Pune', 'Maharashtra'], ['Nagpur', 'Maharashtra'],
  ['Bengaluru', 'Karnataka'], ['Mysuru', 'Karnataka'], ['Hubli', 'Karnataka'],
  ['Chennai', 'Tamil Nadu'], ['Coimbatore', 'Tamil Nadu'], ['Madurai', 'Tamil Nadu'],
  ['Hyderabad', 'Telangana'], ['Warangal', 'Telangana'],
  ['New Delhi', 'Delhi'], ['Ahmedabad', 'Gujarat'], ['Surat', 'Gujarat'],
  ['Lucknow', 'Uttar Pradesh'], ['Kanpur', 'Uttar Pradesh'],
  ['Kolkata', 'West Bengal'], ['Jaipur', 'Rajasthan'],
  ['Kochi', 'Kerala'], ['Bhopal', 'Madhya Pradesh'],
];

function seedRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function generateSKU(rand) {
  const cat = categories[Math.floor(rand() * categories.length)].slice(0, 3).toUpperCase();
  const num = String(Math.floor(rand() * 999)).padStart(3, '0');
  const sizeCode = ['KR', 'RD', 'NP', 'BL', 'GN'].map((c) => c[Math.floor(rand() * c.length)] || c[0]).join('');
  return `SET${num}-${sizeCode}`;
}

function generateOrders() {
  const orders = [];
  const rand = seedRandom(42);
  const startDate = new Date(2022, 3, 1);

  for (let i = 0; i < 42356; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + Math.floor(rand() * 91));
    const dateStr = date.toISOString().slice(0, 10);

    const [city, state] = cities[Math.floor(rand() * cities.length)];
    const category = categories[Math.floor(rand() * categories.length)];
    const size = sizes[Math.floor(rand() * sizes.length)];
    const status = statuses[Math.floor(rand() * statuses.length)];
    const fulfilment = fulfilments[Math.floor(rand() * fulfilments.length)];
    const qty = Math.ceil(rand() * 4);
    const amount = Math.round((500 + rand() * 3500) * qty);

    orders.push({
      id: i + 1,
      orderId: `406-${String(672000000 + i).slice(0, 9)}`,
      date: dateStr,
      category,
      sku: generateSKU(rand),
      size,
      fulfilment,
      status,
      city,
      state,
      qty,
      amount,
    });
  }

  return orders.sort((a, b) => b.date.localeCompare(a.date));
}

export const orders = generateOrders();

export const orderFilters = {
  categories,
  statuses,
  fulfilments,
  sizes,
};
