import { useAuthStore } from "@/store/authStore";
import { Button, Text, View } from "react-native";
import Toast from "react-native-toast-message";

export default function HomeScreen() {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    Toast.show({
      type: "success",
      text1: "Logout berhasil",
      text2: "Sampai jumpa lagi!",
    });
  };
  setTimeout(() => 2000);
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>Selamat datang di CookMaster!</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
