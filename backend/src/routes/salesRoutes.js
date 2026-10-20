import express from 'express';
import { getFilteredData, getAllData } from '../dataLoader.js';

const router = express.Router();

// 1. GET /api/sales/stats - Metrik KPI Ringkasan
router.get('/stats', (req, res) => {
    try {
        const data = getFilteredData(req.query);
        const totalRevenue = data.reduce((sum, item) => sum + item.amount, 0);
        const totalQty = data.reduce((sum, item) => sum + item.qty, 0);
        const totalOrders = new Set(data.map(i => i.orderId)).size;
        const cancelledOrders = data.filter(i => i.isCancelled).length;
        const b2bOrders = data.filter(i => i.b2b).length;

        res.json({
            totalRevenue: Math.round(totalRevenue),
            totalQty,
            totalOrders,
            avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
            cancellationRate: data.length > 0 ? Number(((cancelledOrders / data.length) * 100).toFixed(1)) : 0,
            b2bCount: b2bOrders,
            totalRows: data.length,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. GET /api/sales/trends - Tren Penjualan Harian/Bulanan
router.get('/trends', (req, res) => {
    try {
        const data = getFilteredData(req.query);
        const trendMap = {};

        data.forEach(item => {
            if (!item.date) return;
            if (!trendMap[item.date]) {
                trendMap[item.date] = { date: item.date, revenue: 0, qty: 0, orders: 0 };
            }
            trendMap[item.date].revenue += item.amount;
            trendMap[item.date].qty += item.qty;
            trendMap[item.date].orders += 1;
        });

        const trends = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));
        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. GET /api/sales/categories - Breakdown Kategori Produk
router.get('/categories', (req, res) => {
    try {
        const data = getFilteredData(req.query);
        const catMap = {};

        data.forEach(item => {
            const cat = item.category || 'Other';
            if (!catMap[cat]) {
                catMap[cat] = { category: cat, revenue: 0, qty: 0, count: 0 };
            }
            catMap[cat].revenue += item.amount;
            catMap[cat].qty += item.qty;
            catMap[cat].count += 1;
        });

        const categories = Object.values(catMap).sort((a, b) => b.revenue - a.revenue);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. GET /api/sales/geo - Distribusi Negara Bagian (Top 10 States)
router.get('/geo', (req, res) => {
    try {
        const data = getFilteredData(req.query);
        const stateMap = {};

        data.forEach(item => {
            const state = item.state && item.state !== 'UNKNOWN' ? item.state : 'Other';
            if (!stateMap[state]) {
                stateMap[state] = { state, revenue: 0, orders: 0 };
            }
            stateMap[state].revenue += item.amount;
            stateMap[state].orders += 1;
        });

        const states = Object.values(stateMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        res.json(states);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4b. GET /api/sales/breakdown - Visualisasi Fulfillment & Ukuran Produk
router.get('/breakdown', (req, res) => {
    try {
        const data = getFilteredData(req.query);

        const fulfilmentMap = {};
        const sizeMap = {};

        data.forEach(item => {
            const f = item.fulfilment === 'Amazon' ? 'Amazon FBA' : 'Merchant (Easy Ship)';
            if (!fulfilmentMap[f]) fulfilmentMap[f] = { name: f, count: 0, revenue: 0 };
            fulfilmentMap[f].count += 1;
            fulfilmentMap[f].revenue += item.amount;

            const s = (item.size || 'Other').trim().toUpperCase();
            if (s && s !== 'UNKNOWN') {
                if (!sizeMap[s]) sizeMap[s] = { size: s, qty: 0, revenue: 0 };
                sizeMap[s].qty += item.qty;
                sizeMap[s].revenue += item.amount;
            }
        });

        const fulfilment = Object.values(fulfilmentMap);
        const sizes = Object.values(sizeMap)
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 7);

        res.json({ fulfilment, sizes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. GET /api/sales/filters - Opsi Filter Dinamis
router.get('/filters', (req, res) => {
    try {
        const allData = getAllData();
        const months = [...new Set(allData.map(i => i.month))].filter(Boolean).sort();
        const categories = [...new Set(allData.map(i => i.category))].filter(Boolean).sort();
        const states = [...new Set(allData.map(i => i.state))].filter(s => s && s !== 'UNKNOWN').sort();

        res.json({ months, categories, states });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. GET /api/sales/table - Data Transaksi Terpaginasi
router.get('/table', (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const data = getFilteredData(req.query);

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const start = (pageNum - 1) * limitNum;
        const paginated = data.slice(start, start + limitNum);

        res.json({
            data: paginated,
            total: data.length,
            page: pageNum,
            totalPages: Math.ceil(data.length / limitNum),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 7. GET /api/sales/:id - Detail Transaksi berdasarkan ID
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const allData = getAllData();
        const item = allData.find(i => String(i.id) === String(id));

        if (!item) {
            return res.status(404).json({ error: 'Data not found', id });
        }

        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;