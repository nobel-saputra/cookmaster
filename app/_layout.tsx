/**
 * Root Layout Component
 *
 * Komponen ini berfungsi sebagai wrapper utama aplikasi yang menangani:
 * - Session management (pengecekan status login pengguna)
 * - Authentication routing (redirect ke halaman sesuai status login)
 * - Global Toast notifications
 */

import { useAuthStore } from "@/store/authStore";
import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  // Ambil state dan fungsi dari authentication store
  const { isLoggedIn, checkSession } = useAuthStore();
  const router = useRouter();

  /**
   * Effect untuk verifikasi session saat aplikasi pertama kali dimuat
   * Akan mengecek apakah user sudah login atau belum, lalu melakukan redirect
   */
  useEffect(() => {
    const verify = async () => {
      // Cek session dari Supabase
      await checkSession();

      // Redirect berdasarkan status login
      if (isLoggedIn) {
        // Jika sudah login, arahkan ke halaman utama (tabs)
        router.replace({
          pathname: "/(tabs)",
        });
      } else {
        // Jika belum login, arahkan ke halaman login
        router.replace({
          pathname: "/(auth)/login",
        });
      }
    };

    verify();
  }, [isLoggedIn, checkSession, router]);

  return (
    <>
      {/* Slot untuk render child routes */}
      <Slot />

      {/* Toast component untuk notifikasi global */}
      <Toast />
    </>
  );
}
