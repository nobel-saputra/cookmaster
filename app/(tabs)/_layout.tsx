import { useAuthStore } from "@/store/authStore";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";

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
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#00B894",
        tabBarInactiveTintColor: "gray",
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="shopping-cart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
