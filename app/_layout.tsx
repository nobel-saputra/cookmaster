// app/_layout.tsx

// Mengimpor dependensi yang dibutuhkan untuk autentikasi, navigasi, dan notifikasi
import { useAuthStore } from "@/store/authStore";
import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  // Mengambil status login dan fungsi pengecekan sesi dari store
  const { isLoggedIn, checkSession } = useAuthStore();
  const router = useRouter();

  // Mengecek sesi pengguna dan mengarahkan ke halaman sesuai status login
  useEffect(() => {
    const verify = async () => {
      await checkSession();
      if (isLoggedIn) router.replace("/(tabs)");
      else router.replace("/(auth)/login");
    };
    verify();
  }, [isLoggedIn, checkSession, router]);

  // Menampilkan komponen utama aplikasi dan notifikasi toast
  return (
    <>
      <Slot />
      <Toast />
    </>
  );
}
