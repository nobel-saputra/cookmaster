import { useAuthStore } from "@/store/authStore";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";

export default function TabsLayout() {
  const { isLoggedIn, checkSession } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      await checkSession();
      if (!isLoggedIn) router.replace("/(auth)/login");
    };
    verify();
  }, [isLoggedIn, checkSession, router]);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="cart" options={{ title: "Cart" }} />
    </Tabs>
  );
}
