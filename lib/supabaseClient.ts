// Mengimpor fungsi untuk membuat klien Supabase
import { createClient } from "@supabase/supabase-js";

// Mengambil konfigurasi Supabase dari environment variable atau fallback default
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://lrafobvtluazrwiwfbha.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyYWZvYnZ0bHVhenJ3aXdmYmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNjMzMDEsImV4cCI6MjA3NjkzOTMwMX0.EoUY3IkcZ9jLPbGrJ6SSvRexbXKLlbrH67g7cMnk784";

// Validasi URL Supabase agar sesuai format yang benar
if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
  throw new Error("Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.");
}

// Membuat instance Supabase untuk koneksi ke database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
