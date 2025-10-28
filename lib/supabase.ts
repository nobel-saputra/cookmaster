// lib/supabase.ts

// Memuat polyfill URL agar kompatibel dengan React Native
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Inisialisasi URL dan kunci anon Supabase
const SUPABASE_URL = "https://lrafobvtluazrwiwfbha.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyYWZvYnZ0bHVhenJ3aXdmYmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNjMzMDEsImV4cCI6MjA3NjkzOTMwMX0.EoUY3IkcZ9jLPbGrJ6SSvRexbXKLlbrH67g7cMnk784";

// Menentukan penyimpanan sesi berdasarkan platform yang digunakan
let storage: any;
if (Platform.OS !== "web" || typeof window !== "undefined") {
  storage = AsyncStorage;
} else {
  storage = undefined;
}

// Membuat instance Supabase dengan konfigurasi autentikasi yang sesuai
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
