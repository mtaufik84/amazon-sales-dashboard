import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let salesData = [];

// Fungsi memformat tanggal MM-DD-YY atau YYYY-MM-DD menjadi ISO YYYY-MM-DD
function parseDateString(dateStr) {
    if (!dateStr) return { isoDate: '', year: '', month: '', monthName: '' };
    const parts = dateStr.split('-');
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Format YYYY-MM-DD (dari cleaned CSV)
    if (parts.length === 3 && parts[0].length === 4) {
        const [fullYear, paddedMonth, paddedDay] = parts;
        return {
            isoDate: `${fullYear}-${paddedMonth}-${paddedDay}`,
            year: fullYear,
            month: `${fullYear}-${paddedMonth}`,
            monthName: `${monthNames[parseInt(paddedMonth)] || ''} ${fullYear}`,
        };
    }
    
    // Format MM-DD-YY (dari raw CSV)
    if (parts.length === 3) {
        let [m, d, y] = parts;
        const fullYear = y.length === 2 ? `20${y}` : y;
        const paddedMonth = m.padStart(2, '0');
        const paddedDay = d.padStart(2, '0');
        return {
            isoDate: `${fullYear}-${paddedMonth}-${paddedDay}`,
            year: fullYear,
            month: `${fullYear}-${paddedMonth}`,
            monthName: `${monthNames[parseInt(paddedMonth)] || ''} ${fullYear}`,
        };
    }
    return { isoDate: dateStr, year: '', month: '', monthName: '' };
}

export async function loadData() {
    return new Promise((resolve, reject) => {
        const csvPath = process.env.DATA_PATH
            ? path.resolve(__dirname, '..', process.env.DATA_PATH)
            : path.join(__dirname, '../../data/Amazon Sale Report.csv');

        if (!fs.existsSync(csvPath)) {
            reject(new Error(`CSV file tidak ditemukan di: ${csvPath}`));
            return;
        }

        const results = [];
        console.log(`Memuat dataset dari ${csvPath}...`);

        fs.createReadStream(csvPath)
            .pipe(parse({
                columns: true,
                skip_empty_lines: true,
                trim: true,
            }))
            .on('data', (row, index) => {
                const rawDate = row['order_date'] || row['Date'] || '';
                const dateInfo = parseDateString(rawDate);
                const qty = parseInt(row['Qty'] || row['qty']) || 0;
                const amount = parseFloat(row['Amount'] || row['amount']) || 0;
                const status = (row['Status'] || row['status'] || 'Unknown').trim();
                const isCancelled = row['is_cancelled'] !== undefined 
                    ? (row['is_cancelled'] === 'True' || row['is_cancelled'] === true)
                    : status.toLowerCase().includes('cancelled');
                const isDelivered = row['is_delivered'] !== undefined 
                    ? (row['is_delivered'] === 'True' || row['is_delivered'] === true)
                    : status.toLowerCase().includes('delivered');
                results.push({
                    id: results.length + 1,
                    orderId: row['Order ID'] || row['order_id'] || '',
                    date: dateInfo.isoDate,
                    year: dateInfo.year,
                    month: dateInfo.month,
                    monthName: dateInfo.monthName,
                    status: status,
                    isCancelled,
                    isDelivered,
                    fulfilment: row['Fulfilment'] || row['fulfilment'] || 'Merchant',
                    channel: row['Sales Channel '] || row['sales_channel'] || 'Amazon.in',
                    serviceLevel: row['ship-service-level'] || row['ship_service_level'] || 'Standard',
                    style: row['Style'] || row['style'] || '',
                    sku: row['SKU'] || row['sku'] || '',
                    category: row['Category'] || row['category'] || 'Other',
                    size: row['Size'] || row['size'] || '',
                    asin: row['ASIN'] || row['asin'] || '',
                    courierStatus: row['Courier Status'] || row['courier_status'] || '',
                    qty: qty,
                    currency: row['currency'] || 'INR',
                    amount: amount,
                    city: (row['ship-city'] || row['ship_city'] || 'UNKNOWN').toUpperCase(),
                    state: (row['ship-state'] || row['ship_state'] || 'UNKNOWN').toUpperCase(),
                    postalCode: row['ship-postal-code'] || row['ship_postal_code'] || '',
                    b2b: row['B2B'] === 'True' || row['B2B'] === true || row['b2b'] === 'True' || row['b2b'] === true,
                    searchStr: `${row['Order ID'] || row['order_id'] || ''} ${row['SKU'] || row['sku'] || ''} ${row['ASIN'] || row['asin'] || ''} ${row['ship-city'] || row['ship_city'] || ''}`.toLowerCase(),
                });
            })
            .on('end', () => {
                salesData = results;
                salesDataById = new Map();
                for (let i = 0; i < salesData.length; i++) {
                    salesDataById.set(String(salesData[i].id), salesData[i]);
                }

                // Precompute static filter options once
                const months = [...new Set(salesData.map(i => i.month))].filter(Boolean).sort();
                const categories = [...new Set(salesData.map(i => i.category))].filter(Boolean).sort();
                const states = [...new Set(salesData.map(i => i.state))].filter(s => s && s !== 'UNKNOWN').sort();
                cachedFilters = { months, categories, states };

                console.log(`Berhasil memuat ${salesData.length} baris data transaksi Amazon (terindeks).`);
                resolve(salesData);
            })
            .on('error', (err) => {
                console.error('Gagal membaca CSV:', err);
                reject(err);
            });
    });
}

