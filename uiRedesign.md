# Workflow: Integrasi UI Referensi Bolt → Frontend sales-dashboard2

## Konteks
- Arsitektur: React 19 + Vite + Tailwind 3.4 + Recharts + React Router 7 (frontend),
  Express 4 port 5000 (backend), data in-memory + artefak ML JSON.
- Referensi UI dari Bolt ada di: `frontend/src/_reference/sales-reference`
- TUJUAN: ganti tampilan frontend sesuai referensi, pertahankan seluruh fungsi yang ada.

## ATURAN KERAS
1. JANGAN ubah apa pun di `backend/`, `ml/`, atau `data/`.
2. JANGAN ubah kontrak API (endpoint, query params, bentuk JSON).
3. Logika data (`services/api.js`, interceptor, formatter) dipertahankan; hanya
   dipindahkan/diadaptasi bila perlu.
4. Kerjakan di branch `ui-redesign`. Commit per fase.
5. Jangan hapus `_reference/sales-reference` sampai seluruh fase selesai dan diverifikasi.
6. Setelah tiap fase: `npm run build` harus sukses, tanpa error console.

## Fase 0: Persiapan
- [ ] `git checkout -b ui-redesign` dan commit kondisi sekarang sebagai backup.
- [ ] Pastikan backend jalan di :5000 dan frontend lama berfungsi (catat baseline).

## Fase 1: Audit
- [ ] Baca seluruh `_reference/sales-reference/` (komponen, pages, tailwind.config.js, index.css).
- [ ] Baca frontend existing (`components/`, `pages/`, `services/api.js`).
- [ ] Buat tabel pemetaan komponen lama → komponen referensi
      (mis. Navbar → AppShell/Sidebar/Topbar, Dashboard → KpiCard + chart baru).
- [ ] Daftar dependency baru dari referensi yang belum ada di `frontend/package.json`.
- [ ] Laporkan hasil audit dan tunggu konfirmasi sebelum lanjut.

## Fase 2: Fondasi desain
- [ ] Install dependency tambahan yang disetujui (hanya yang benar-benar dipakai).
- [ ] Gabungkan design tokens: `tailwind.config.js` (warna, font, radius) dan `index.css`.
- [ ] Pindahkan `lib/format.js` (₹, tanggal, angka) dan satukan dengan formatter di `api.js`.
- [ ] Salin komponen dasar: StatusBadge, Skeleton, EmptyState, Toast.

## Fase 3: Layout shell
- [ ] Terapkan AppShell (Sidebar + Topbar) menggantikan Navbar di `App.jsx`.
- [ ] Pastikan route tetap: `/`, `/wilayah`, `/rekomendasi`, `/data`, `/detail/:id`, `*`.
- [ ] Dark/light mode, command palette, mobile responsive berfungsi.

## Fase 4: Integrasi per halaman (satu halaman = satu commit)
Urutan: HomePage → DataPage → DetailPage → RegionMapPage → RecommendationPage → NotFoundPage

Untuk setiap halaman:
- [ ] Ganti markup/komponen lama dengan komponen referensi.
- [ ] Hapus import `mocks/`, sambungkan props ke API lewat `services/api.js`.
- [ ] Pertahankan perilaku lama: filter + debounce 300 ms, paginasi, ekspor CSV,
      print invoice, simulator `POST /api/recommendations/predict-cancel`.
- [ ] Peta: pakai `GET /api/segments/geojson` (GeoJSON yang sudah diperkaya klaster).
- [ ] Mapping field API → props (contoh: `salesData` camelCase vs props referensi).
- [ ] Tambahkan loading (skeleton), error, dan empty state untuk setiap fetch.

## Fase 5: Verifikasi
- [ ] Semua filter, search, paginasi, dan ekspor CSV menghasilkan data yang sama dengan versi lama.
- [ ] Simulator mengembalikan probabilitas sama untuk input yang sama (uji 3 kasus).
- [ ] Peta menampilkan 36 wilayah dengan warna klaster benar.
- [ ] Responsif di 375 px, 768 px, 1440 px.
- [ ] Print `/detail/:id` rapi.
- [ ] Tidak ada error/warning di console; `npm run build` sukses.

## Fase 6: Pembersihan
- [ ] Hapus komponen lama yang tidak terpakai.
- [ ] Hapus `_reference/sales-reference` (setelah konfirmasi) dan mock data yang tersisa.
- [ ] Update dokumen analisis sistem: bagian struktur direktori (2.4) dan wireframe (8).
- [ ] Merge `ui-redesign` ke main.

## Laporan akhir
Ringkas: file yang berubah, dependency baru, hal yang berbeda dari referensi, dan masalah yang tersisa.# Workflow: Integrasi UI Referensi Bolt → Frontend sales-dashboard2

