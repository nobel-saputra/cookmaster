import { supabase } from "@/lib/supabase";
import { create } from "zustand";

// --- Definisi Tipe Supabase Minimal ---
interface SupabaseUser {
  id: string; // Properti utama yang kita butuhkan di cart.tsx
  // Tambahkan properti lain dari objek user Supabase di sini jika diperlukan
}

interface SupabaseSession {
  user: SupabaseUser | null;
  // Tambahkan properti lain dari objek session Supabase di sini jika diperlukan
}
// -------------------------------------

interface AuthState {
  // 💡 Tipe Session diubah dari 'any' menjadi tipe spesifik atau null
  session: SupabaseSession | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoggedIn: false,

  // ✅ LOGIN FUNCTION (tanpa cek verifikasi email)
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) return false;

    // Tipe session kini sesuai dengan SupabaseSession | null
    set({ session: data.session as SupabaseSession, isLoggedIn: true });
    return true;
  },

  // ✅ REGISTER FUNCTION
  register: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    // Tipe session kini sesuai dengan SupabaseSession | null
    set({ session: data.session as SupabaseSession, isLoggedIn: !!data.session });
    return { success: true };
  },

  // ✅ LOGOUT FUNCTION
  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, isLoggedIn: false });
  },

  // ✅ CHECK SESSION FUNCTION
  checkSession: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session as SupabaseSession | null, isLoggedIn: !!data.session });
  },
}));
