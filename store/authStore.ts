// Mengimpor dependensi Supabase dan Zustand untuk manajemen state
import { supabase } from "@/lib/supabase";
import { create } from "zustand";

// Mendefinisikan tipe user dari Supabase yang digunakan dalam aplikasi
interface SupabaseUser {
  id: string;
}

// Mendefinisikan tipe session Supabase untuk autentikasi
interface SupabaseSession {
  user: SupabaseUser | null;
}

// Struktur state autentikasi dan fungsi yang tersedia
interface AuthState {
  session: SupabaseSession | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

// Membuat store Zustand untuk mengelola status autentikasi pengguna
export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoggedIn: false,

  // Fungsi login pengguna menggunakan email dan password
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) return false;
    set({ session: data.session as SupabaseSession, isLoggedIn: true });
    return true;
  },

  // Fungsi registrasi pengguna baru
  register: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { success: false, message: error.message };
    set({ session: data.session as SupabaseSession, isLoggedIn: !!data.session });
    return { success: true };
  },

  // Fungsi logout untuk mengakhiri sesi pengguna
  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, isLoggedIn: false });
  },

  // Fungsi untuk memeriksa sesi pengguna yang masih aktif
  checkSession: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session as SupabaseSession | null, isLoggedIn: !!data.session });
  },
}));