let salesDataById = new Map();
let cachedFilters = { months: [], categories: [], states: [] };
const filterCache = new Map();

export function getAllData() {
    return salesData;
}

export function getDataById(id) {
    return salesDataById.get(String(id)) || null;
}

export function getCachedFilters() {
    return cachedFilters;
}

export function getFilteredData(filters = {}) {
    const month = filters.month && filters.month !== 'all' ? filters.month : null;
    const category = filters.category && filters.category !== 'All' && filters.category !== 'all' ? filters.category : null;
    const status = filters.status && filters.status !== 'All' && filters.status !== 'all' ? filters.status : null;
    const fulfilment = filters.fulfilment && filters.fulfilment !== 'All' && filters.fulfilment !== 'all' ? filters.fulfilment : null;
    const state = filters.state && filters.state !== 'All' && filters.state !== 'all' ? filters.state : null;
    const search = filters.search ? filters.search.toLowerCase().trim() : null;

    // Jika tanpa filter, langsung gunakan dataset penuh tanpa alokasi baru
    if (!month && !category && !status && !fulfilment && !state && !search) {
        return salesData;
    }

    const cacheKey = `${month || ''}|${category || ''}|${status || ''}|${fulfilment || ''}|${state || ''}|${search || ''}`;
    if (filterCache.has(cacheKey)) {
        return filterCache.get(cacheKey);
    }

    let filtered = salesData;

    if (month) {
        filtered = filtered.filter(item => item.month === month);
    }
    if (category) {
        const catLower = category.toLowerCase();
        filtered = filtered.filter(item => item.category.toLowerCase() === catLower);
    }
    if (status) {
        if (status === 'Cancelled') {
            filtered = filtered.filter(item => item.isCancelled);
        } else if (status === 'Delivered') {
            filtered = filtered.filter(item => item.isDelivered);
        } else if (status === 'Shipped') {
            filtered = filtered.filter(item => !item.isCancelled);
        }
    }
    if (fulfilment) {
        const fulLower = fulfilment.toLowerCase();
        filtered = filtered.filter(item => item.fulfilment.toLowerCase() === fulLower);
    }
    if (state) {
        filtered = filtered.filter(item => item.state === state);
    }
    if (search) {
        filtered = filtered.filter(item => item.searchStr.includes(search));
    }

    if (filterCache.size > 50) {
        filterCache.clear();
    }
    filterCache.set(cacheKey, filtered);

    return filtered;
}