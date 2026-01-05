/**
 * Recipe Store
 *
 * Store ini mengelola data resep (CRUD operations) dan integrasi dengan Supabase.
 * Menyediakan fungsi untuk fetch, create, update, delete resep beserta file storage.
 */

import { supabase } from "@/lib/supabaseClient";
import { create } from "zustand";

/**
 * Interface untuk data Resep
 */
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

/**
 * Interface untuk Recipe Store State
 */
interface ResepStore {
  resepList: Resep[];
  loading: boolean;
  fetchResep: () => Promise<void>;
  addResep: (newResep: Omit<Resep, "id">) => Promise<void>;
  updateResep: (id: string, updatedResep: Partial<Resep>) => Promise<void>;
  deleteResep: (id: string, imageUrl?: string, pdfUrl?: string) => Promise<void>;
  findResepById: (id: string) => Promise<Resep | null>;
}

// Nama bucket untuk penyimpanan file
const BUCKET_NAME = "resep-images";

/**
 * Utility function untuk ekstrak path file dari URL Supabase Storage
 * @param publicUrl - URL publik file dari Supabase
 * @returns File path atau null jika gagal
 */
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

/**
 * Zustand Store untuk Recipe Management
 */
export const useResepStore = create<ResepStore>((set, get) => ({
  // State awal
  resepList: [],
  loading: false,

  /**
   * Fetch semua resep dari database
   * Diurutkan berdasarkan tanggal pembuatan (newest first)
   */
  fetchResep: async () => {
    set({ loading: true });
    const { data, error } = await supabase.from("resep").select("*").order("created_at", { ascending: false });

    if (!error && data) set({ resepList: data });
    set({ loading: false });
  },

  /**
   * Cari resep berdasarkan ID
   * Cek local state terlebih dahulu untuk optimasi, jika tidak ada baru fetch dari DB
   * @param id - ID resep yang dicari
   * @returns Resep object atau null jika tidak ditemukan
   */
  findResepById: async (id) => {
    // Cek di state lokal dulu
    const existing = get().resepList.find((r) => r.id === id);
    if (existing) return existing;

    // Jika tidak ada, fetch dari database
    const { data, error } = await supabase.from("resep").select("*").eq("id", id).single();
    if (error) return null;
    return data as Resep;
  },

  /**
   * Tambah resep baru ke database
   * @param newResep - Data resep baru (tanpa ID)
   */
  addResep: async (newResep) => {
    const { data, error } = await supabase.from("resep").insert([newResep]).select("*").single();
    if (!error && data) set({ resepList: [data, ...get().resepList] });
  },

  /**
   * Update data resep
   * @param id - ID resep yang akan diupdate
   * @param updatedResep - Data yang akan diupdate (partial)
   */
  updateResep: async (id, updatedResep) => {
    const { data, error } = await supabase.from("resep").update(updatedResep).eq("id", id).select("*").single();
    if (error) throw new Error(error.message);

    // Sinkronisasi dengan state lokal
    const updatedList = get().resepList.map((r) => (r.id === id ? { ...r, ...data } : r));
    set({ resepList: updatedList });
  },

  /**
   * Hapus resep dari database dan storage
   * Menghapus file gambar dan PDF terkait jika ada
   * @param id - ID resep yang akan dihapus
   * @param imageUrl - URL gambar (opsional)
   * @param pdfUrl - URL PDF (opsional)
   */
  deleteResep: async (id, imageUrl, pdfUrl) => {
    // Hapus dari database
    const { error: dbError } = await supabase.from("resep").delete().eq("id", id);
    if (dbError) throw new Error(dbError.message);

    // Hapus file gambar jika ada
    if (imageUrl) {
      const path = getFilePathFromUrl(imageUrl);
      if (path) await supabase.storage.from(BUCKET_NAME).remove([path]);
    }

    // Hapus file PDF jika ada
    if (pdfUrl) {
      const path = getFilePathFromUrl(pdfUrl);
      if (path) await supabase.storage.from(BUCKET_NAME).remove([path]);
    }

    // Update state lokal
    set({ resepList: get().resepList.filter((r) => r.id !== id) });
  },
}));
