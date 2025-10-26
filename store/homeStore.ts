// store/homeStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface HomeStats {
  totalResep: number;
  totalFavorit: number;
  resepTerbaru: Array<{
    id: number;
    judul: string;
    gambar: string | null;
    created_at: string;
  }>;
}

interface HomeState {
  stats: HomeStats;
  loading: boolean;
  error: string | null;
  fetchHomeData: () => Promise<void>;
}

export const useHomeStore = create<HomeState>((set) => ({
  stats: {
    totalResep: 0,
    totalFavorit: 0,
    resepTerbaru: [],
  },
  loading: false,
  error: null,

  fetchHomeData: async () => {
    set({ loading: true, error: null });
    try {
      // Fetch total resep
      const { count: totalResep, error: resepError } = await supabase
        .from('resep')
        .select('*', { count: 'exact', head: true });

      if (resepError) throw resepError;

      // Fetch resep terbaru (3 resep terakhir)
      const { data: resepTerbaru, error: terbaruError } = await supabase
        .from('resep')
        .select('id, judul, gambar, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (terbaruError) throw terbaruError;

      // Untuk favorite, kita bisa tambahkan nanti jika ada tabel favorit
      // Sementara ini hardcode atau hitung dari view count
      const totalFavorit = Math.floor((totalResep || 0) * 0.6); // simulasi 60% resep di-favorit

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
        error: error instanceof Error ? error.message : 'Gagal memuat data',
        loading: false 
      });
    }
  },
}));