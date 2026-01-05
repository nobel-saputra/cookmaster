/**
 * Authentication Store
 *
 * Store ini mengelola autentikasi pengguna menggunakan Supabase Auth.
 * Menyediakan fungsi untuk login, register, logout, dan pengecekan session.
 */

import { supabase } from "@/lib/supabase";
import { create } from "zustand";

/**
 * Interface untuk user Supabase
 */
interface SupabaseUser {
  id: string;
}

/**
 * Interface untuk session Supabase
 */
interface SupabaseSession {
  user: SupabaseUser | null;
}

/**
 * Interface untuk Authentication State
 * Mendefinisikan struktur state dan fungsi-fungsi yang tersedia
 */
interface AuthState {
  session: SupabaseSession | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

/**
 * Zustand Store untuk Authentication
 */
export const useAuthStore = create<AuthState>((set) => ({
  // State awal
  session: null,
  isLoggedIn: false,

  /**
   * Login pengguna dengan email dan password
   * @param email - Email pengguna
   * @param password - Password pengguna
   * @returns Promise<boolean> - true jika berhasil, false jika gagal
   */
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) return false;

    set({ session: data.session as SupabaseSession, isLoggedIn: true });
    return true;
  },

  /**
   * Registrasi pengguna baru
   * @param email - Email pengguna baru
   * @param password - Password pengguna baru
   * @returns Promise dengan status success dan pesan error jika ada
   */
  register: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { success: false, message: error.message };

    set({ session: data.session as SupabaseSession, isLoggedIn: !!data.session });
    return { success: true };
  },

  /**
   * Logout pengguna dan hapus session
   */
  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, isLoggedIn: false });
  },

  /**
   * Cek session yang masih aktif dari Supabase
   * Digunakan saat aplikasi pertama kali dibuka
   */
  checkSession: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session as SupabaseSession | null, isLoggedIn: !!data.session });
  },
}));