## Konteks
- Arsitektur: React 19 + Vite + Tailwind 3.4 + Recharts + React Router 7 (frontend),
  Express 4 port 5000 (backend), data in-memory + artefak ML JSON.
- Referensi UI dari Bolt ada di: `frontend/src/_reference/sales-reference`
- TUJUAN: ganti tampilan frontend sesuai referensi, pertahankan seluruh fungsi yang ada.

## ATURAN KERAS
1. JANGAN ubah apa pun di `backend/`, `ml/`, atau `data/`.
2. JANGAN ubah kontrak API (endpoint, query params, bentuk JSON).
3. Logika data (`services/api.js`, interceptor, formatter) dipertahankan; hanya
   dipindahkan/diadaptasi bila perlu.
4. Kerjakan di branch `ui-redesign`. Commit per fase.
5. Jangan hapus `_reference/sales-reference` sampai seluruh fase selesai dan diverifikasi.
6. Setelah tiap fase: `npm run build` harus sukses, tanpa error console.

## Fase 0: Persiapan
- [ ] `git checkout -b ui-redesign` dan commit kondisi sekarang sebagai backup.
- [ ] Pastikan backend jalan di :5000 dan frontend lama berfungsi (catat baseline).

## Fase 1: Audit
- [ ] Baca seluruh `_reference/sales-reference` (komponen, pages, tailwind.config.js, index.css).
- [ ] Baca frontend existing (`components/`, `pages/`, `services/api.js`).
- [ ] Buat tabel pemetaan komponen lama → komponen referensi
      (mis. Navbar → AppShell/Sidebar/Topbar, Dashboard → KpiCard + chart baru).
- [ ] Daftar dependency baru dari referensi yang belum ada di `frontend/package.json`.
- [ ] Laporkan hasil audit dan tunggu konfirmasi sebelum lanjut.

## Fase 2: Fondasi desain
- [ ] Install dependency tambahan yang disetujui (hanya yang benar-benar dipakai).
- [ ] Gabungkan design tokens: `tailwind.config.js` (warna, font, radius) dan `index.css`.
- [ ] Pindahkan `lib/format.js` (₹, tanggal, angka) dan satukan dengan formatter di `api.js`.
- [ ] Salin komponen dasar: StatusBadge, Skeleton, EmptyState, Toast.

## Fase 3: Layout shell
- [ ] Terapkan AppShell (Sidebar + Topbar) menggantikan Navbar di `App.jsx`.
- [ ] Pastikan route tetap: `/`, `/wilayah`, `/rekomendasi`, `/data`, `/detail/:id`, `*`.
- [ ] Dark/light mode, command palette, mobile responsive berfungsi.

## Fase 4: Integrasi per halaman (satu halaman = satu commit)
Urutan: HomePage → DataPage → DetailPage → RegionMapPage → RecommendationPage → NotFoundPage

Untuk setiap halaman:
- [ ] Ganti markup/komponen lama dengan komponen referensi.
- [ ] Hapus import `mocks/`, sambungkan props ke API lewat `services/api.js`.
- [ ] Pertahankan perilaku lama: filter + debounce 300 ms, paginasi, ekspor CSV,
      print invoice, simulator `POST /api/recommendations/predict-cancel`.
- [ ] Peta: pakai `GET /api/segments/geojson` (GeoJSON yang sudah diperkaya klaster).
- [ ] Mapping field API → props (contoh: `salesData` camelCase vs props referensi).
- [ ] Tambahkan loading (skeleton), error, dan empty state untuk setiap fetch.

## Fase 5: Verifikasi
- [ ] Semua filter, search, paginasi, dan ekspor CSV menghasilkan data yang sama dengan versi lama.
- [ ] Simulator mengembalikan probabilitas sama untuk input yang sama (uji 3 kasus).
- [ ] Peta menampilkan 36 wilayah dengan warna klaster benar.
- [ ] Responsif di 375 px, 768 px, 1440 px.
- [ ] Print `/detail/:id` rapi.
- [ ] Tidak ada error/warning di console; `npm run build` sukses.

## Fase 6: Pembersihan
- [ ] Hapus komponen lama yang tidak terpakai.
- [ ] Hapus `_reference/sales-reference` (setelah konfirmasi) dan mock data yang tersisa.
- [ ] Update dokumen analisis sistem: bagian struktur direktori (2.4) dan wireframe (8).
- [ ] Merge `ui-redesign` ke main.

## Laporan akhir
Ringkas: file yang berubah, dependency baru, hal yang berbeda dari referensi, dan masalah yang tersisa.