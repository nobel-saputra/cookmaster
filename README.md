# CookMaster - Aplikasi Manajemen Resep

**Link Video Demo:** https://www.loom.com/share/6c5ad6e522fd48ee9d402cfc50b59181

CookMaster adalah aplikasi manajemen resep yang komprehensif dibangun dengan React Native dan Expo. Aplikasi ini memungkinkan pengguna untuk menemukan, membeli, dan mengelola resep masakan dengan fungsionalitas keranjang belanja terintegrasi, otentikasi pengguna, dan **Deep Link** untuk navigasi langsung ke konten spesifik.

## Fitur-fitur Utama

### Otentikasi & Keamanan

- Sistem login dan pendaftaran yang aman dengan Supabase Auth
- Verifikasi email otomatis
- Session management dengan auto-check
- Validasi form menggunakan Zod (password harus mengandung huruf besar, kecil, dan angka)

### Manajemen Resep (CRUD Lengkap)

- **Create**: Tambah resep baru dengan gambar, deskripsi, bahan, dan langkah-langkah
- **Read**: Jelajahi katalog resep dengan detail lengkap
- **Update**: Edit resep yang sudah dibuat (judul, harga, gambar, dll)
- **Delete**: Hapus resep beserta file terkait dari storage

### Sistem E-Commerce

- Sistem pembelian resep premium
- Keranjang belanja untuk pembelian multiple items
- Riwayat pembelian (purchase history)
- Badge visual untuk resep yang sudah dibeli
- Checkout dan payment flow

### Deep Link Support

- **Custom URL Scheme**: `cookmaster://`
- Navigasi langsung ke halaman resep via link
- Testing command: `npx uri-scheme open cookmaster://resep/[ID] --android`
- Perfect untuk sharing dan notifikasi

### Deferred Deep Link (Custom Implementation)

Fitur ini memungkinkan aplikasi untuk mendeteksi "pending link" saat pertama kali dibuka, berguna untuk skenario instalasi baru dari link promosi.

**Cara Kerja:**

1. Aplikasi mengecek tabel `deferred_links` di Supabase saat startup.
2. Jika ada link dengan status `claimed: false` (diambil yang terbaru), aplikasi akan mengklaimnya (`claimed: true`).
3. User otomatis diarahkan ke halaman target (misal: detail resep) tanpa login ulang.

**Cara Testing:**

1. Buka Supabase Dashboard > Table Editor > `deferred_links`.
2. Insert row baru:
   - `target`: 'recipe'
   - `target_id`: [UUID Resep yang valid]
   - `claimed`: false
3. Restart aplikasi (Reload Expo).
4. Aplikasi akan otomatis masuk ke halaman resep tersebut.

### File Management

- Upload gambar resep (JPEG, PNG)
- Upload file PDF untuk instruksi detail
- Integrasi dengan Supabase Storage
- Auto-delete file saat resep dihapus

### UI/UX Modern

- Animasi halus dengan React Native Reanimated
- Linear gradient effects
- Toast notifications untuk feedback
- Responsive design untuk berbagai ukuran layar

## Teknologi yang Digunakan

### Core Stack

