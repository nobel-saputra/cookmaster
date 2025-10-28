import { supabase } from "@/lib/supabaseClient";
import { create } from "zustand";

// Struktur data resep
export interface Resep {
  id?: string;
  judul: string;
  deskripsi: string;
  harga: number;
  gambar?: string;
  bahan: any;
  langkah: string[];
  dibuat_oleh?: string;
  created_at?: string;
}

// Tipe state dan fungsi untuk pengelolaan resep
interface ResepStore {
  resepList: Resep[];
  loading: boolean;
  fetchResep: () => Promise<void>;
  addResep: (newResep: Omit<Resep, "id">) => Promise<void>;
  updateResep: (id: string, updatedResep: Partial<Resep>) => Promise<void>;
  deleteResep: (id: string, imageUrl?: string, pdfUrl?: string) => Promise<void>;
  findResepById: (id: string) => Promise<Resep | null>;
}

const BUCKET_NAME = "resep-images";

// Mengambil path file dari URL publik Supabase Storage
const getFilePathFromUrl = (publicUrl: string): string | null => {
  try {
    const url = new URL(publicUrl);
    const idx = url.pathname.indexOf(`/object/public/${BUCKET_NAME}/`);
    if (idx === -1) return null;
    return url.pathname.substring(idx + `/object/public/${BUCKET_NAME}/`.length);
  } catch {
    return null;
  }
};

// Store Zustand untuk mengelola data resep
export const useResepStore = create<ResepStore>((set, get) => ({
  resepList: [],
  loading: false,

  // Mengambil semua resep dari database
  fetchResep: async () => {
    set({ loading: true });
    const { data, error } = await supabase.from("resep").select("*").order("created_at", { ascending: false });

    if (!error && data) set({ resepList: data });
    set({ loading: false });
  },

  // Mencari resep berdasarkan ID (cek state lokal terlebih dahulu)
  findResepById: async (id) => {
    const existing = get().resepList.find((r) => r.id === id);
    if (existing) return existing;

    const { data, error } = await supabase.from("resep").select("*").eq("id", id).single();
    if (error) return null;
    return data as Resep;
  },

  // Menambahkan resep baru ke database dan memperbarui state lokal
  addResep: async (newResep) => {
    const { data, error } = await supabase.from("resep").insert([newResep]).select("*").single();
    if (!error && data) set({ resepList: [data, ...get().resepList] });
  },

  // Memperbarui data resep berdasarkan ID dan sinkronisasi dengan state
  updateResep: async (id, updatedResep) => {
    const { data, error } = await supabase.from("resep").update(updatedResep).eq("id", id).select("*").single();
    if (error) throw new Error(error.message);

    const updatedList = get().resepList.map((r) => (r.id === id ? { ...r, ...data } : r));
    set({ resepList: updatedList });
  },

  // Menghapus resep beserta file terkait dari Supabase Storage
  deleteResep: async (id, imageUrl, pdfUrl) => {
    const { error: dbError } = await supabase.from("resep").delete().eq("id", id);
    if (dbError) throw new Error(dbError.message);

    if (imageUrl) {
      const path = getFilePathFromUrl(imageUrl);
      if (path) await supabase.storage.from(BUCKET_NAME).remove([path]);
    }

    if (pdfUrl) {
      const path = getFilePathFromUrl(pdfUrl);
      if (path) await supabase.storage.from(BUCKET_NAME).remove([path]);
    }

    set({ resepList: get().resepList.filter((r) => r.id !== id) });
  },
}));
