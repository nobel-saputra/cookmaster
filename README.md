# CookMaster - Aplikasi Manajemen Resep 🍳

CookMaster adalah aplikasi manajemen resep yang komprehensif dibangun dengan React Native dan Expo. Aplikasi ini memungkinkan pengguna untuk menemukan, membeli, dan mengelola resep masakan dengan fungsionalitas keranjang belanja terintegrasi dan otentikasi pengguna.

## Fitur-fitur

- **Otentikasi Pengguna**: Sistem login dan pendaftaran yang aman dengan verifikasi email
- **Penemuan Resep**: Jelajahi dan cari berbagai resep
- **Manajemen Resep**: Tambah, edit, dan hapus resep (untuk pembuat konten)
- **Sistem Pembelian**: Beli resep dan akses di koleksi pribadi Anda
- **Keranjang Belanja**: Tambahkan resep ke keranjang untuk pembelian nanti
- **Detail Resep**: Lihat informasi resep secara detail dengan gambar dan instruksi
- **Profil Pengguna**: Kelola akun dan resep yang telah dibeli

## Teknologi yang Digunakan

- **Framework**: [Expo](https://expo.dev) dengan React Native
- **Manajemen State**: [Zustand](https://github.com/pmndrs/zustand)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL, Auth, Storage)
- **Komponen UI**: Komponen bawaan React Native dengan ikon vektor
- **Validasi**: [Zod](https://github.com/colinhacks/zod) untuk validasi formulir
- **Navigasi**: Expo Router dengan routing berbasis file
- **Penanganan File**: Pemilih gambar dan kemampuan melihat PDF

## Struktur Proyek

```
cookmaster/
├── app/                    # Layar aplikasi dan routing
│   ├── (auth)/            # Layar otentikasi (login, register)
│   ├── (tabs)/            # Navigasi tab utama (home, explore, cart, profile)
│   ├── edit/              # Layar pengeditan resep
│   ├── resep/             # Layar detail dan pembuatan resep
│   ├── _layout.tsx        # Komponen layout root
│   └── modal.tsx          # Komponen modal
├── components/            # Komponen UI yang dapat digunakan kembali
├── store/                 # Store Zustand untuk manajemen state
│   ├── authStore.ts       # State otentikasi
│   ├── cartStore.ts       # State keranjang belanja
│   ├── homeStore.ts       # State layar beranda
│   ├── purchaseStore.ts   # State riwayat pembelian
│   └── resepStore.ts      # State manajemen resep
├── lib/                   # File-file library
│   ├── supabase.ts        # Konfigurasi klien Supabase
│   └── supabaseClient.ts  # Instance klien Supabase
├── assets/                # Gambar dan aset statis lainnya
├── hooks/                 # Hook React kustom
└── constants/             # Konstanta aplikasi
```

## Instalasi

1. Klon repositori atau navigasi ke direktori proyek

2. Instal dependensi:

   ```bash
   npm install
   ```

3. Siapkan variabel lingkungan (opsional - fallback tersedia di kode):
   ```bash
   # Di file .env
   EXPO_PUBLIC_SUPABASE_URL=url_supabase_anda
   EXPO_PUBLIC_SUPABASE_ANON_KEY=kunci_supabase_anon_anda
   ```

4. Jalankan server pengembangan:

   ```bash
   npx expo start
   ```

## Memulai

Setelah menjalankan aplikasi, Anda akan secara otomatis diarahkan berdasarkan status otentikasi Anda:

- **Pengguna baru**: Diarahkan ke layar pendaftaran
- **Pengguna yang kembali**: Diarahkan ke layar login
- **Pengguna yang terotentikasi**: Diarahkan ke tab utama aplikasi

## Fungsionalitas Utama

### Otentikasi
- Daftar dengan email dan kata sandi (kata sandi harus mencakup huruf besar, huruf kecil, dan angka)
- Login dengan email dan kata sandi
- Manajemen sesi dengan pemeriksaan sesi otomatis

### Layar Beranda
- Menampilkan pesan sambutan dan nama aplikasi
- Menampilkan statistik: total resep dan resep terbaru
- Menyediakan tautan cepat ke halaman jelajah

### Manajemen Resep
- Jelajahi resep di layar eksplorasi
- Lihat informasi resep secara detail (judul, deskripsi, harga, gambar)
- Beli resep secara langsung atau tambahkan ke keranjang
- Akses resep yang telah dibeli dengan lencana khusus
- Buat resep baru dengan judul, deskripsi, harga, gambar, dan bahan-bahan

### Sistem Keranjang
- Tambahkan resep ke keranjang untuk pembelian nanti
- Lihat dan kelola item di keranjang Anda
- Lanjutkan ke checkout untuk beberapa item

### Profil Pengguna
- Akses fitur spesifik pengguna
- Lihat riwayat pembelian
- Kelola pengaturan akun

## Manajemen State

Aplikasi ini menggunakan Zustand untuk manajemen state di berbagai domain:

- **Otentikasi**: Sesi pengguna, status login
- **Resep**: Daftar resep, pembuatan, pembaruan, penghapusan
- **Keranjang**: Item di keranjang belanja, penambahan/penghapusan item
- **Pembelian**: Pelacakan resep yang telah dibeli
- **Beranda**: Data untuk tampilan layar beranda

## API dan Database

Aplikasi ini menggunakan Supabase sebagai layanan backend:
- Otentikasi dengan email/kata sandi
- Database PostgreSQL untuk resep dan data pengguna
- Penyimpanan untuk gambar resep dan file PDF
- Sinkronisasi data real-time

## Platform yang Didukung

- Android
- iOS
- Web (melalui Expo)

## Script Pengembangan

- `npm start`: Jalankan server pengembangan Expo
- `npm run android`: Jalankan di emulator/perangkat Android
- `npm run ios`: Jalankan di simulator/perangkat iOS
- `npm run web`: Jalankan di browser web
- `npm run lint`: Periksa kode untuk masalah
- `npm run reset-project`: Atur ulang proyek ke kondisi awal

## Pelajari Lebih Lanjut

- [Dokumentasi Expo](https://docs.expo.dev): Panduan komprehensif tentang fitur-fitur Expo
- [Dokumentasi React Native](https://reactnative.dev): Untuk fitur-fitur spesifik React Native
- [Dokumentasi Supabase](https://supabase.com/docs): Untuk detail implementasi backend
- [Dokumentasi Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction): Untuk pola manajemen state

## Kontribusi

1. Fork repositori
2. Buat branch fitur (`git checkout -b fitur/fitur-luar-biasa`)
3. Lakukan perubahan Anda
4. Commit perubahan Anda (`git commit -m 'Tambahkan fitur luar biasa'`)
5. Push ke branch (`git push origin fitur/fitur-luar-biasa`)
6. Buka Pull Request

## Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT - lihat file [LICENSE](LICENSE) untuk detail selengkapnya.
