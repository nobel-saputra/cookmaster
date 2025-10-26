// lib/supabase.ts

// PENTING: Import polyfill di awal. Ini aman.
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

// 1. 🛑 MASALAH PERTAMA (Code 1232):
// Import harus tetap di top level, bukan di dalam 'if'.
// Expo/Metro/Webpack akan tahu cara menangani import ini berdasarkan target build.
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = "https://lrafobvtluazrwiwfbha.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyYWZvYnZ0bHVhenJ3aXdmYmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNjMzMDEsImV4cCI6MjA3NjkzOTMwMX0.EoUY3IkcZ9jLPbGrJ6SSvRexbXKLlbrH67g7cMnk784";

// 2. Tentukan variabel storage
let storage: any;

// 3. Terapkan kondisi untuk MENETAPKAN NILAI, BUKAN untuk IMPORT.
// Ini adalah cara yang benar untuk mengatasi masalah SSR/Web/Native.
if (Platform.OS !== "web" || typeof window !== "undefined") {
  // Di sini kita aman untuk menggunakan AsyncStorage yang sudah diimpor.
  storage = AsyncStorage;
} else {
  // Jika kita di Web dan tidak ada 'window' (SSR), biarkan storage undefined.
  storage = undefined;
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // 🔑 Sekarang, 'storage' menggunakan AsyncStorage hanya jika kondisinya aman.
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
