import express from 'express';
import { getFilteredData, getAllData, getCachedFilters, getDataById } from '../dataLoader.js';

const router = express.Router();

// In-memory cache untuk response endpoint berdasarkan query parameter
const responseCache = new Map();

function getCacheKey(endpoint, query) {
    const keys = Object.keys(query).filter(k => query[k] && query[k] !== 'all' && query[k] !== 'All').sort();
    return `${endpoint}:${keys.map(k => `${k}=${query[k]}`).join('&')}`;
}

function setCache(key, data) {
    if (!data) return;
    if (Array.isArray(data) && data.length === 0) return;
    if (data.totalRows === 0 && (!data.stats || data.stats.totalRows === 0)) return;
    if (responseCache.size > 200) {
        responseCache.clear();
    }
    responseCache.set(key, data);
}

// Single-pass computation: menghitung stats, trends, categories, geo, dan breakdown dalam 1 perulangan loop
function computeAllMetrics(data) {
    let totalRevenue = 0;
    let totalQty = 0;
    let cancelledOrders = 0;
    let b2bOrders = 0;
    const orderIdSet = new Set();
    const trendMap = {};
    const catMap = {};
    const stateMap = {};
    const fulfilmentMap = {};
    const sizeMap = {};

    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const amount = item.amount;
        const qty = item.qty;

        totalRevenue += amount;
        totalQty += qty;
        if (item.isCancelled) cancelledOrders++;
        if (item.b2b) b2bOrders++;
        orderIdSet.add(item.orderId);

        if (item.date) {
            let tEntry = trendMap[item.date];
            if (!tEntry) {
                tEntry = trendMap[item.date] = { date: item.date, revenue: 0, qty: 0, orders: 0 };
            }
            tEntry.revenue += amount;
            tEntry.qty += qty;
            tEntry.orders += 1;
        }

        const cat = item.category || 'Other';
        let cEntry = catMap[cat];
        if (!cEntry) {
            cEntry = catMap[cat] = { category: cat, revenue: 0, qty: 0, count: 0 };
        }
        cEntry.revenue += amount;
        cEntry.qty += qty;
        cEntry.count += 1;

        const state = item.state && item.state !== 'UNKNOWN' ? item.state : 'Other';
        let sEntry = stateMap[state];
        if (!sEntry) {
            sEntry = stateMap[state] = { state, revenue: 0, orders: 0 };
        }
        sEntry.revenue += amount;
        sEntry.orders += 1;

        const f = item.fulfilment === 'Amazon' ? 'Amazon FBA' : 'Merchant (Easy Ship)';
        let fEntry = fulfilmentMap[f];
        if (!fEntry) {
            fEntry = fulfilmentMap[f] = { name: f, count: 0, revenue: 0 };
        }
        fEntry.count += 1;
        fEntry.revenue += amount;

        const s = (item.size || 'Other').trim().toUpperCase();
        if (s && s !== 'UNKNOWN') {
            let szEntry = sizeMap[s];
            if (!szEntry) {
                szEntry = sizeMap[s] = { size: s, qty: 0, revenue: 0 };
            }
            szEntry.qty += qty;
            szEntry.revenue += amount;
        }
    }

    const totalOrders = orderIdSet.size;
    const stats = {
        totalRevenue: Math.round(totalRevenue),
        totalQty,
        totalOrders,
        avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        cancellationRate: data.length > 0 ? Number(((cancelledOrders / data.length) * 100).toFixed(1)) : 0,
        b2bCount: b2bOrders,
        totalRows: data.length,
    };

    const trends = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));
    const categories = Object.values(catMap).sort((a, b) => b.revenue - a.revenue);
    const geo = Object.values(stateMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    const fulfilment = Object.values(fulfilmentMap);
    const sizes = Object.values(sizeMap).sort((a, b) => b.qty - a.qty).slice(0, 7);

    return {
        stats,
        trends,
        categories,
        geo,
        breakdown: { fulfilment, sizes }
    };
}