- **Framework**: [Expo SDK 54](https://expo.dev) + React Native
- **Language**: TypeScript + TSX
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Backend**: [Supabase](https://supabase.com)
  - PostgreSQL Database
  - Authentication
  - Storage (Files & Images)
  - Real-time sync

### Navigation & Routing

- **Expo Router**: File-based routing system
- **Deep Linking**: Custom URL scheme support

### UI Components & Styling

- React Native core components
- Expo Vector Icons
- React Native Vector Icons
- Expo Linear Gradient
- React Native Reanimated

### Form & Validation

- [Zod](https://github.com/colinhacks/zod) - Schema validation
- React Native Toast Message

### File Handling

- Expo DocumentPicker
- Expo Image Picker
- base64-arraybuffer
- React Native FS

## Struktur Proyek

```
cookmaster/
├── app/                          # Routes & Screens (Expo Router)
│   ├── (auth)/                   # Auth screens (login, register)
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                   # Main app tabs
│   │   ├── index.tsx             # Home
│   │   ├── explore.tsx           # Browse recipes
│   │   ├── cart.tsx              # Shopping cart
│   │   └── profile.tsx           # User profile
│   ├── resep/                    # Recipe screens
│   │   ├── [id].tsx              # Recipe detail (Deep Link)
│   │   └── add.tsx               # Add new recipe
│   ├── edit/[id].tsx             # Edit recipe screen
│   ├── _layout.tsx               # Root layout (Auth guard)
│   └── index.tsx                 # Entry point
│
├── store/                        # Zustand State Management
│   ├── authStore.ts              # Authentication state
│   ├── resepStore.ts             # Recipe CRUD operations
│   ├── cartStore.ts              # Shopping cart logic
│   ├── purchaseHistory.ts        # Purchase tracking
│   └── homeStore.ts              # Home screen data
│
├── lib/                          # Libraries & Configuration
│   ├── supabaseClient.ts         # Supabase client instance
│   └── supabase.ts               # Supabase config
│
├── components/                   # Reusable UI Components
├── assets/                       # Images & Static files
├── constants/                    # App constants
├── hooks/                        # Custom React Hooks
└── scripts/                      # Development scripts
```

## Instalasi & Setup

### Prerequisites

- Node.js (v16 atau lebih tinggi)
- npm atau yarn
- Expo CLI
- Android Studio (untuk emulator) atau physical device dengan Expo Go

### Langkah Instalasi

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd cookmaster
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup Environment Variables** (Opsional - ada fallback)

   ```bash
   # Buat file .env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run development server**

   ```bash
   npm start
   ```

5. **Run on platform**
   ```bash
   npm run android   # Android emulator/device
   npm run ios       # iOS simulator (macOS only)
   npm run web       # Web browser
   ```

## Testing Deep Link

### Android Emulator/Device

```bash
npx uri-scheme open cookmaster://resep/2b56019b-d6b6-4fd5-a250-433c9ed0799b --android
```

### iOS Simulator

```bash
npx uri-scheme open cookmaster://resep/[RECIPE_ID] --ios
```

**Note**: Deep Link memerlukan **Development Build**, tidak bisa ditest di Expo Go.

## Database Schema (Supabase)

### Table: `resep`

- `id` (uuid, primary key)
- `judul` (text) - Recipe title
- `deskripsi` (text) - Description
- `harga` (numeric) - Price
- `gambar` (text) - Image URL
- `bahan` (jsonb) - Ingredients list
- `langkah` (text[]) - Cooking steps
- `dibuat_oleh` (uuid) - Creator user ID
- `created_at` (timestamp)

### Table: `cart_items`

- `id` (uuid, primary key)
- `resep_id` (uuid, foreign key → resep)
- `user_id` (uuid, foreign key → auth.users)
- `quantity` (integer)
- `created_at` (timestamp)

### Table: `purchase_history`

- `id` (uuid, primary key)
- `resep_id` (uuid, foreign key → resep)
- `user_id` (uuid, foreign key → auth.users)
- `purchased_at` (timestamp)

### Table: `deferred_links`

- `id` (uuid, primary key)
- `created_at` (timestamp)
- `target` (text) - e.g., 'recipe'
- `target_id` (uuid) - ID of the target content
- `claimed` (boolean) - Default: false

## Cara Penggunaan

### Untuk User Biasa

1. **Register/Login** - Buat akun atau masuk dengan email
2. **Browse Recipes** - Lihat katalog resep di tab Explore
3. **View Details** - Klik resep untuk melihat detail lengkap
4. **Add to Cart** - Tambahkan ke keranjang atau beli langsung
5. **Checkout** - Proses pembelian untuk mengakses resep premium
6. **Access Purchased** - Resep yang sudah dibeli ditandai dengan badge

### Untuk Content Creator

1. **Login** sebagai creator
2. **Tambah Resep** - Klik tombol "+" di tab Explore
3. **Upload Media** - Pilih gambar dan/atau file PDF
4. **Set Price** - Tentukan harga resep
5. **Publish** - Simpan resep untuk ditampilkan di katalog
6. **Edit/Delete** - Kelola resep yang sudah dibuat

## Available Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on Web
npm run lint       # Run ESLint
npm run reset-project  # Reset to clean state
```

## Development Tips

### Build untuk Testing Deep Link

```bash
npx expo run:android   # Creates development build
```

### Clear Cache

```bash
npm start --clear
```

### Check Deep Link Scheme

```bash
npx uri-scheme list --android
```

## Dokumentasi Tambahan

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Zustand Guide](https://docs.pmnd.rs/zustand)
- [Expo Deep Linking](https://docs.expo.dev/guides/deep-linking/)

## Troubleshooting

### Build Gagal (NDK Error)

```bash
# Buka Android Studio → SDK Manager → Install NDK (Side by side)
```

### Deep Link Tidak Jalan

- Pastikan menggunakan **Development Build** (bukan Expo Go)
- Cek scheme di `app.json`
- Test dengan command: `npx uri-scheme open cookmaster://resep/[ID] --android`

### Supabase Connection Error

- Cek `.env` atau hardcoded credentials di `lib/supabaseClient.ts`
- Pastikan internet connection aktif

## Kontributor

**I Made Nobel Saputra**  
Pemrograman Mobile - 2026

## License

This project is for educational purposes.

---

**Made with love using Expo & Supabase**
