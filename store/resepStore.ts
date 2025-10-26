// store/resepStore.ts
import { supabase } from "@/lib/supabaseClient";
import { create } from "zustand";

export interface Resep {
  id?: string;
  judul: string;
  deskripsi: string;
  harga: number;
  gambar?: string;
  bahan: any; // bisa array/object (PDF URL di index 0)
  langkah: string[];
  dibuat_oleh?: string;
  created_at?: string;
}

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

// 🔹 Helper: ambil path file dari URL Supabase Storage
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

export const useResepStore = create<ResepStore>((set, get) => ({
  resepList: [],
  loading: false,

  // 🔸 Ambil semua resep dari database
  fetchResep: async () => {
    set({ loading: true });
    const { data, error } = await supabase.from("resep").select("*").order("created_at", { ascending: false });

    if (!error && data) set({ resepList: data });
    set({ loading: false });
  },

  // 🔸 Cari resep berdasarkan ID (dari state lokal dulu, baru DB)
  findResepById: async (id) => {
    const existing = get().resepList.find((r) => r.id === id);
    if (existing) return existing;

    const { data, error } = await supabase.from("resep").select("*").eq("id", id).single();

    if (error) return null;
    return data as Resep;
  },

  // 🟢 TAMBAH RESEP BARU
  addResep: async (newResep) => {
    const { data, error } = await supabase.from("resep").insert([newResep]).select("*").single();

    if (!error && data) {
      // Tambahkan resep baru ke state paling atas
      set({ resepList: [data, ...get().resepList] });
    }
  },

  // 🟡 EDIT / UPDATE RESEP
  updateResep: async (id, updatedResep) => {
    const { data, error } = await supabase.from("resep").update(updatedResep).eq("id", id).select("*").single();

    if (error) throw new Error(error.message);

    // Update data di state lokal
    const updatedList = get().resepList.map((r) => (r.id === id ? { ...r, ...data } : r));
    set({ resepList: updatedList });
  },

  // 🔴 HAPUS RESEP
  deleteResep: async (id, imageUrl, pdfUrl) => {
    // 1️⃣ Hapus data dari tabel "resep"
    const { error: dbError } = await supabase.from("resep").delete().eq("id", id);
    if (dbError) throw new Error(dbError.message);

    // 2️⃣ Hapus file gambar dari Storage jika ada
    if (imageUrl) {
      const path = getFilePathFromUrl(imageUrl);
      if (path) await supabase.storage.from(BUCKET_NAME).remove([path]);
    }

    // 3️⃣ Hapus file PDF dari Storage jika ada
    if (pdfUrl) {
      const path = getFilePathFromUrl(pdfUrl);
      if (path) await supabase.storage.from(BUCKET_NAME).remove([path]);
    }

    // 4️⃣ Hapus dari state lokal agar langsung hilang di UI
    set({ resepList: get().resepList.filter((r) => r.id !== id) });
  },
}));
