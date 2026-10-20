export const recommendations = [
  {
    id: 1,
    title: 'Optimalkan Stok Set & Kurta untuk Musim Raya',
    pillar: 'Stok',
    priority: 'Kritis',
    impact: 3420000,
    description:
      'Penjualan Set & Kurta meningkat 18% di Q2. Dengan restock tepat waktu pada 12 SKU teratas, diproyeksikan tambahan pendapatan ₹34,20,000 dalam 30 hari ke depan.',
    checklist: [
      { text: 'Identifikasi 12 SKU Set & Kurta dengan stockout risk', done: true },
      { text: 'Hitung reorder quantity berdasarkan ADS × lead time', done: true },
      { text: 'Negosiasi harga dengan supplier untuk batch besar', done: false },
      { text: 'Jadwalkan restock sebelum 15 Juli 2022', done: false },
    ],
  },
  {
    id: 2,
    title: 'Kurangi Tingkat Pembatalan di Segmen Bihar & Odisha',
    pillar: 'Pembatalan',
    priority: 'Tinggi',
    impact: 1860000,
    description:
      'Tingkat pembatalan Bihar (19.8%) dan Odisha (18.2%) di atas rata-rata nasional. Mayoritas pembatalan terjadi pada pesanan Merchant fulfilment dengan layanan Standar.',
    checklist: [
      { text: 'Audit penyebab pembatalan: stok tidak tersedia vs alamat salah', done: true },
      { text: 'Ubah 15 SKU high-risk ke Amazon FBA', done: false },
      { text: 'Tingkatkan akurasi listing untuk ukuran & warna', done: false },
      { text: 'Aktifkan konfirmasi pesanan otomatis untuk pengguna baru', done: false },
    ],
  },
  {
    id: 3,
    title: 'Perluas Katalog Size XXL & 3XL',
    pillar: 'Produk',
    priority: 'Tinggi',
    impact: 1240000,
    description:
      'Distribusi ukuran menunjukkan permintaan XXL (10.4%) & 3XL (5.5%) lebih tinggi dari persediaan saat ini. Menambah 8 SKU di kategori ini dapat menangkap pasar yang belum terlayani.',
    checklist: [
      { text: 'Analisis tren pencarian ukuran besar di Amazon', done: true },
      { text: 'Rancang 8 SKU baru dengan vendor existing', done: false },
      { text: 'Listing dengan kata kunci "plus size" & "curvy"', done: false },
    ],
  },
  {
    id: 4,
    title: 'Promosikan Gown untuk Pasar Pernikahan',
    pillar: 'Pemasaran',
    priority: 'Sedang',
    impact: 890000,
    description:
      'Kategori Gown memiliki margin tertinggi (38%) namun volume rendah. Kampanye musim pernikahan Q3 dapat meningkatkan penjualan 2.5x, terutama di cluster "Menengah Atas".',
    checklist: [
      { text: 'Buat kampanye Sponsored Brands "Gown Pesta"', done: false },
      { text: 'Targetkan cluster Tinggi Volume & Menengah Atas', done: false },
      { text: 'Alokasi budget iklan ₹45,000/bulan', done: false },
    ],
  },
  {
    id: 5,
    title: 'Hentikan 5 SKU dengan Performa Buruk',
    pillar: 'Produk',
    priority: 'Rendah',
    impact: 320000,
    description:
      'Lima SKU di kategori Dupatta & Lounge memiliki ADS < 0.5 dan tingkat retur > 25%. Penghentian menghemat biaya penyimpanan & listing.',
    checklist: [
      { text: 'Tinjau 90-day performance untuk 5 SKU kandidat', done: true },
      { text: 'Lakukan clearance sale untuk sisa stok', done: false },
      { text: 'Nonaktifkan listing setelah stok habis', done: false },
    ],
  },
];

export const recommendationFilters = {
  pillars: ['Stok', 'Pembatalan', 'Produk', 'Pemasaran'],
  priorities: ['Kritis', 'Tinggi', 'Sedang', 'Rendah'],
};
