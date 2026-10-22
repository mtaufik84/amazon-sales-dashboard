# Sales Dashboard — Amazon India (Q2 2022)

Dashboard analitik penjualan **Amazon India · Women's Fashion (Q2 2022)** dengan 4 modul utama:

1. **Ringkasan Eksekutif** — KPI, tren pendapatan harian, kategori, provinsi teratas, distribusi ukuran
2. **Peta Segmentasi Wilayah** — choropleth 36 provinsi India dengan klasterisasi K-Means
3. **Sistem Rekomendasi** — rekomendasi aksi, rencana stok & ROP, risiko pembatalan (model Logistic Regression + Random Forest)
4. **Daftar Pesanan** — tabel 42.357 transaksi dengan filter, pencarian, paginasi, ekspor CSV, dan faktur cetak

## Tujuan

Mengubah laporan penjualan e-commerce mentah menjadi **dashboard interaktif yang bisa diambil keputusan** tanpa membuka Excel: melihat kesehatan bisnis harian, menemukan wilayah/kategori bermasalah, memprioritaskan restock SKU, mengidentifikasi wilayah berisiko batal, dan menyimulasikan risiko pembatalan per pesanan baru.

## Arsitektur

```
┌───────────────────────┐        HTTP (JSON)        ┌──────────────────────────┐
│  frontend/            │  ─────────────────────────▶│  backend/ (Express Node) │
│  React + Vite + Tailwind│  :5173 ◀─────────────────  │  :5001                   │
└───────────────────────┘                            └────────────┬─────────────┘
                                                                  │ membaca saat startup
                                                     ┌────────────▼─────────────┐
                                                     │ data/*.csv               │
                                                     │ backend/src/data/ml/*.json│
                                                     └────────────▲─────────────┘
                                                                  │ artefak model (dibekukan)
                                                     ┌────────────┴─────────────┐
                                                     │ ml/ (Python — offline)   │
                                                     │ training pipeline        │
                                                     └──────────────────────────┘
```

- **frontend/** — React 18 + Vite + Tailwind CSS. Semua angka dihitung dari API; tidak ada data hardcode/mock.
- **backend/** — Node.js + Express. Memuat dataset CSV **satu kali** ke memori saat startup, lalu melayani 15+ endpoint JSON (filter, agregasi, paginasi, prediksi ML).
- **data/** — dataset bersih `Amazon_Sale_Report_Cleaned.csv` (42.357 baris).
- **ml/** — pipeline Python offline (skrip + notebook + requirements). Memproduce artefak JSON di `backend/src/data/ml/`: klaster wilayah, model risiko pembatalan, rencana stok, dan rekomendasi aksi. Backend **tidak** memanggil Python — hanya membaca JSON-nya.

## Struktur Folder

```
sales-dashboardfinal/
├── frontend/          # Aplikasi React (Vite + Tailwind)
│   ├── src/           # pages/ components/ services/api.js
│   └── package.json   # npm run dev / build
├── backend/           # Server REST (Express)
│   ├── src/           # server.js, dataLoader.js, routes/, services/mlLoader.js
│   ├── src/data/ml/   # Artefak model (JSON) — output dari ml/
│   └── .env           # PORT=5001, DATA_PATH=../data/Amazon_Sale_Report_Cleaned.csv
├── data/              # Dataset transaksi bersih (CSV)
├── ml/                # Pipeline training Python (data, notebooks, scripts)
└── uiRedesign.md      # Dokumentasi workflow desain UI (6 fase)
```

## Cara Menjalankan (Development)

Prasyarat: Node.js 20+.

**1. Backend (Terminal 1)**
```bash
cd backend
node src/server.js          # .env sudah berisi PORT=5001 + path dataset
```
Output sukses: `Backend Server berjalan aktif di http://localhost:5001`.

**2. Frontend (Terminal 2)**
```bash
cd frontend
npm install                 # hanya sekali di awal
npm run dev                 # buka http://localhost:5173
```

> Redirect: `services/api.js` memanggil `http://localhost:5001/api`. Kalau backend portnya diubah, sesuaikan `VITE_API_URL`/fallback di `frontend/src/services/api.js`.

## Build Produksi & Deploy

```bash
cd frontend
npm run build               # menghasilkan frontend/dist/
```
Deploy isi `dist/` ke static host apa pun (Vercel, Netlify, GitHub Pages, nginx), sementara `backend/` jalan sendiri (Railway, Render, VPS). Pastikan `DATA_PATH` di backend menunjuk ke file CSV yang visible di server.

## Endpoint API (backend :5001)

| Endpoint | Fungsi |
|---|---|
| `GET /api/sales/stats` | KPI (pendapatan, pesanan, unit, cancel rate, AOV) + filter |
| `GET /api/sales/trends` | Deret harian pendapatan/unit/pesanan |
| `GET /api/sales/categories` · `/geo` · `/breakdown` | Kategori, provinsi, fulfilment & ukuran |
| `GET /api/sales/filters` | Opsi filter dinamis (bulan/kategori/negara) |
| `GET /api/sales/table` | Tabel transaksi + paginasi (`?page&limit&month&category&status&fulfilment&search`) |
| `GET /api/sales/:id` | Detail satu transaksi |
| `GET /api/segments` | Klaster wilayah (K-Means) + metrik per provinsi |
| `GET /api/segments/geojson` | GeoJSON provinsi India + warna klaster |
| `GET /api/recommendations` | 5 kartu rekomendasi aksi |
| `GET /api/recommendations/stock` | Rencana stok 30 SKU + proyeksi kategori 14 hari |
| `GET /api/recommendations/cancel-risk` | Metrik model, feature importance, risiko per dimensi |
| `POST /api/recommendations/predict-cancel` | Simulasi risiko batal per pesanan |

Filter query yang didukung: `month` (`2022-04`), `category`, `status` (`Shipped`/`Cancelled`/`Delivered`), `fulfilment` (`Amazon`/`Merchant`), `search`.

## Mengembangkan Ulang Model (Retraining)

Model sudah dibekukan sebagai JSON, jadi **frontend + backend jalan tanpa Python**. Untuk melatih ulang (misal dataset baru):

```bash
cd ml
pip install -r requirements.txt
# jalankan script/notebook di ml/scripts & ml/notebooks
# salin/update hasil artefak JSON ke backend/src/data/ml/
```
lalu restart backend.

## Teknologi

- **Frontend:** React 18, Vite 5, Tailwind CSS, Recharts, Lucide Icons, React Router
- **Backend:** Node.js (Express, csv-parse, dotenv)
- **ML:** Python (scikit-learn, pandas) — K-Means, Logistic Regression & Random Forest
- **Dataset:** [Amazon India Sales Report, Q2 2022](https://www.kaggle.com/datasets/thedevastator/unlock-profits-with-e-commerce-sales-data?select=Amazon+Sale+Report.csv) 
