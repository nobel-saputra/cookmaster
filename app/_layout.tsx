// app/_layout.tsx

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { Slot, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  const { isLoggedIn, checkSession } = useAuthStore();
  const router = useRouter();
  const hasHandledInitialRouting = useRef(false);

  useEffect(() => {
    const init = async () => {
      if (hasHandledInitialRouting.current) return;
      hasHandledInitialRouting.current = true;

      // 1️⃣ CLAIM DEFERRED DEEP LINK
      const { data: deferred } = await supabase.from("deferred_links").select("*").eq("claimed", false).order("created_at", { ascending: false }).limit(1).single();

      if (deferred) {
        // tandai sudah dipakai
        await supabase.from("deferred_links").update({ claimed: true }).eq("id", deferred.id);

        // redirect ke target
        if (deferred.target === "recipe") {
          router.replace({
            pathname: "/resep/[id]",
            params: { id: deferred.target_id },
          });
          return; // ⛔ STOP — jangan lanjut auth
        }
      }

      // 2️⃣ AUTH FLOW (JALAN KALAU TIDAK ADA DEFERRED LINK)
      await checkSession();

      if (isLoggedIn) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    };

    init();
  }, [checkSession, isLoggedIn, router]);

  return (
    <>
      <Slot />
      <Toast />
    </>
  );
}
