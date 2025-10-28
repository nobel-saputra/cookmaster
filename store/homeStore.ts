// store/homeStore.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabase";

// --- Struktur data untuk statistik halaman utama ---
interface HomeStats {
  totalResep: number;
  totalFavorit: number;
  resepTerbaru: {
    id: number;
    judul: string;
    gambar: string | null;
    created_at: string;
  }[];
}

// --- Struktur state dan fungsi utama store ---
interface HomeState {
  stats: HomeStats;
  loading: boolean;
  error: string | null;
  fetchHomeData: () => Promise<void>;
}

// --- Store untuk mengelola data beranda aplikasi ---
export const useHomeStore = create<HomeState>((set) => ({
  stats: {
    totalResep: 0,
    totalFavorit: 0,
    resepTerbaru: [],
  },
  loading: false,
  error: null,

  // Ambil data statistik dan resep terbaru dari Supabase
  fetchHomeData: async () => {
    set({ loading: true, error: null });
    try {
      // Hitung total jumlah resep
      const { count: totalResep, error: resepError } = await supabase.from("resep").select("*", { count: "exact", head: true });

      if (resepError) throw resepError;

      // Ambil 3 resep terbaru berdasarkan tanggal dibuat
      const { data: resepTerbaru, error: terbaruError } = await supabase.from("resep").select("id, judul, gambar, created_at").order("created_at", { ascending: false }).limit(3);

      if (terbaruError) throw terbaruError;

      // Simulasi jumlah favorit (sementara 60% dari total resep)
      const totalFavorit = Math.floor((totalResep || 0) * 0.6);

      set({
        stats: {
          totalResep: totalResep || 0,
          totalFavorit,
          resepTerbaru: resepTerbaru || [],
        },
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Gagal memuat data",
        loading: false,
      });
    }
  },
}));
