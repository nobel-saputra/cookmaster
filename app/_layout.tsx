// app/_layout.tsx

import { useAuthStore } from "@/store/authStore";
import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  const { isLoggedIn, checkSession } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      await checkSession();
      if (isLoggedIn) router.replace("/(tabs)");
      else router.replace("/(auth)/login");
    };
    verify();
  }, [isLoggedIn, checkSession, router]);

  return (
    <>
      <Slot />
      <Toast />
    </>
  );
}