// 0. GET /api/sales/overview - Semua data dashboard dalam 1 request jaringan (Sangat cepat di HP)
router.get('/overview', (req, res) => {
    try {
        const cacheKey = getCacheKey('overview', req.query);
        if (responseCache.has(cacheKey)) {
            return res.json(responseCache.get(cacheKey));
        }

        const data = getFilteredData(req.query);
        const result = computeAllMetrics(data);

        setCache(cacheKey, result);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 1. GET /api/sales/stats - Metrik KPI Ringkasan (Single-pass loop)
router.get('/stats', (req, res) => {
    try {
        const cacheKey = getCacheKey('stats', req.query);
        if (responseCache.has(cacheKey)) {
            return res.json(responseCache.get(cacheKey));
        }

        const data = getFilteredData(req.query);
        let totalRevenue = 0;
        let totalQty = 0;
        let cancelledOrders = 0;
        let b2bOrders = 0;
        const orderIdSet = new Set();

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            totalRevenue += item.amount;
            totalQty += item.qty;
            if (item.isCancelled) cancelledOrders++;
            if (item.b2b) b2bOrders++;
            orderIdSet.add(item.orderId);
        }

        const totalOrders = orderIdSet.size;
        const result = {
            totalRevenue: Math.round(totalRevenue),
            totalQty,
            totalOrders,
            avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
            cancellationRate: data.length > 0 ? Number(((cancelledOrders / data.length) * 100).toFixed(1)) : 0,
            b2bCount: b2bOrders,
            totalRows: data.length,
        };

        setCache(cacheKey, result);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. GET /api/sales/trends - Tren Penjualan Harian/Bulanan
router.get('/trends', (req, res) => {
    try {
        const cacheKey = getCacheKey('trends', req.query);
        if (responseCache.has(cacheKey)) {
            return res.json(responseCache.get(cacheKey));
        }

        const data = getFilteredData(req.query);
        const trendMap = {};

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (!item.date) continue;
            let entry = trendMap[item.date];
            if (!entry) {
                entry = trendMap[item.date] = { date: item.date, revenue: 0, qty: 0, orders: 0 };
            }
            entry.revenue += item.amount;
            entry.qty += item.qty;
            entry.orders += 1;
        }

        const trends = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));
        setCache(cacheKey, trends);
        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. GET /api/sales/categories - Breakdown Kategori Produk
router.get('/categories', (req, res) => {
    try {
        const cacheKey = getCacheKey('categories', req.query);
        if (responseCache.has(cacheKey)) {
            return res.json(responseCache.get(cacheKey));
        }

        const data = getFilteredData(req.query);
        const catMap = {};

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const cat = item.category || 'Other';
            let entry = catMap[cat];
            if (!entry) {
                entry = catMap[cat] = { category: cat, revenue: 0, qty: 0, count: 0 };
            }
            entry.revenue += item.amount;
            entry.qty += item.qty;
            entry.count += 1;
        }

        const categories = Object.values(catMap).sort((a, b) => b.revenue - a.revenue);
        setCache(cacheKey, categories);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. GET /api/sales/geo - Distribusi Negara Bagian (Top 10 States)
router.get('/geo', (req, res) => {
    try {
        const cacheKey = getCacheKey('geo', req.query);
        if (responseCache.has(cacheKey)) {
            return res.json(responseCache.get(cacheKey));
        }

        const data = getFilteredData(req.query);
        const stateMap = {};

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const state = item.state && item.state !== 'UNKNOWN' ? item.state : 'Other';
            let entry = stateMap[state];
            if (!entry) {
                entry = stateMap[state] = { state, revenue: 0, orders: 0 };
            }
            entry.revenue += item.amount;
            entry.orders += 1;
        }

        const states = Object.values(stateMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        setCache(cacheKey, states);
        res.json(states);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4b. GET /api/sales/breakdown - Visualisasi Fulfillment & Ukuran Produk
router.get('/breakdown', (req, res) => {
    try {
        const cacheKey = getCacheKey('breakdown', req.query);
        if (responseCache.has(cacheKey)) {
            return res.json(responseCache.get(cacheKey));
        }

        const data = getFilteredData(req.query);
        const fulfilmentMap = {};
        const sizeMap = {};

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const f = item.fulfilment === 'Amazon' ? 'Amazon FBA' : 'Merchant (Easy Ship)';
            let fEntry = fulfilmentMap[f];
            if (!fEntry) fEntry = fulfilmentMap[f] = { name: f, count: 0, revenue: 0 };
            fEntry.count += 1;
            fEntry.revenue += item.amount;

            const s = (item.size || 'Other').trim().toUpperCase();
            if (s && s !== 'UNKNOWN') {
                let sEntry = sizeMap[s];
                if (!sEntry) sEntry = sizeMap[s] = { size: s, qty: 0, revenue: 0 };
                sEntry.qty += item.qty;
                sEntry.revenue += item.amount;
            }
        }

        const fulfilment = Object.values(fulfilmentMap);
        const sizes = Object.values(sizeMap)
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 7);

        const result = { fulfilment, sizes };
        setCache(cacheKey, result);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. GET /api/sales/filters - Opsi Filter Dinamis (Instan dari precomputed cache)
router.get('/filters', (req, res) => {
    try {
        res.json(getCachedFilters());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. GET /api/sales/table - Data Transaksi Terpaginasi
router.get('/table', (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const data = getFilteredData(req.query);

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, parseInt(limit) || 20);
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

// 7. GET /api/sales/:id - Detail Transaksi berdasarkan ID (O(1) Map lookup)
router.get('/:id', (req, res) => {
    try {
        const item = getDataById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Data not found', id: req.params.id });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;